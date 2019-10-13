const authenticationActivation = process.env.WEBAPP_AUTHENTICATION_ACTIVATION || true;
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const users = require('../models/users')
const authentication = require('../modules/authentication');
const usersController = require('../controllers/users');
const moment = require('moment');
const uuidv4 = require('uuid/v4');

exports.login = async (request, response) => {
    // The user is validated by the ldap authentication policy
    // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
    if (authenticationActivation === true) {
        var userLdap = request.user;

        var user = await usersController.dao.findByUsername(userLdap.dn);

        var docUser = {};
        if (user) {
            docUser = { username: userLdap.dn, lastLogin: moment().unix() };
        } else {
            docUser = {
                username: userLdap.dn,
                lastLogin: moment().unix(),
                role: 'user',
                dtInsert: moment().unix()
            };
        }

        let _id = await usersController.dao.upsert(docUser);
        if (_id) {
            var token = jwt.sign({ id: _id },
                authentication.jwtOptions.secretOrKey,
                { expiresIn: '30m' });
            response.json({ message: "ok", token: token });
        } else {
            response.status(500).send({ message: 'An error occured' });
        }
    } else {
        var token = jwt.sign({ id: uuidv4() }, authentication.jwtOptions.secretOrKey, { expiresIn: '30m' });
        response.json({ message: "ok_with_authent_deactivated", token: token });
    }
};

exports.invalidate = async (request, response) => {
    // remove any token cookie
    response.cookie('token', '');

    response.json({
        success: true,
        message: 'Token terminated'
    });
};