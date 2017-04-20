const 
  debug = require('debug')('gateway:auth'),
  merge = require('merge'),
  oauth2orize = require('oauth2orize'),
  passport = require('passport'),
  BasicStrategy = require('passport-http').BasicStrategy,
  BearerStrategy = require('passport-http-bearer').Strategy,
  ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy,
  LocalStrategy = require('passport-local').Strategy;

module.exports = function (options) {

  const defaults = {
  };

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


  oauthServer.serializeClient((client, done) => {
    debug(`oauthServer.serializeClient:${client}`);
    return done(null, client);
  });

  oauthServer.deserializeClient((client, done) => {
    debug(`oauthServer.deserializeClient:${client}`);
    return done(null, client);
  });

  oauthServer.exchange(oauth2orize.exchange.clientCredentials(function(client, scope, done) {
    debug(`oauthServer.exchange:clientCredentials:${JSON.stringify(client)}`);
      return done(null, 'TOKEN', { expires_in: 1800, scope: '*' });
  }));

  const authenticate = (user, pass, done) => {
    if (user === 'arthur' && pass === 'password')
      done(null, USER);
    else done(null, false);
  };

  passport.use(new LocalStrategy((user, pass, done) => {
    debug(`LocalStrategy:${user}:${pass}`);
    authenticate(user, pass, done);
  }));

  passport.use(new BasicStrategy((user, pass, done) => {
    debug(`BasicStrategy:${user}:${pass}`);
    authenticate(user, pass, done);
  }));

  passport.use(new ClientPasswordStrategy((clientId, clientSecret, done) => {
    debug(`ClientPasswordStrategy:${clientId}:${clientSecret}`);
    authenticate(clientId, clientSecret, done);
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