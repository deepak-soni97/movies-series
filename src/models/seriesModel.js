const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const episodeSchema = new mongoose.Schema({
    episodeNumber: { type: Number, required: true },
    title: { type: String, required: true },
    duration: { type: Number, required: true }, // Duration in minutes
    // Other episode-specific fields, if needed
  });
  
  const seasonSchema = new mongoose.Schema({
    seasonNumber: { type: Number, required: true },
    episodes: [episodeSchema], // Embed episodes within the season
    // Other season-specific fields, if needed
  });

const seriesSchema = new Schema({
    sid: { type: String, required: true },
    title: { type: String, required: true },
    genre: { type: String, required: true },
    releaseYear: { type: Number, required: true },
    director: { type: String, },
    castCrew: { type: String },
    description: { type: String },
    duration: { type: Number, },
    coverImage: { type: String, },
    popularity: { type: Number, default: 0 },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    seasons: [seasonSchema]

})

module.exports = mongoose.model('Series', seriesSchema)