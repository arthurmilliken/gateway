const
  _ = require('lodash'),
  bcrypt = require('bcrypt'),
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
      v => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/.test(v),
      '{PATH} must have: length > 8, upper > 1, lower > 1, numeric > 1'
    ]
  },
  fullname: String,
  roles: [String],
  info: db.Schema.Types.Mixed
});

schema.plugin(require('mongoose-createdmodified').createdModifiedPlugin);

const hashProperty = (obj, property, next) => {
  bcrypt.hash(obj[property], BCRYPT_ROUNDS)
  .then(hash => {
    obj[property] = hash;
    next();
  }, next);
};

const onUpdate = function(next) {
  debug('User.onUpdate:');
  if (this.model.modelName === 'User' && this._update['password'])
    hashProperty(this._update, 'password', next);
  else next();
};

// Define static methods.
schema.statics.fakeVerify = function(cb) {
  return bcrypt.hash('', BCRYPT_ROUNDS, cb);
};

// Define instance methods.
schema.methods.verifyPassword = function(password, cb) {
  if (!this.password) {
    let err = new Error('user: missing password property.');
    if (_.isFunction(cb)) cb(err);
    else throw err;
  }
  return bcrypt.compare(password, this.password, cb);
};



// Define middleware hooks
schema.pre('save', function(next) {
  debug('user:save', this);
  let user = this;
  if (!user.isModified('password')) return next();
  hashProperty(user, 'password', next);
});
schema.pre('update', onUpdate);
schema.pre('findOneAndUpdate', onUpdate);

const User = module.exports = db.model('User', schema);

const duplicateKeyError = {
  name: 'MongoError',
  message: 'E11000 duplicate key error collection: gateway.users index: username_1 dup key: { : "arthur1" }',
  driver: true,
  code: 11000,
  index: 0,
  errmsg: 'E11000 duplicate key error collection: gateway.users index: username_1 dup key: { : "arthur1" }',
  getOperation: Function,
  toJson: Function,
  toString: Function   
};