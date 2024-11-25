const mongoose = require('mongoose');

const atmSchema = new mongoose.Schema({
  denomination5000: { type: Number, default: 10 },  // Example: 10 bills of 5000 PKR
  denomination1000: { type: Number, default: 20 },
  denomination500: { type: Number, default: 30 },
});

module.exports = mongoose.model('ATM', atmSchema);
