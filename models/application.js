const
  db = require('./db'),
  uid = require('uid-safe')
;

let schema = new db.Schema({
  owner: { type: String, indexed: true, required: true }, // user.id
  name: { type: String, unique: true, required: true },
  client_id: { type: String, unique: true, required: true, default: () => uid.sync(24) },
  client_secret: { type: String, required: true, default: () => uid.sync(12) },
  url: { type: String },
  callback_urls: { type: [String] },
  roles: [String],
  info: db.Schema.Types.Mixed
}, { timestamps: db.timestamps });

module.exports = db.model('Application', schema);