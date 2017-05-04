const db = require('./db');

const schema = new db.Schema({
  owner_id: { type: String, required: true },
  owner_type: { type: String, required: true }, // 'user or application'
  access_token: { type: String, unique: true, required: true },
  token_type: { type: String, required: true },
  expires: { type: Date, index: true, required: true },
  refresh_token: { type: String, index: true },
  scope: String,
  info: db.Schema.Types.Mixed,
});
schema.index({ owner_id: 1, owner_type: 1 });

schema.plugin(require('mongoose-createdmodified').createdModifiedPlugin);

module.exports = db.model('Token', schema);

