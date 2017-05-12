const
  co = require('co'),
  debug = require('debug')('gateway:init'),
  models = require('../models')
;

module.exports = co.wrap(function*() {
  let user = yield models.User.findOne({ username: process.env.ADMIN_USERNAME });
  if (!user) {
    user = yield models.User.create({
      username: process.env.ADMIN_USERNAME,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      fullname: process.env.ADMIN_FULLNAME,
      roles: ['root']
    });
  }
  debug('admin user:');
  debug(user);

  let client = yield models.Application.findOne({ client_id: process.env.ADMIN_CLIENT_ID });
  if (!client) {
    client = yield models.Application.create({
      name: process.env.ADMIN_CLIENT_NAME,
      owner: user.id,
      client_id: process.env.ADMIN_CLIENT_ID,
      client_secret: process.env.ADMIN_CLIENT_SECRET,
      roles: ['root']
    });
  }
  debug('admin client:');
  debug(client);

  return {user, client};
});