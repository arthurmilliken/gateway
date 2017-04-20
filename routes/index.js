const 
  ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn, 
  passport = require('passport')
;

module.exports = function () {

  const router = module.exports = require('express').Router();

  router.get('/', (req, res) => {
    res.redirect('/login');
  });

  router.get('/login', (req, res) => {
    res.render('login', { error: req.flash('error')});
  });

  router.post('/login', passport.authenticate('local', {
    successRedirect: '/home',
    successFlash: 'Welcome!',
    failureRedirect: '/login',
    failureFlash: 'Invalid Credentials.'
  }));

  router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
  });

  router.get('/home', ensureLoggedIn('/login'), (req, res) => {
    console.log('/home:flash:', req.flash());
    console.log('/home:session:', req.session);
    res.render('home', { user: req.user });
  });

  router.get('/basic',
    passport.authenticate('basic', { session: false }),
    (req, res) => {
      res.json({
        path: '/basic',
        user: req.user,
        authInfo: req.authInfo
      });
    }
  );
  
  return router;
};



