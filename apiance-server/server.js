// Load dependencies
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authentication = require('./modules/authentication');

// Build App
const app = express();

// Enable CORS
app.use(cors());

// Enable the use of request body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Passport auth usage
app.use(authentication.initialize());

// Get LDAP config
const OPTS = {
  server: {
    url: 'ldap://192.168.0.19:389',
    bindDN: 'cn=admin,dc=apiance,dc=com',
    bindCredentials: 'apiance',
    searchBase: 'dc=apiance,dc=com',
    searchFilter: '(&(objectclass=person)(cn=test))',
  }
};

// API routes
var userRouter = require('./routes/user');
var contractsRouter = require('./routes/contracts');
var authRouter = require('./routes/auth');

// var todosRouter = require('./routes/todos');

app.use('/api/auth', authRouter);
app.use('/api/contracts'/*, jwtAuthz(['admin']),*/, contractsRouter);
app.use('/api/user', userRouter);

// app.use('/todos'/*, jwtAuthz(['admin', 'customer']),*/, todosRouter);

module.exports = app;