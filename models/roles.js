const Roles = {
  root: {
    tokenTTL: 84600, // 1 day
    scopes: ['*'],
  },
  account_admin: {
    tokenTTL: 3600, // 1 hour
    scopes: ['user:admin', 'application:admin', 'token:admin', 'resource:admin'],
  },
  user: {
    tokenTTL: 3600, // 1 hour
    scopes: ['user', 'application', 'token', 'resource'],
  },
  application: {
    tokenTTL: 3600, // 1 hour
    scopes: ['application', 'token', 'token:validate'],
  },
};

module.exports = Roles;