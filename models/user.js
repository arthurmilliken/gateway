const
  _ = require('lodash'),
  bcrypt = require('bcrypt'),
  bluebird = require('bluebird'),
  co = require('co'),
  debug = require('debug')('gateway:user'),
  uid = require('uid-safe'),
  validator = require('validator'),

  Application = require('./application'),
  db = require('./db'),
  roles = require('./roles'),

  Schema = db.Schema,
  BCRYPT_ROUNDS = 10
;

const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;

// User
const schema = new Schema({
  username: { type: String, unique: true, required: true },
  email: {
    type: String, unique: true, required: true,
    validate: [
      v => validator.isEmail(v),
      '{PATH} must be a valid email address.'
    ]
  },
  password: {
    type: String, index: true, required: true,
    validate: [
      v => pwRegex.test(v),
      '{PATH} must have: length > 8, upper > 1, lower > 1, numeric > 1'
    ]
  },
  fullname: String,
  roles: [String],
  info: db.Schema.Types.Mixed
}, { timestamps: db.timestamps });

// Use to "fake" password verification delay when no user found.
schema.statics.fakeVerify = bluebird.promisify((cb) => {
  if (this.fakeDelay > 0)
    return setTimeout(() => cb(null, false), this.fakeDelay);
  let start = Date.now();
  bcrypt.hash('', BCRYPT_ROUNDS, () => {
    this.fakeDelay = Date.now() - start;
    debug('user.fakeVerify:set fakeDelay:', this.fakeDelay);
    cb(null, false);
  });
});

// Verify a user's password.
schema.methods.verifyPassword = function (password, cb) {
  if (!this.password) {
    let err = new Error('user: missing password property.');
    if (_.isFunction(cb)) return cb(err);
    else return Promise.reject(err);
  }
  return bcrypt.compare(password, this.password, cb);
};

// Hash a user's password before saving.
schema.pre('save', function (next) {
  let user = this;
  debug('user:save', user);
  if (!user.isModified('password')) return next();
  bcrypt.hash(user.password, BCRYPT_ROUNDS)
  .then(hash => {
    user.password = hash;
    next();
  }, next);
});

const User = module.exports = db.model('User', schema);

