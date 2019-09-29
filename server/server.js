// =================================================================
// get the packages we need ========================================
// =================================================================
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var formidable = require('formidable');

var winston = require('winston');
var expressWinston = require('express-winston');
var logger = require("./app/utils/logger");


var config = require('./config'); // get our config file

var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var refreshTokens = {} // store granted refresh token
var randtoken = require('rand-token')


var path = require('path');
var mv = require('mv');
var fs = require('fs');
var mkdirp = require('mkdirp');

var ldap = require('ldapjs');

const ldapConfig = {
    url: config.ldapUrl,
    timeout: config.ldapTimeout,
    connectTimeout: config.ldapConnectTimeout,
    reconnect: true,
    tlsOptions: {
        'rejectUnauthorized': false
    }
};

var cookieParser = require('cookie-parser');

var DBEngine = require('tingodb')();

const uuidv1 = require('uuid/v1');
const DATA_DIR = config.dataBaseDir;
const DB_DATA_DIR = DATA_DIR + '/db';

const https = require('https');
// accept self signed certificate on https call
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
app.disable('etag');

const Influx = require('influx');

/***********************************************************************************************************/

logger.info('ldap server is at ' + config.ldapUrl);

// =================================================================
// configuration ===================================================
// =================================================================
var port = process.env.PORT || 3000;

// Create base data and db directory
mkdirp(DB_DATA_DIR, function (err) {
    if (err) {
        logger.error('can not create dir for contract ', err)
        throw err;
    }
});

var dbs = new DBEngine.Db(DB_DATA_DIR, {});
var db = {};
db.contracts = dbs.collection('contracts');
db.users = dbs.collection('users');

app.set('x-powered-by', false);
app.set('superSecret', config.secret); // secret variable
logger.debug('token secret is ' + app.get('superSecret'));

const tokenExpiracy = config.tokenExpiracy;
logger.debug('tokenExpiracy : ' + tokenExpiracy);

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// use winston to log requests to the console
expressWinston.responseWhitelist.push('body');
app.use(expressWinston.logger({
    winstonInstance: logger,
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    msg: "{{req.method}}>{{req.url}} - status={{res.statusCode}} - responseTime={{res.responseTime}}ms",
    expressFormat: false, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    ignoreRoute: function (req, res) {
        return false;
    } // optional: allows to skip some log messages based on request and/or response
}));

app.use(cookieParser());

// If our applicatione encounters an error, we'll display the error and stacktrace accordingly.
app.use(function (err, req, res, next) {
    logger.error('error happened : ' + err.name);
    if (err.name === 'UnauthorizedError') {

        if (jsonAccepted(req)) {
            res.status(403).json({
                success: false,
                message: 'Invalid token or no token provided: ' + err.message
            });
        } else {
            res.status(401).redirect('/login?error=' + err.name);
        }
    } else {
        if (jsonAccepted(req)) {
            res.status(err.status || 500).json({
                success: false,
                message: 'Internal server error: ' + err.message
            });
        } else {
            logger.info('error has come : ' + JSON.stringify(err));
            res.redirect('/error?message=' + err.message);
        }
    }
});

// Current session information, will handle valid tokens
var sessions = {};
const sessionLifetime = config.tokenExpiracy * 60 * 1000; // in milliseconds
setInterval(function () {

    for (var sessionID in sessions)
        if (sessions[sessionID].old)
            delete sessions[sessionID];
        else
            sessions[sessionID].old = true;

}, sessionLifetime);

// =================================================================
// routes unauthenticated ==========================================
// =================================================================

// serves static files in public directory
app.use('/static', express.static('app/public'));

// serves login page
app.get('/login', function (req, res) {
    res.sendFile(path.join(__dirname + '/app/public/login.html'));
});

