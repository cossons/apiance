// Load dependencies
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
const LdapStrategy = require('passport-ldapauth');

// Build App
const app = express();

// Enable CORS
app.use(cors());

// Enable the use of request body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

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
passport.use(new LdapStrategy(OPTS));
app.use(passport.initialize());



// API routes
var userRouter = require('./routes/user');
var contractsRouter = require('./routes/contracts');
var authRouter = require('./routes/auth');

// var todosRouter = require('./routes/todos');

app.use('/api/auth', authRouter);
app.use('/user'/*, jwtAuthz(['admin', 'customer']),*/, userRouter);
app.use('/api/contracts'/*, jwtAuthz(['admin']),*/, contractsRouter);

// app.use('/todos'/*, jwtAuthz(['admin', 'customer']),*/, todosRouter);

module.exports = app;