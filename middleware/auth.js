const
  bcrypt = require('bcryptjs'),
  co = require('co'),
  debug = require('debug')('gateway:auth'),
  merge = require('merge'),
  oauth2orize = require('oauth2orize'),
  passport = require('passport'),

  BasicStrategy = require('passport-http').BasicStrategy,
  BearerStrategy = require('passport-http-bearer').Strategy,
  ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy,
  LocalStrategy = require('passport-local').Strategy,

  models = require('../models'),
  User = models.User
;

module.exports = function (options) {

  const oauthServer = options.oauthServer || require('oauth2orize').createServer();

  const USER = {
    username: 'arthur',
    email: 'arthur@example.com'
  };

  const CLIENT = {
    clientId: 'CLIENT_ID',
    name: 'Client (TM)'
  };

  const SCOPE = {
    scope: '*'
  };

  const authenticateUser = (username, password, done) => {
    co(function*() {
      let user = User.findOne({ username });
      let valid = false;
      if (user) valid = yield bcrypt.compare(password, user.password);
      else yield bcrypt.hash(''); // protect against timing attacks.
    });


    if (username === 'arthur' && password === 'password')
      done(null, USER);
    else done(null, false);
  };

  const authenticateClient = (id, secret, done) => {

  };

  oauthServer.serializeClient((client, done) => {
    debug(`oauthServer.serializeClient:${client}`);
    return done(null, client);
  });

  oauthServer.deserializeClient((client, done) => {
    debug(`oauthServer.deserializeClient:${client}`);
    return done(null, client);
  });

  oauthServer.exchange(oauth2orize.exchange.clientCredentials(
    (client, scope, done) => {
      debug(`oauthServer.exchange:clientCredentials:${JSON.stringify(client)}`);
      return done(null, 'TOKEN', { expires_in: 1800, scope: '*' });
    }
  ));

  oauthServer.exchange(oauth2orize.exchange.password(
    (client, username, password, scope, done) => {

    }
  ));

  passport.use(new LocalStrategy((user, pass, done) => {
    debug(`LocalStrategy:${user}:${pass}`);
    authenticateUser(user, pass, done);
  }));

  passport.use(new BasicStrategy((clientId, clientSecret, done) => {
    debug(`BasicStrategy:${clientId}:${clientSecret}`);
    authenticateClient(clientId, clientSecret, done);
  }));

  passport.use(new ClientPasswordStrategy((clientId, clientSecret, done) => {
    debug(`ClientPasswordStrategy:${clientId}:${clientSecret}`);
    authenticateClient(clientId, clientSecret, done);
  }));

  passport.use(new BearerStrategy((token, done) => {
    debug(`BearerStrategy:${token}`);
    if (token === 'TOKEN') return done(null, USER, SCOPE);
    else return done(null, false);
  }));

  passport.serializeUser((user, done) => {
    debug(`serializeUser:${user}`);
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    debug(`deserializeUser:${user}`);
    done(null, user);
  });

  return [
    passport.initialize(),
    passport.session()
  ];

};