// authentication
app.post('/api/auth/login', function (req, res) {
    var username = req.body.username;
    var userPassword = req.body.password;
    dn = 'uid=' + username + ',' + config.baseUserPath;

    getUserInLdap(username, function (ldapUser, err) {
        if (err) {
            if (jsonAccepted(req)) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid credentials : unknown user ' + username
                });
            } else {
                res.redirect('/login?error=unkown')
            }
        } else {
            logger.info('found ldapUser: ', JSON.stringify(ldapUser));
            var userDn = ldapUser.dn;

            authenticateDN(userDn, userPassword, function (isAuthenticated) {
                if (isAuthenticated) {
                    logger.debug('add ldapUser to token ' + JSON.stringify(ldapUser));
                    var newTokenData = createToken(ldapUser, res);
                    sessions[newTokenData.token] = newTokenData;

                    if (jsonAccepted(req)) {
                        res.json({
                            success: true,
                            message: 'Enjoy your token!',
                            token: newTokenData.token,
                            refreshToken: newTokenData.refreshToken
                        });
                    } else {
                        res.redirect('/');
                    }
                } else {
                    if (jsonAccepted(req)) {
                        res.status(401).json({
                            success: false,
                            message: 'Invalid credentials'
                        });
                    } else {
                        res.redirect('/login?error=invalid');
                    }
                }
            });
        }
    });

});

// create jwt token with refresh token from user and set cookie
function createToken(user, res) {
    user.sessionId = randtoken.uid(256);
    var token = jwt.sign(user, app.get('superSecret'), {
        expiresIn: (tokenExpiracy * 60)
    });
    var refreshToken = randtoken.uid(256);
    refreshTokens[refreshToken] = user.login;

    res.cookie('token', token);
    res.cookie('refreshToken', refreshToken);
    return {
        token: token,
        refreshToken: refreshToken
    };
}

// delete cookie, TODO: should invalidate token wip
app.get('/api/auth/invalidate', function (req, res) {
    // remove any token cookie
    res.cookie('token', '');
    // delete token from valid sessions
    delete sessions[getToken(req)];

    if (jsonAccepted(req)) {
        res.json({
            success: true,
            message: 'Token terminated'
        });
    } else {
        res.redirect('/login');
    }
});

// ---------------------------------------------------------
// route middleware to authenticate and check token
// ---------------------------------------------------------
app.use(function (req, res, next) {
    res.header('X-Powered-by', 'API-Hour');

    // check headers or url parameters or post parameters for token
    var token = getToken(req);
    if (!sessions[token]) {
        token = null;
    }

    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if (err) {
                if (jsonAccepted(req)) {
                    return res.status(401).json({
                        success: false,
                        message: 'Failed to authenticate token.'
                    });
                } else {
                    res.status(401).redirect('/login');
                }
            } else {
                // console.log('found valid token', token);
                // if everything is good, save to request for use in other routes
                req.currentUser = decoded;
                next();
            }
        });

    } else {

        // if there is no token of token no more in sessions
        if (jsonAccepted(req)) {
            // return an error
            return res.status(401).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            res.redirect('/login');
        }
    }

}); // filter authentication

// extract token from request
function getToken(req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
        return req.query.token;
    } else if (req.body && req.body.token) {
        return req.body.token;
    } else if (req.params && req.params.token) {
        return req.params.token;
    } else if (req.headers && req.headers['x-access-token']) {
        return req.headers['x-access-token'];
    } else if (req.cookies && req.cookies.token) {
        return req.cookies.token;
    }
    return null;
}

// ---------------------------------------------------------
// authenticated routes
// ---------------------------------------------------------

