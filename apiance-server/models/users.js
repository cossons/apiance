const Datastore = require('nedb');
var users = new Datastore({ filename: '../data/users.db', autoload: true });

// Declare Schema

// Export Model to be used in Node
module.exports = users;


