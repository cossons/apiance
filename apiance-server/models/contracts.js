const Datastore = require('nedb');
var contracts = new Datastore({ filename: '../data/contracts.db', autoload: true });

// Declare Schema

// Export Model to be used in Node
module.exports = contracts;