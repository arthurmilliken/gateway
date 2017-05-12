const
  db = require('./db')
;

let schema = new db.Schema({
  owner: { type: String, indexed: true, required: true }, // user.id
  name: { type: String, required: true },
  path: { type: String, unique: true, required: true },
  info: db.Schema.Types.Mixed,
  content: db.Schema.Types.Mixed
}, { timestamps: db.timestamps });

module.exports = db.model('Resource', schema);