require('dotenv').config;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Joi = require('joi')

const register = async (req, res) => {
    const { username, password, role } = req.body;

    try {
        const schema = Joi.object({
            username: Joi.string().required().min(3).max(30),
            password: Joi.string().required().min(6).max(30),
            role: Joi.string().valid('admin', 'user').required(),
        });

        const { error } = schema.validate({ username, password, role });

        if (error) {
            const errorMessage = error.details.map((detail) => detail.message).join(', ');
            return res.status(400).json({ message: errorMessage });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword, role });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const schema = Joi.object({
            username: Joi.string().required(),
            password: Joi.string().required(),
        });

        const { error } = schema.validate({ username, password });
        if (error) {
            const errorMessage = error.details.map((detail) => detail.message).join(', ');
            return res.status(400).json({ message: errorMessage });
        }
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        const ValidPassword = await bcrypt.compare(password, user.password);
        if (!ValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { register, login };