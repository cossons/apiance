const basicAuth = require('basic-auth');

const url = process.env.LDAP_URL || 'ldap://192.168.0.19:389';
const bindDN = process.env.LDAP_BIND_DN || 'cn=admin,dc=apiance,dc=com';
const bindCredentials = process.env.LDAP_BIND_DN_CREDS || 'apiance';
const searchBase = process.env.LDAP_SEARCH_BASE || 'dc=apiance,dc=com';
const searchFilter = process.env.LDAP_SEARCH_FILTER || '(cn={{username}})';

module.exports.ldap = {
    server: {
        url: url,
        bindDN: bindDN,
        bindCredentials: bindCredentials,
        searchBase: searchBase,
        searchFilter: searchFilter
    },
    credentialsLookup: basicAuth
};
