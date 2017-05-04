const
  mongoose = require('mongoose'),
  debug = require('debug')('gateway:db')
;

mongoose.Promise = require('bluebird');
mongoose.connect(process.env.MONGO_URL);
mongoose.connection.on('error', console.error.bind(console, 'mongoose connection error:'));
mongoose.connection.once('open', () => { debug('mongoose connected.'); });

module.exports = mongoose;
