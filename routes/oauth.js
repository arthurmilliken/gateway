const 
  ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn, 
  passport = require('passport'),
  query2body = require('../middleware/query2body.js')
;

module.exports = function (options) {
  const oauthServer = options.oauthServer;
  const router = module.exports = require('express').Router();
  router.post('/token', [
    query2body(),
    passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
    oauthServer.token(),
    oauthServer.errorHandler()
  ]);
  return router;
};