// create new api in DB and saves contract file to disk
app.post('/api/contracts', function (req, res) {
    checkRole('admin', req, res, function () {

        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) { // tel/0.2/adresses
            logger.info('Add new swagger def from file ' + JSON.stringify(fields));
            var clientId = fields.clientId;

            if (req.currentUser.roles.indexOf('admin') === -1) { //clients admin

                var clientsAdmin = req.currentUser.clientsAdmin; //TODO: filter by client admin

                if (clientsAdmin.indexOf(clientId) === -1) {
                    res.status(403).end();
                    return;
                }
            }

            var zone = fields.zone;
            var version = fields.version;
            var versionTokens = version.split('.');
            var baseVersion = versionTokens[0] + '.' + versionTokens[1];
            var resourceName = fields.resource;

            var uploadedFilePath = files.contractFile.path;

            var apiBasePath = clientId + '/' + baseVersion + '/' + resourceName;

            var resourcePath = '/contracts/' + clientId + '/' + zone + '/' + resourceName;
            var newFileResourceDir = DATA_DIR + resourcePath;

            var resourceVersionFile = resourceName + '-' + version + '.yml';
            var newFilePathOnDisk = newFileResourceDir + '/' + resourceVersionFile;
            var swaggerFileUrl = resourcePath + '/' + resourceVersionFile;

            logger.debug('saving to ' + newFilePathOnDisk);

            mkdirp(newFileResourceDir, function (err) {
                if (err) {
                    logger.error('can not create dir for contract ' + err);
                    res.status(500).json({
                        status: 'ERROR',
                        message: 'Can not create dir'
                    });
                } else {
                    mv(uploadedFilePath, newFilePathOnDisk, function (errMove) {
                        if (errMove) {
                            logger.error('can not move uploaded contract ' + errMove);
                            res.status(500).json({
                                status: 'ERROR',
                                message: 'Can not save file'
                            });
                        } else {
                            // save to db
                            db.contracts.insert({
                                clientId: clientId,
                                zone: zone,
                                baseVersion: baseVersion,
                                version: version,
                                resourceName: resourceName,
                                apiBasePath: apiBasePath,
                                swaggerFileUrl: swaggerFileUrl,
                                visible: 'true'
                            }, function (errSaveDb, newDoc) {
                                if (errSaveDb) {
                                    logger.error('error while saving contract to db : ' + JSON.stringify(errSaveDb));
                                    res.status(500).json({
                                        success: false,
                                        message: 'error while saving contract to db'
                                    });
                                } else {
                                    logger.info('contract saved with id ', newDoc._id);
                                    res.status(201).json(newDoc[0]);
                                }
                            });
                        }

                    });
                }
            });

        });
    });


});

// serves index.html
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/app/public/index.html'));
}); // index.html

// modify an api in DB
app.put('/api/contracts/:id', function (req, res) {
    checkRole('admin', req, res, function () {

        if (req.currentUser.roles.indexOf('admin') === -1) { //clients admin
            var clientId = req.header("X-clientId");

            var clientsAdmin = req.currentUser.clientsAdmin; //TODO: filter by client admin

            if (clientsAdmin.indexOf(clientId) === -1) {
                res.status(403).end();
                return;
            }
        }

        logger.info('update contract #' + req.params.id + ' : ' + JSON.stringify(req.body));
        var showHide = req.query['no'];
        db.contracts.update({
            _id: req.params.id
        }, {
            $set: req.body
        }, {}, function (err, numReplaced) {
            logger.info('numReplaced : ' + numReplaced);
            if (numReplaced) {
                db.contracts.findOne({
                    _id: req.params.id
                }, function (err, aContract) {
                    res.json(aContract);
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Unkown contract'
                });
            }
        });
    });
});

// delete an api in DB, TODO: should delete the contract file too
app.delete('/api/contracts/:id', function (req, res) {
    checkRole('admin', req, res, function () {

        if (req.currentUser.roles.indexOf('admin') === -1) { //clients admin
            var clientId = req.header("X-clientId");

            var clientsAdmin = req.currentUser.clientsAdmin; //TODO: filter by client admin

            if (clientsAdmin.indexOf(clientId) === -1) {
                res.status(403).end();
                return;
            }
        }

        logger.info('delete contract #' + req.params.id);
        db.contracts.remove({
            _id: req.params.id
        }, {}, function (err, numRemoved) {
            if (numRemoved) {
                res.end();
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Unkown contract'
                });
            }
        });
    });
});

// verify token and return token data including logged user
app.get('/api/auth/token/verify', function (req, res) {
    res.json(req.currentUser);
});

