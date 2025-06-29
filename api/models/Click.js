const mongoose = require('mongoose');

const ClickSchema = new mongoose.Schema({
  shortCode: String,
  timestamp: { type: Date, default: Date.now },
  ip: String,
  country: String,
  browser: String,
  device: String
});

module.exports = mongoose.model('Click', ClickSchema);
