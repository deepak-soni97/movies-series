const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    role:{ type: String, enum: ['admin', 'user'],  default: 'user'},
    addedMovies: [{ type: Schema.Types.ObjectId, ref: 'Movie' }],
    addedSeries: [{ type: Schema.Types.ObjectId, ref: 'Series' }],
})

module.exports = mongoose.model('User', userSchema);