// refresh the token using refreshToken
app.post('/api/auth/token/refresh', function (req, res) {
    var username = req.body.username;
    var refreshToken = req.body.refreshToken;
    logger.info('check token with body : ' + JSON.stringify(req.body));
    if ((refreshToken in refreshTokens) && (refreshTokens[refreshToken] == username)) {
        delete refreshTokens[refreshToken];
        var user = req.currentUser;
        var newTokenData = createToken(user, res);
        res.json({
            success: true,
            message: 'Enjoy your new token !',
            token: newTokenData.token,
            refreshToken: newTokenData.refreshToken
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }
});

// list available contracts, TODO: review path name
app.get('/api/contracts', function (req, res) {
    findContracts(req.currentUser, {}, function (contracts, err) {
        if (err) {
            res.status(500).json({
                success: false,
                message: 'error while fetching contracts :' + err.message
            });
        } else {
            res.json(contracts);
        }
    });
});
app.get('/api/contractsOLD', function (req, res) {
    var user = req.currentUser; // user from token
    var searchFilter = null; // no filter
    if (user.roles.indexOf('admin') > -1) {
        // no filter for admins
        searchFilter = {};
    } else {
        var roleData = null;
        var clientFilter = [];
        for (i = 0; i < user.roles.length; i++) {
            roleData = user.roles[i].split('-');
            if (roleData[0] == 'client') {
                logger.debug('add client ' + roleData[1] + ' to filter');
                clientFilter.push({
                    clientId: roleData[1]
                });
            }
        }
        logger.debug('clientFilter is ' + JSON.stringify(clientFilter));
        if (clientFilter.length) {
            searchFilter = {};
            searchFilter['$or'] = clientFilter;
        }
    }
    if (searchFilter != null) {
        logger.info('searching clients with filter ' + JSON.stringify(searchFilter));
        var findFilter = {};
        findFilter['$and'] = [{
            visible: 'true'
        }, searchFilter];
        var contracts = db.contracts.find(findFilter).sort({
            clientId: 1,
            resourceName: 1,
            zone: 1,
            version: 1
        }).toArray(function (err, items) {
            if (err) {
                logger.error('error while fetching contracts : ' + JSON.stringify(err))
                res.status(500).json({
                    success: false,
                    message: 'error while fetching contracts'
                });
            } else {
                res.json(items);
            }
        });

    } else {
        // no filter set, return empty list
        res.status(200).json([]);
    }
});

// serves static contracts files located in data dir
app.use('/api/contracts/', express.static(DATA_DIR + '/contracts'));

// ADMIN: list available contracts, TODO: review path name
app.get('/api/managelist', function (req, res) {
    var filter = {};

    if (req.currentUser.roles.indexOf('admin') === -1) { //clientsAdmin
        var clientsAdmin = req.currentUser.clientsAdmin; //TODO: filter by client admin

        if (clientsAdmin.length > 0) {
            var clientsAdminFilter = {
                '$or': []
            };
            filter = {
                '$and': []
            };

            for (var i = 0; i < clientsAdmin.length; i++) {
                clientsAdminFilter['$or'].push({
                    clientId: clientsAdmin[i]
                });
            }

            filter['$and'].push(clientsAdminFilter);
        }
    }

    checkRole('admin', req, res, function () {
        var contracts = db.contracts.find(filter).sort({
            clientId: 1,
            resourceName: 1,
            zone: 1,
            version: 1
        }).toArray(function (err, items) {
            res.json(items);
        });
    });
});

// get user by its username (uid in ldap)
app.get('/api/user/:username', function (req, res) {

    username = req.params.username;
    getUserInLdap(username, function (ldapUser, err) {
        if (err) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials : unknown user ' + username
            });
        } else {
            res.json(ldapUser);
        }
    });
});

// =================================================================
// start the server ================================================
// =================================================================
app.listen(port, function () {
    logger.info('Server started on port ' + port);
});

// =================================================================
// global functions ================================================
// =================================================================

// Is content type json accepted
function jsonAccepted(req) {
    var jsonOK = /application\/json/.test(req.headers.accept);
    return jsonOK;
}

