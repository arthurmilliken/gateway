const
  mongoose = require('mongoose'),
  debug = require('debug')('gateway:db')
;

mongoose.Promise = require('bluebird');
mongoose.connect(process.env.MONGO_URL)
.then(
  () => debug('mongoose connected.'),
  err => {
    console.error(err);
    process.exit(1);
  }
);
mongoose.connection.on('error', console.error.bind(console, 'mongoose connection error:'));

mongoose.timestamps = {
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

module.exports = mongoose;
