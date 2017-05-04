const _ = require('lodash');

module.exports = function () {
  return (req, res, next) => {
    _.each(Object.keys(req.query), (key) => {
      req.body[key] = req.body[key] || req.query[key];
    });
    next();
  };
};