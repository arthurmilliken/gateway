const Roles = require('./roles');

const getScopes = function (roles) {
  let scopes = new Set();
  roles.forEach((role) => {
    Roles[role].scopes.forEach(i => scopes.add(i));
  });
  return [...scopes];
};

const Principal = function (id, type, roles, info) {
  this.id = id;
  this.type = type;
  this.scopes = getScopes(roles);
  this.info = info;
};

module.exports = Principal;