// add a dn as a member of a group
function addToGroup(client, dn, groupName) {
    var groupDn = 'uid=' + groupName + config.baseGroupsPath;
    var change = new ldap.Change({
        operation: 'add',
        modification: {
            member: [dn]
        }
    });

    client.modify(groupDn, change, function (err, res) {
        if (err) {
            logger.error("Looks like group add FAILED: " + JSON.stringify(err));
        } else {
            logger.ingo("Looks like group add WORKED: " + JSON.stringify(res));
        }
    });
}

// convert ldap entry to a user object
function toUser(userEntry) {
    return {
        dn: userEntry.dn,
        login: userEntry.uid,
        fullName: userEntry.cn,
        firstName: userEntry.givenName,
        lastName: userEntry.sn,
        mail: userEntry.mail
    };
}

// LDAP: find a user by its username (uid) and retrieve its roles (groups)
function getUserInLdap(uid, callback) {
    var getUserLdapClient = ldap.createClient(ldapConfig);
    logger.debug('search user : ' + uid);

    getUserLdapClient.bind(config.bindDn, config.bindCredentials, function (err) {
        if (err) {
            logger.error('can not bind as admin : ' + JSON.stringify(err));
            callback(err, undefined);
        }
        var opts = {
            filter: '(&(objectclass=person)(uid=' + uid + '))',
            scope: 'sub',
            //attributes: ['uid','cn','mail', 'givenName', 'sn', 'memberOf']
            //attributes: ['uid','cn','mail','memberOf']
            //attributes: ['objectGUID']
        };

        getUserLdapClient.search(config.baseUserPath, opts, function (searchErr, searchResult) {
            var user = null;
            searchResult.on('searchEntry', function (entry) {
                user = toUser(entry.object);
                user.roles = [];
                getGroupsOfUser(entry.object.dn, function (roles, err) {
                    if (err) {
                        logger.error('can not find roles for user : ' + JSON.stringify(err));
                        callback(null, err);
                    } else if (roles) {
                        logger.debug('found roles for user : ' + JSON.stringify(roles));
                        user.roles = roles;
                        user.clientsAdmin = [];

                        for (var i = 0; i < roles.length; i++) {
                            var client = roles[i].match(/[^\-]+-([^\-]+)-admin/); //retrieve admin client
                            if (client !== null) user.clientsAdmin.push(client[1]);
                        }

                        callback(user);
                    }
                });
                // callback(null,toUser(entry.object));

                // now search role of this user


                logger.debug('searching groups for user dn ' + entry.object.dn);
                //TODO : ad groups

                // callback(null,toUser(entry.object));
            });
            searchResult.on('error', function (searchErr) {
                logger.error('error user search : ' + JSON.stringify(searchErr));
                // client.unbind(function(searchErrRoles) {if(searchErrRoles){console.log(error.message);} else{console.log('client disconnected [get roles]');}});
                callback(null, searchErr);
            });
            searchResult.on('end', function (searchErr) {
                // console.error('end user search: ', searchErr);
                logger.debug('end user search');
                //callback(searchErr, undefined);
                getUserLdapClient.unbind(function (searchErr) {
                    if (searchErr) {
                        logger.error(searchErr.message);
                    } else {
                        logger.debug('client disconnected [getUserInLdap]');
                    }
                });
                // callback(null, user);

            });
        });


    });
}

