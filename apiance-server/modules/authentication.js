const _ = require('lodash');
const authenticationActivation = process.env.WEBAPP_AUTHENTICATION_ACTIVATION || true;
const passport = require("passport");
const passportJWT = require("passport-jwt");
const passportLDAP = require('passport-ldapauth');
const usersController = require('../controllers/users');
const ldapConfig = require('../config/ldap');

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;
var LdapStrategy = passportLDAP.Strategy;

var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'supersecretkey';

var strategyJWT = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
    usersController.dao.findById(jwt_payload.id).then((user) => {
        next(null, user);
    }, (error) => {
        next(null, false);
    });
});


passport.use(strategyJWT);
passport.use(new LdapStrategy(ldapConfig.ldap));

module.exports.jwtOptions = jwtOptions;

module.exports.initialize = function initialize() {
    return passport.initialize();
}
module.exports.basicJWT = function basicJWT() {
    return passport.authenticate('jwt', { session: false });
}

module.exports.basicLDAP = function basicLDAP() {
    if (authenticationActivation == 'false') {
        return (req, res, next) => {
            req.user = {
                dn: 'dummy'
            }

            return next();
        }
    } else {
        return (req, res, next) => {
            const authorization = req.get('Authorization');

            if (!authorization) {
                // Send the request for Basic Authentication and exit
                res.set('WWW-Authenticate', 'Basic').status(401).json({
                    message: 'Missing header',
                });
                return next();
            }


            // Do the authentication
            return passport.authenticate('ldapauth', (err, userLdap, info) => {
                if (err) {
                    return next(err);
                }

                if (!userLdap) {
                    // Authentication failed
                    return res.set('WWW-Authenticate', 'Basic').status(401).json(info || {});
                } else {
                    req.user = userLdap;

                    return next();
                }
            })(req, res, next);
        };
    }
};