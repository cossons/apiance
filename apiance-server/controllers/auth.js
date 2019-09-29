exports.login = async (request, response) => {
    response.send([]);
};

exports.invalidate = async (request, response) => {
    // remove any token cookie
    response.cookie('token', '');

    response.json({
        success: true,
        message: 'Token terminated'
    });
};

exports.tokenVerify = async (request, response) => {
    response.send([]);
};

exports.tokenRefresh = async (request, response) => {
    response.send([]);
};

/*
    Utils
*/
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