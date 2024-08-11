//C:\Users\harih\Documents\exp3 base\routes\resetPassword.js

const express = require('express');
const bcrypt = require('bcrypt');
const PasswordResetRequest = require('../models/passwordResetRequest');
const User = require('../models/users');
const router = express.Router();

// GET /user/reset-password
router.get('/reset-password', async (req, res) => {
    const { token } = req.query;

    try {
        // Find reset request by token
        const resetRequest = await PasswordResetRequest.findOne({ where: { resetToken: token } });

        if (!resetRequest) {
            return res.status(404).json({ message: 'Invalid or expired reset token' });
        }

        // Check if token is expired
        if (new Date() > resetRequest.expiresAt) {
            await resetRequest.destroy(); // Clean up expired request
            return res.status(400).json({ message: 'Reset token has expired' });
        }

        // Serve a simple reset password form
        res.send(`
            <form action="/user/reset-password" method="POST">
                <input type="hidden" name="token" value="${token}" />
                <label for="password">Enter your new password:</label>
                <input type="password" name="password" required />
                <button type="submit">Reset Password</button>
            </form>
        `);
    } catch (error) {
        console.error('Error in reset password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /user/reset-password
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;

    console.log('Received Token:', token); // Log token value
    console.log('Received Password:', password); // Log password value

    try {
        // Find reset request by token
        const resetRequest = await PasswordResetRequest.findOne({ where: { resetToken: token } });

        if (!resetRequest) {
            return res.status(404).json({ message: 'Invalid or expired reset token' });
        }

        // Check if token is expired
        if (new Date() > resetRequest.expiresAt) {
            await resetRequest.destroy(); // Clean up expired request
            return res.status(400).json({ message: 'Reset token has expired' });
        }

        // Find user by ID
        const user = await User.findByPk(resetRequest.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user's password
        await user.update({ password: hashedPassword });

        // Clean up reset request
        await resetRequest.destroy();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error in completing password reset:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
