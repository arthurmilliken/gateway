const bodyParser = require('body-parser'),
      cookieParser = require('cookie-parser'),
      cookieSession = require('cookie-session'),
      ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn,
      express = require('express'),
      flash = require('connect-flash'),
      fs = require('fs'),
      https = require('https'),
      passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy;

const app = express();

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

passport.use(new LocalStrategy((user, pass, done) => {
  if (user === 'arthur' && pass === 'hamlet')
    done(null, {username: 'arthur'});
  else
    done(null, false, { message: 'Invalid username or password.'});
}));

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
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
  failureFlash: true
}));

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

const authenticate = function (req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
};

app.get('/home', ensureLoggedIn('/login'), (req, res) => {
  console.log('/home:flash:', req.flash());
  console.log('/home:session:', req.session);
  res.render('home', { user: req.user });
});

app.get('/api', (req, res) => {
  res.json({
    hello: 'from api!',
  });
});

// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//   console.log(`http: listening on port ${PORT}`);  
// });

const PORT = process.env.PORT || 3001;
https.createServer({
  key: fs.readFileSync(__dirname + '/secrets/key.pem'),
  cert: fs.readFileSync(__dirname + '/secrets/cert.pem'),
}, app).listen(PORT, () => {
  console.log(`https: listening on port ${PORT}`); 
});