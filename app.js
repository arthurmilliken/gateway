require('dotenv').config();

const
  bodyParser = require('body-parser'),
  debug = require('debug')('gateway:app'),
  fs = require('fs'),
  env = require('./lib/util.js').env,
  app = require('express')(),
  oauthServer = require('oauth2orize').createServer()
;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(require('cookie-parser')());
app.use(require('cookie-session')({
  name: 'session',
  secret: env.getString('COOKIE_SECRET', 'keyboard cat'),
  maxAge: env.getInt('COOKIE_AGE_SECS', 0) * 1000 // 24 hours
}));
app.use(require('connect-flash')());
app.use(require('./middleware/auth.js')({ oauthServer }));
app.use('/', require('./routes/index.js')());
app.use('/api', require('./routes/api.js')());
app.use('/oauth', require('./routes/oauth.js')({ oauthServer }));

app.set('view engine', 'ejs');

// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//   debug(`http: listening on port ${PORT}`);  
// });

const PORT = process.env.PORT || 3001;
require('https').createServer({
  key: fs.readFileSync(__dirname + '/secrets/key.pem'),
  cert: fs.readFileSync(__dirname + '/secrets/cert.pem'),
}, app).listen(PORT, () => {
  debug(`https: listening on port ${PORT}`); 
});

module.exports = app;