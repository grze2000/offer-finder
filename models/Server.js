const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const serverSchema = new Schema({
  serverID: String,
  channelID: {
    type: String,
    default: null
  },
  urls: [{
    url: {
      type: String,
      required: true,
    },
    lastID: {
      type: Number,
      required: true
    }
  }]
});

module.exports = mongoose.model('Server', serverSchema, 'servers');