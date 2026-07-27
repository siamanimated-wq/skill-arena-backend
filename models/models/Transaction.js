const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['deposit', 'withdraw'], required: true },
    amount: { type: Number, required: true },
    method: { type: String, required: true }, // bKash, Nagad, Rocket, UPI
    accountNumber: { type: String }, // বিকাশ/নগদ নাম্বার
    trxId: { type: String }, // ট্রানজেকশন আইডি
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
