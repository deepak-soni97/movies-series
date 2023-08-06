const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userActivitySchema = new Schema({
  timestamp: { type: Date, default: Date.now },
  userId: { type: String, required: true },
  action: {
    type: String,
    enum: ['view'],
    required: true,
  },
  resource: {
    type: String,
    enum: ['movie', 'series'],
    required: true,
  },
});

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

module.exports = UserActivity;
