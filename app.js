const _ = require('lodash'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  cookieSession = require('cookie-session'),
  debug = require('debug')('gateway:server'),
  ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn,
  express = require('express'),
  flash = require('connect-flash'),
  fs = require('fs'),
  https = require('https'),
  oauth2orize = require('oauth2orize'),
  passport = require('passport'),
  BasicStrategy = require('passport-http').BasicStrategy,
  BearerStrategy = require('passport-http-bearer').Strategy,
  ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy,
  LocalStrategy = require('passport-local').Strategy;

const app = express();
app.use([
  (req, res, next) => { console.log('*** FIRST!  ***'); next(); },
  (req, res, next) => { console.log('*** SECOND! ***'); res.send('hello world'); },
  (req, res, next) => { console.log('*** THIRD!  ***'); next(); },
]);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  secret: 'my very secret password',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
// app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

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

const authenticate = (user, pass, done) => {
  if (user === 'arthur' && pass === 'password')
    done(null, USER);
  else done(null, false);
};

const oauth = oauth2orize.createServer();
oauth.serializeClient((client, done) => {
  debug(`oauth.serializeClient:${client}`);
  return done(null, client);
});

oauth.deserializeClient((client, done) => {
  debug(`oauth.deserializeClient:${client}`);
  return done(null, client);
});

oauth.exchange(oauth2orize.exchange.clientCredentials(function(client, scope, done) {
  debug(`oauth.exchange:clientCredentials:${JSON.stringify(client)}`);
    return done(null, 'TOKEN', { expires_in: 1800, scope: '*' });
}));

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

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login', { error: req.flash('error')});
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/home',
  successFlash: 'Welcome!',
  failureRedirect: '/login',
  failureFlash: 'Invalid Credentials.'
}));

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

app.get('/home', ensureLoggedIn('/login'), (req, res) => {
  console.log('/home:flash:', req.flash());
  console.log('/home:session:', req.session);
  res.render('home', { user: req.user });
});

app.get('/basic',
  passport.authenticate('basic', { session: false }),
  (req, res) => {
    res.json({
      path: '/basic',
      user: req.user,
      authInfo: req.authInfo
    });
  }
);

const qbody = (req, res, next) => {
  _.each(Object.keys(req.query), (key) => {
    req.body[key] = req.body[key] || req.query[key];
  });
  next();
};

app.post('/oauth/token', [
  qbody,
  passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
  oauth.token(),
  oauth.errorHandler()
]);

app.get('/api',
  passport.authenticate('bearer', { session: false }),
  (req, res) => {
    res.json({
      path: '/api',
      user: req.user,
      authInfo: req.authInfo
    });
  }
);

// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//   debug(`http: listening on port ${PORT}`);  
// });

const PORT = process.env.PORT || 3001;
https.createServer({
  key: fs.readFileSync(__dirname + '/secrets/key.pem'),
  cert: fs.readFileSync(__dirname + '/secrets/cert.pem'),
}, app).listen(PORT, () => {
  debug(`https: listening on port ${PORT}`); 
});