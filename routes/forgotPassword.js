//C:\Users\harih\Documents\exp3 base\routes\forgotPassword.js

const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const PasswordResetRequest = require('../models/passwordResetRequest');
const User = require('../models/users');
const router = express.Router();

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'hariharan10420@gmail.com',
        pass: 'cncn yxlh onoz xfxl'
    }
});

// POST /user/forgot-password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(16).toString('hex');

        // Calculate expiration time (e.g., 1 hour)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        // Save token in the database
        await PasswordResetRequest.create({
            userId: user.id,
            resetToken: resetToken,
            expiresAt: expiresAt
        });

        // Send email with reset link
        const resetLink = `http://13.239.23.113:3000/user/reset-password?token=${resetToken}`;
        const mailOptions = {
            from: 'your-email@gmail.com',
            to: email,
            subject: 'Password Reset Request',
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error('Error in sending password reset email:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
