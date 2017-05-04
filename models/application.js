const
  uid = require('uid-safe'),
  db = require('./db')
;

let schema = new db.Schema({
  name: { type: String, unique: true, required: true },
  owner: { type: String, indexed: true, required: true },
  client_id: { type: String, unique: true, required: true },
  client_secret: { type: String, required: true },
  roles: [String],
  info: db.Schema.Types.Mixed
});

schema.statics.clientId = function(cb) {
  return uid(24, cb);
};

schema.statics.clientSecret = function(cb) {
  return uid(12, cb);
};

schema.plugin(require('mongoose-createdmodified').createdModifiedPlugin);

module.exports = db.model('Application', schema);