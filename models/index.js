const
  co = require('co'),
  isEmail = require('validator/lib/isEmail'),
  mongoose = require('mongoose'),
  Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');
mongoose.connect(process.env.MONGO_URL);
mongoose.connection.on('error', console.error.bind(console, 'mongoose connection error:'));
mongoose.connection.once('open', () => { console.log('mongoose connected.'); });

// User
const userSchema = new Schema({
  username: { type: String, index: true, required: true },
  email: {
    type: String, index: true, required: true,
    validate: [v => { return isEmail(v); }, '{PATH} must be a valid email address.']
  },
  password_hash: { type: String, index: true, required: true },
  fullname: String,
});
userSchema.methods.getView = co.wrap(function* () {
  return {
    username: this.username,
    email: this.email,
    fullname: this.fullname
  };
});
userSchema.statics.hash = co.wrap(function* (value) {
  return 'HASHED';
});

// Application
const applicationSchema = new Schema({
  client_id: { type: String, index: true, required: true },
  client_secret: { type: String, required: true },
  name: { type: String, index: true, required: true },
});
applicationSchema.statics.create = co.wrap(function* (name) {
  return new this({
    client_id: 'CLIENT_ID',
    client_secret: 'CLIENT_SECRET',
    name
  });
});

// Token
const tokenSchema = new Schema({
  access_token: { type: String, index: true, required: true },
  token_type: { type: String, required: true },
  expires: { type: Date, index: true, required: true },
  scope: String,
  info: Schema.Types.Mixed,
});

module.exports = {
  db: mongoose,
  User: mongoose.model('User', userSchema),
  Application: mongoose.model('Application', applicationSchema),
  Token: mongoose.model('Token', tokenSchema),
};
