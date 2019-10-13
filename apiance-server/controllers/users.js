const db = require('../models/users')
const moment = require('moment');
const dot = require('dot-object');

db.ensureIndex({ fieldName: 'username', unique: true }, function (err) {
});

// Return the list of all articles
exports.findAll = async (request, response) => {
    db.find({}, function (err, docs) {
        response.send(docs);
    });

};

exports.findByUsername = async (request, response) => {
    db.find({ username: request.params.id }, function (err, docs) {
        if (err) {
            response.status(500).send({ error: err });
        } else {
            response.send(docs[0])
        }
    });
};

exports.create = async (request, response) => {
    var newDoc = {
        username: request.params.username,
        lastLogin: request.params.username,
        role: 'user'
    }

    db.insert(contract, function (err, newDoc) {
        if (err) {
            console.err(err)
            response.status(500).send({ error: err.toString() });
        } else {
            response.send(newDoc._id);
        }
    });
};

exports.update = async (request, response) => {
    response.send([]);
};

exports.delete = async (request, response) => {
    response.send([]);
};

exports.clear = async (request, response) => {
};

/*
    Promisified database DAO
*/
exports.dao = {}

exports.dao.findById = async (id) => {
    return new Promise((resolve, reject) => {
        db.find({ _id: id }, function (err, docs) {
            if (err) {
                reject(err);
            } else {
                resolve(docs[0]);
            }
        })
    });
};
exports.dao.findByUsername = (username) => {
    return new Promise((resolve, reject) => {
        db.find({ username: username }, function (err, docs) {
            if (err) {
                reject(err);
            } else {
                resolve(docs[0]);
            }
        })
    });
}
exports.dao.upsert = async (user) => {
    var newDoc = user;
    user.dtUpdate = moment().unix()

    return new Promise((resolve, reject) => {
        db.update({ username: user.username }, user, { upsert: true, multi: false, returnUpdatedDocs: true }, function (err, numAffected, affectedDocuments, upsert) {
            if (err) {
                reject(null);
            } else {
                resolve(affectedDocuments._id);
            }
        })
    });
};