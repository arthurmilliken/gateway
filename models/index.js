const bcrypt = require('bcrypt-nodejs');

module.exports = {
  hashBench: 100, // use to mitigate against timing attacks.
  db: require('./db'),
  roles: require('./roles'),
  scopes: require('./scopes'),
  User: require('./user'),
  Application: require('./application'),
  Token: require('./token'),
};

let start = Date.now();
bcrypt.hash('', null, null, (err, hash) => {
  if (err) return console.error(err);
  module.exports.hashBench = Date.now() - start;
});
// bcrypt.hash('', 10).then(() => {
//   module.exports.hashBench = Date.now() - start;
// }, console.error);
