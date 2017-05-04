module.exports = {
  root: {
    tokenTTL: 84600, // 1 day
    scopes: ['*'],
  },
  account_admin: {
    tokenTTL: 3600, // 1 hour
    scopes: ['user:admin', 'application:admin', 'token:admin', 'resource:admin', 'ipfs'],
  },
  user: {
    tokenTTL: 3600, // 1 hour
    scopes: ['user', 'application', 'token', 'resource', 'ipfs'],
  },
  application: {
    tokenTTL: 3600, // 1 hour
    scopes: ['application', 'token', 'ipfs'],
  },
};