function getGroupsOfUser(dn, callback) {
    var ldapClientSearchGroups = ldap.createClient(ldapConfig);
    ldapClientSearchGroups.bind(config.bindDn, config.bindCredentials, function (err) {
        if (err) {
            logger.error('can not bind as admin : ' + JSON.stringify(err));
            callback(null, err);
        }

        var rolesOpts = {
            filter: '(&(member=' + dn + ')(cn=apidocs-*))',
            scope: 'sub',
            attributes: ['cn']
        };
        var roles = [];
        ldapClientSearchGroups.search(config.baseGroupsPath, rolesOpts, function (searchErrRoles, searchResultRoles) {
            if (searchErrRoles) {
                logger.error('List groups error:' + JSON.stringify(err));
                return callback(null, err);
            }

            searchResultRoles.on('searchEntry', function (groupEntry) {
                // console.log('found role : ', JSON.stringify(groupEntry.object));
                roles.push(groupEntry.object.cn.substring('apidocs-'.length));
            });
            searchResultRoles.on('error', function (searchErrRoles) {
                logger.error('error finding roles: ' + JSON.stringify(searchErrRoles));
                // callback(searchErrRoles, user);
            });
            searchResultRoles.on('end', function (searchErrRoles) {
                // console.error('end group search: ', searchErr);
                logger.debug('end group search' + JSON.stringify(roles));
                console.log('found roles :', roles);
                //callback(searchErr, undefined);
                ldapClientSearchGroups.unbind(function (searchErrRoles) {
                    if (searchErrRoles) {
                        logger.error(error.message);
                    } else {
                        logger.debug('client disconnected [getGroupsOfUser]');
                    }
                });
                // callback(null, user);
                callback(roles);
            });
        });
    });

}

// LDAP: authenticate a user with its username and password, simple ldap bind
function authenticateDN(dn, password, callback) {
    var clientForAuthentication = ldap.createClient(ldapConfig);
    clientForAuthentication.bind(config.bindDn, config.bindCredentials, function (err) {
        clientForAuthentication.unbind(function (bindErr) {
            if (bindErr) {
                logger.error(bindErr.message);
            } else {
                logger.debug('client disconnected [authenticateDN]');
            }
        });
        callback((err === null));
    });
}

function findContracts(user, filter, callback) {
    var searchFilter = null; // no filter
    if (user.roles.indexOf('admin') > -1) {
        // no filter for admins
        searchFilter = {};
    } else {
        var roleData = null;
        var clientFilter = [];
        for (i = 0; i < user.roles.length; i++) {
            roleData = user.roles[i].split('-');
            if (roleData[0] == 'client') {
                logger.debug('add client ' + roleData[1] + ' to filter');
                clientFilter.push({
                    clientId: roleData[1]
                });
            }
        }
        logger.debug('clientFilter is ' + JSON.stringify(clientFilter));
        if (clientFilter.length) {
            searchFilter = {};
            searchFilter['$or'] = clientFilter;
        }
    }

    if (searchFilter != null) {
        logger.info('searching clients with filter ' + JSON.stringify(searchFilter));
        var findFilter = {};
        findFilter['$and'] = [{
            visible: 'true'
        }, searchFilter];

        if (filter != undefined) {
            if (filter['clientId']) {}
        }

        var contracts = db.contracts.find(findFilter).sort({
            clientId: 1,
            resourceName: 1,
            zone: 1,
            version: 1
        }).toArray(function (err, items) {
            if (err) {
                logger.error('error while fetching contracts : ' + JSON.stringify(err));
                callback(null, err);
            } else {
                callback(items);
            }
        });

    } else {
        // no filter set, return empty list
        callback([]);
    }
}

// check if user has role (ie: is in ldap group)
function checkRole(roleName, req, res, callback) {
    var user = req.currentUser;
    if ((user.roles && user.roles.indexOf(roleName) > -1) || user.clientsAdmin.length > 0) {
        callback();
    } else {
        // role not found, issue error
        res.status(403).json({
            success: false,
            message: 'Forbidden'
        });
    }
}

