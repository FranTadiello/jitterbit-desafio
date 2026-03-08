const mongoose = require('mongoose');

async function connectDatabase(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }

  await mongoose.connect(uri);
}

module.exports = {
  connectDatabase,
};
