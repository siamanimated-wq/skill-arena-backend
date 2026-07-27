const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const router = express.Router();

// Manual Deposit Request (Player submits TrxID)
router.post('/deposit', async (req, res) => {
    try {
        const { userId, amount, method, accountNumber, trxId } = req.body;

        const newTx = new Transaction({
            userId,
            type: 'deposit',
            amount,
            method,
            accountNumber,
            trxId,
            status: 'pending'
        });

        await newTx.save();
        res.status(201).json({ message: 'Deposit request submitted. Pending admin approval.', transaction: newTx });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Manual Withdraw Request
router.post('/withdraw', async (req, res) => {
    try {
        const { userId, amount, method, accountNumber } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.winningBalance < amount) return res.status(400).json({ message: 'Insufficient winning balance!' });

        user.winningBalance -= amount;
        await user.save();

        const newTx = new Transaction({
            userId,
            type: 'withdraw',
            amount,
            method,
            accountNumber,
            status: 'pending'
        });

        await newTx.save();
        res.status(201).json({ message: 'Withdrawal request submitted successfully.', transaction: newTx });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Approve Deposit
router.post('/admin/approve', async (req, res) => {
    try {
        const { transactionId } = req.body;

        const tx = await Transaction.findById(transactionId);
        if (!tx || tx.status !== 'pending') return res.status(400).json({ message: 'Invalid or processed transaction' });

        const user = await User.findById(tx.userId);

        if (tx.type === 'deposit') {
            user.depositBalance += tx.amount;
            await user.save();
        }

        tx.status = 'approved';
        await tx.save();

        res.json({ message: `Transaction ${tx.type} approved successfully!`, transaction: tx });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
