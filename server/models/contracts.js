const Datastore = require('nedb');
var contracts = new Datastore();

// Declare Schema

// Export Model to be used in Node
module.exports = contracts;