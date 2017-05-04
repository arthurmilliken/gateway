const
  co = require('co'),
  uid = require('uid-safe'),
  validator = require('validator'),

  Application = require('./application'),
  db = require('./db'),
  roles = require('./roles'),

  Schema = db.Schema
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
    type: String, bcrypt: true, index: true, required: true,
    validate: [
      v => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/.test(v),
      '{PATH} must have: length > 8, upper > 1, lower > 1, numeric > 1'
    ]
  },
  fullname: String,
  roles: [String],
  info: db.Schema.Types.Mixed
});

schema.plugin(require('mongoose-bcrypt'));
schema.plugin(require('mongoose-createdmodified').createdModifiedPlugin);

const User = module.exports = db.model('User', schema);