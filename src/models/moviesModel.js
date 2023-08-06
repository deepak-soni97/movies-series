const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const movieSchema = new Schema({
   mid:{ type: String, required: true},
   title: { type: String, required: true },
   genre: { type: String, required: true },
   releaseYear: { type: Number, required: true },
   director: { type: String, },
   castCrew: {type: String},
   duration: { type: Number, },
   description: { type: String, },
   coverImage: { type: String, },
   popularity: { type: Number, default: 0 },
   addedBy: { type: Schema.Types.ObjectId, ref: 'User' },

})

module.exports = mongoose.model('Movie', movieSchema);