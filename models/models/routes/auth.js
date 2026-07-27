const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'skillarena_secret_key_123';

// Register Player
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password, referredBy } = req.body;

        let userExists = await User.findOne({ $or: [{ email }, { phone }] });
        if (userExists) return res.status(400).json({ message: 'User already exists with this Email or Phone!' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const referralCode = 'SA' + Math.floor(100000 + Math.random() * 900000);

        const newUser = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            referralCode,
            referredBy
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!', user: newUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login Player
router.post('/login', async (req, res) => {
    try {
        const { emailOrPhone, password } = req.body;

        const user = await User.findOne({
            $or: [{ email: emailOrPhone }, { phone: emailOrPhone }]
        });
        if (!user) return res.status(400).json({ message: 'User not found!' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials!' });

        const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
