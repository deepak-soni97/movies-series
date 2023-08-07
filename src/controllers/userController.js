require('dotenv').config;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Joi = require('joi')
const nodemailer = require('nodemailer');


const register = async (req, res) => {
    const { username, email, password, role } = req.body;
    try {

        const schema = Joi.object({
            username: Joi.string().required().min(3).max(30),
            email: Joi.string().required().email(),
            password: Joi.string().required().min(6).max(30),
            role: Joi.string().valid('admin', 'user').required(),
        });

        const { error } = schema.validate({ username, email, password, role });

        if (error) {
            const errorMessage = error.details.map((detail) => detail.message).join(', ');
            return res.status(400).json({ message: errorMessage });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(409).json({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword, role });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const schema = Joi.object({
            email: Joi.string().required().email(),
            password: Joi.string().required(),
        });

        const { error } = schema.validate({ email, password });
        if (error) {
            const errorMessage = error.details.map((detail) => detail.message).join(', ');
            return res.status(400).json({ message: errorMessage });
        }
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        const ValidPassword = await bcrypt.compare(password, user.password);
        if (!ValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ email, userId: user._id, role: user.role }, process.env.JWT_SECRET);
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


// Generate a random token for password reset
function generateResetToken() {
  return jwt.sign({ type: 'reset' }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

// Send password reset email to the user
async function sendPasswordResetEmail(email, resetToken) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
  });

  const resetLink = `https://localhost:3300/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Password Reset',
    text: `Click on the following link to reset your password: ${resetLink}`,
  };

  await transporter.sendMail(mailOptions);
}

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = generateResetToken();
    user.resetToken = resetToken;
    await user.save();

    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



module.exports = { register, login, forgotPassword };