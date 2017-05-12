const
  bcrypt = require('bcryptjs'),
  co = require('co'),
  debug = require('debug')('gateway:auth'),
  merge = require('merge'),
  models = require('../models'),
  moment = require('moment'),
  oauth2orize = require('oauth2orize'),
  passport = require('passport'),

  BasicStrategy = require('passport-http').BasicStrategy,
  BearerStrategy = require('passport-http-bearer').Strategy,
  ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy,
  LocalStrategy = require('passport-local').Strategy,

  Application = models.Application,
  Principal = models.Principal,
  User = models.User,
  Token = models.Token
;

module.exports = function (options) {

  const oauthServer = options.oauthServer || oauth2orize.createServer();

  const serialize = (principal, done) => {
    try { done(null, JSON.stringify(principal)); }
    catch (err) { done(err); }
  };

  const deserialize = (json, done) => {
    try { done(null, JSON.parse(json)); }
    catch (err) { done(err); }
  };

  const authenticateUser = (username, password, done) => {
    debug(`authenticateUser:${username}:[PASSWORD]`);
    co(function*() {
      try {
        let user = yield User.findOne({ username });
        debug(user);
        let valid = user ?
          yield user.verifyPassword(password) :
          yield User.fakeVerify();
        if (valid) {
          return done(null, new Principal(
            user.id, 'User', user.roles,
            { username: user.username,
              email: user.email,
              fullname: user.fullname }
          ));
        }
        else done(null, false);       
      }
      catch (err) { done(err); }
    });
  };

  passport.serializeUser(serialize);
  passport.deserializeUser(deserialize);

  const authenticateClient = (client_id, client_secret, done) => {
    debug('authenticateClient:', client_id);
    co(function*() {
      try {
        let client = yield Application.findOne({ client_id, client_secret });
        debug(client);
        if (client) {
          return done(null, new Principal(
            client.id, 'Application', client.roles,
            { name: client.name }
          ));
        }
        else return done(null, false);
      }
      catch (err) { done(err); }
    });
  };

  oauthServer.serializeClient(serialize);
  oauthServer.deserializeClient(deserialize);

  oauthServer.exchange(oauth2orize.exchange.clientCredentials(
    (client, scope, done) => {
      debug('oauthServer.exchange:clientCredentials:');
      debug(client);
      debug('scope:', scope);
      co(function*() {
        try {
          let expiresIn = 1800;
          let token = yield Token.create({
            oid: client.id,
            token_type: 'Bearer',
            expires: moment().add(expiresIn, 'seconds').toDate(),
            scope: client.scopes.join(' '),
            info: {
              principal: client
            }
          });
          debug(token);
          debug(JSON.stringify(token, null, 2));
          return done(null, token.access_token, {
            expires_in: expiresIn,
            scope: token.scope,
            info: token.info,
          });
        }
        catch (err) { 
          console.error(err);
          done(err);
        }
      });
    }
  ));

  oauthServer.exchange(oauth2orize.exchange.password(
    (client, username, password, scope, done) => {
      debug('oauthServer.exchange:password:', username);
      debug(client);
      return done(null, 'TOKEN', { expires_in: 1800, scope: '*' });
    }
  ));

  passport.use(new LocalStrategy((username, password, done) => {
    debug(`LocalStrategy:${username}:[PASSWORD]`);
    authenticateUser(username, password, done);
  }));

  passport.use(new BasicStrategy((clientId, clientSecret, done) => {
    debug(`BasicStrategy:${clientId}:[SECRET]`);
    authenticateClient(clientId, clientSecret, done);
  }));

  passport.use(new ClientPasswordStrategy((clientId, clientSecret, done) => {
    debug(`ClientPasswordStrategy:${clientId}:[SECRET]`);
    authenticateClient(clientId, clientSecret, done);
  }));

  passport.use(new BearerStrategy((token, done) => {
    debug(`BearerStrategy:${token}`);
    if (token === 'TOKEN') return done(null, {user: 'user'}, '*');
    else return done(null, false);
  }));

  return [
    passport.initialize(),
    passport.session()
  ];

};