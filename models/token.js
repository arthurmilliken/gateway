const
  db = require('./db'),
  uid = require('uid-safe')
;

const schema = new db.Schema({
  oid: { type: String, index: true, required: true },
  access_token: { type: String, unique: true, required: true, default: () => uid.sync(32) },
  token_type: { type: String, required: true },
  expires: { type: Date, index: true, required: true },
  scope: String,
  info: db.Schema.Types.Mixed,
}, { timestamps: db.timestamps });
schema.index({ owner_id: 1, owner_type: 1 });

const Token = module.exports = db.model('Token', schema);
