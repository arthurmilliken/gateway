const passport = require('passport');

module.exports = function () {
  const router = module.exports = require('express').Router();
  router.get('/',
    passport.authenticate('bearer', { session: false }),
    (req, res) => {
      res.json({
        path: '/',
        user: req.user,
        authInfo: req.authInfo
      });
    }
  );
  return router;
};