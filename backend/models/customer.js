const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerId: { type: String, required: true, unique: true },
  pin: { type: String, required: true },  // Hashed PIN
  balance: { type: Number, required: true },  // Customer balance
  failedAttempts: { type: Number, default: 0 },
  lastFailedAttempt: { type: Date },
  lockTime: { type: Date },
});

module.exports = mongoose.model('Customer', customerSchema);