/*#################################################*/
// get the gateway state for all gateways
function getGatewayState(gatewaysInfosIni, gatewaysState, initres) {
    var gatewayState = "";
    var now = new Date(Date.now()).toTimeString();

    var gatewaysInfos = [].concat(gatewaysInfosIni);

    if (gatewaysInfos.length != 0) {
        var gatewayInfos = gatewaysInfos[0];
        var options = {
            hostname: gatewayInfos.url,
            port: gatewayInfos.port,
            path: '/ssg/ping',
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + new Buffer(gatewayInfos.username + ':' + gatewayInfos.password).toString('base64')
            }
        };

        var req = https.request(options, (res) => {
            res.on('data', (payload) => {
                payload += "";

                var row = payload.split("<tr>");

                if (row != null && row.length > 0) {
                    var globalState = "";
                    var gate1 = "KO";
                    var gate2 = "KO";

                    if (row.length > 2 && row[2].search('OK')) {
                        gate1 = "OK";
                    }

                    if (gatewayInfos.nbNodes == 2) {
                        if (row.length > 3 && row[3].search('OK')) {
                            gate2 = "OK";
                        }
                    }
                    if (gatewayInfos.nbNodes == 1) {
                        if (gate1 === 'OK') {
                            globalState = 'OK';
                        } else {
                            globalState = 'KO';
                        }
                    }
                    if (gatewayInfos.nbNodes == 2) {
                        if (gate1 === 'OK' && gate2 === 'OK') {
                            globalState = 'OK';
                        }
                        if (gate1 === 'OK' && gate2 === 'KO') {
                            globalState = 'WARNING';
                        }
                        if (gate1 === 'KO' && gate2 === 'OK') {
                            globalState = 'WARNING';
                        }
                        if (gate1 === 'KO' && gate2 === 'KO') {
                            globalState = 'KO';
                        }
                    }

                    gatewayState = {
                        "env": gatewayInfos.env,
                        "libelle": gatewayInfos.libelle,
                        "nbNodes": gatewayInfos.nbNodes,
                        "checkedDate": now,
                        "GlobalStatus": globalState,
                        "Gateway1Status": gate1,
                        "Gateway2Status": gate2
                    }
                }
                gatewaysInfos.shift();
                gatewaysState.push(gatewayState);

                getGatewayState(gatewaysInfos, gatewaysState, initres);
            });
        });

        req.on('error', (e) => {
            logger.error(e);
        });
        req.end();
    } else {
        initres.json(gatewaysState);
    }
}

/*#################################################*/
// get the status of all gateways
app.get('/api/gateways/status', function (req, res) {
    var gatewaysState = [];
    getGatewayState(config.gatewaysInfos, gatewaysState, res);
});


/*#################################################*/
// get the state of all backend apis
app.get('/api/backends/status', function (req, res) {
    const influx = new Influx.InfluxDB({
        host: config.influxDB.hostname,
        username: config.influxDB.user,
        password: config.influxDB.password,
        database: config.influxDB.database
    });
    
    influx.query(`SELECT last(*) FROM "api" GROUP BY "api_full_name"`)
        .then(result => {
            logger.debug("calling INFLUXDB");
            var now = new Date(Date.now()).toTimeString();

            var statusList = [];
            result.forEach(function (status) {

                var apiStatus = "";
                var envZone = status.api_full_name.substring(0, status.api_full_name.indexOf('.'));
                var clientName = status.api_full_name.substring(status.api_full_name.indexOf('.') + 1);
                var functionnalVersionName = clientName.substring(clientName.indexOf('.')+1);
                var name = functionnalVersionName.substring(0, functionnalVersionName.lastIndexOf("-"));
                var fonctionnalVersion = functionnalVersionName.substring(functionnalVersionName.lastIndexOf("-") +1);
                var client = clientName.split(".")[0];
                var env = envZone.split('-')[0];
                var zone = envZone.split('-')[1];
                var version = status.last_details.split(" ")[0];

                var backend = "KO";
                if (status.last_statusAPI === 0) backend = "OK";
                var database = "KO";
                if (status.last_statusDB === 0) database = "OK";

                apiStatus = {
                    "zone": zone,
                    "env": env,
                    "name": name,
                    "client": client,
                    "globalStatus": status.last_status,
                    "database": database,
                    "backend": backend,
                    "version": version,
                    "fonctionnalVersion" : fonctionnalVersion,
                    "lastCheckedTime": now
                }
                if(req.query.environnement == apiStatus.env){
                    statusList.push(apiStatus);
                }
            });
            res.status(200).json(statusList);
        })
    .catch( error => res.status(500).json({ error }) );
});