const { Long } = require('mongodb');
const Series = require('../models/seriesModel');
const uuid = require('uuid');
const Joi = require('joi');

const getAllSeries = async (req, res) => {
    const { id } = req.params;
    try {
        const series = await Series.find();
        res.status(200).json(series);
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
};

const getSeriessById = async (req, res) => {
    const { id } = req.params;
    try {
        const series = await Series.findOne({ sid: id });
        if (!series) {
            return res.status(404).json({ message: 'Series not found' })
        }
        res.status(200).json({ series })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
};

const createSeries = async (req, res) => {
    const { title, genre, releaseYear, director, description, castCrew, duration } = req.body;
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to create series' });
          }
        // Validate the request data
    const schema = Joi.object({
        title: Joi.string().required(),
        genre: Joi.string().required(),
        releaseYear: Joi.number().integer().min(1800).max(new Date().getFullYear()).required(),
        director: Joi.string().required(),
        description: Joi.string().required(),
        castCrew: Joi.string().required(),
        duration: Joi.number().integer().min(1).required(),
      });
  
      const { error } = schema.validate({
        title,
        genre,
        releaseYear,
        director,
        description,
        castCrew,
        duration,
      });
  
      if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(', ');
        return res.status(400).json({ message: errorMessage });
      }
        const series = new Series({
            sid: uuid.v4(),
            title,
            genre,
            releaseYear,
            director,
            description,
            duration,
            castCrew,
            coverImage: req.file ? req.file.path : null
        });
        await series.save();
        res.status(201).json({ message: 'Series created successfully' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
};

const updateSeries = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body

    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to update series' });
          }
        const updateSeries = await Series.findOneAndUpdate({ sid: id }, updateData, { new: true });
        
        if (!updateSeries) {
            return res.status(404).json({ message: 'Series not found' });
        }
        res.status(200).json({ message: 'Series updated successfully', updateSeries });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
};

const deleteSeries = async (req, res) => {
    const id = req.params.id;
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to delete series' });
          }
        const series = await Series.deleteOne({ sid: id })
        if (!series) {
            return res.status(404).json({ message: 'Series not found' })
        }
        res.status(200).json({ message: 'Series deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
};

const searchSeries = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const searchQuery = req.query.text;
        if (!searchQuery) {
            return res.status(200).json({ series: [] })
        }

        const searchRegex = new RegExp(searchQuery, "i");

        const totalSeries = await Series.countDocuments({
            $or: [
                { title: { $regex: searchQuery } },
                { genre: { $regex: searchQuery } },
                { castCrew: { $regex: searchQuery } }
            ]
        });

        const totalPages = Math.ceil(totalSeries / limit)

        const series = await Series.find({
            $or: [
                { title: { $regex: searchRegex } },
                { genre: { $regex: searchQuery } },
                { castCrew: { $regex: searchQuery } }
            ]
        })
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({ series, totalPages, currentPage: page });
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
};

const getAllSeasons = async (req, res) => {
    const { id } = req.params;
    try {
        const series = await Series.findOne({ sid: id });
        if (!series) {
            return res.status(404).json({ message: 'Series not found' });
        }
        res.json({ seasons: series.seasons });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createSeason = async (req, res) => {
    const { id } = req.params;
    const { seasonNumber } = req.body;

    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to create season' });
          }

        const schema = Joi.object({
            seasonNumber: Joi.number().integer().min(1).required(),
          });
      
          const { error } = schema.validate({ seasonNumber });
      
          if (error) {
            const errorMessage = error.details.map((detail) => detail.message).join(', ');
            return res.status(400).json({ message: errorMessage });
          }

        const series = await Series.findOne({ sid: id });
        if (!series) {
            return res.status(404).json({ message: 'Series not found' });
        }

        // Check if the seasonNumber already exists
        const existingSeason = series.seasons.find((season) => season.seasonNumber === seasonNumber);
        if (existingSeason) {
            return res.status(400).json({ message: 'Season number already exists' });
        }

        // Create a new season and add it to the series
        const season = { seasonNumber, episodes: [] };
        series.seasons.push(season);
        await series.save();

        res.status(201).json({ message: 'Season created successfully', season });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateSeason = async (req, res) => {
    const { id, seasonNumber } = req.params;
    const updateData = req.body;
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to update season' });
          }
        const series = await Series.findOne({ sid: id })
        if (!series) {
            return res.status(404).json({ message: 'Series not found' })
        }
        console.log(series);
        const seasonIndex = series.seasons.findIndex((season) => season.seasonNumber === parseInt(seasonNumber))
        console.log(seasonIndex);
        if (seasonIndex === -1) {
            return res.status(404).json({ message: 'Season not found' });
        }

        series.seasons[seasonIndex] = { ...series.seasons[seasonIndex], ...updateData }
        console.log(series.seasons[seasonIndex], "eppp");
        const a = await series.save();
        res.status(200).json({ message: 'Season updated successfully', season: series.seasons[seasonIndex] });

    } catch (error) { res.status(500).json({ error: error.message }); }

}

const deleteSeason = async (req, res) => {
    const { id, seasonNumber } = req.params;

    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to delete season' });
          }
        const series = await Series.findOne({ sid: id });
        if (!series) {
            return res.status(404).json({ message: 'Series not found' })
        }
        const seasonIndex = series.seasons.findIndex((season) => season.seasonNumber === parseInt(seasonNumber))
        if (seasonIndex === -1) {
            return res.status(404).json({ message: 'Season not found' });
        }
        series.seasons.splice(seasonIndex, 1);
        await series.save();
        res.status(200).json({ message: 'Season deleted Successfully' })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getAllEpisodes = async (req, res) => {
    const { id, seasonNumber } = req.params;
    try {
        const series = await Series.findOne({ sid: id })
        if (!series) {
            return res.status(404).json({ message: 'Series not found' });
        }

        const season = series.seasons.find((season) => season.seasonNumber === parseInt(seasonNumber));
        if (!season) {
            return res.status(404).json({ message: 'Season not found' })
        }
        res.status(200).json({ episode: season.episodes });

    } catch (error) { return res.status(500).json({ error: error.message }); }
}

const createEpisode = async (req, res) => {
    const { id, seasonNumber } = req.params;
    const { episodeNumber, title, duration, } = req.body;
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to create episode' });
          }

    const schema = Joi.object({
        episodeNumber: Joi.number().integer().min(1).required(),
        title: Joi.string().trim().required(),
        duration: Joi.number().integer().min(1).required(),
      });
  
      const { error } = schema.validate({ episodeNumber, title, duration });
  
      if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(', ');
        return res.status(400).json({ message: errorMessage });
      }
        const series = await Series.findOne({ sid: id });
        if (!series) {
            return res.status(404).json({ message: 'Series not found' });
        }

        const seasonIndex = series.seasons.findIndex((season) => season.seasonNumber === parseInt(seasonNumber));
        if (seasonIndex === -1) {
            return res.status(404).json({ message: 'Season not found' })
        }

        const season = series.seasons[seasonIndex];
        const episode = season.episodes.find((episode) => episode.episodeNumber === parseInt(episodeNumber))
        if (episode) {
            return res.status(400).json({ message: 'Epsiode  number already exists' })
        }

        const newEpisodes = { episodeNumber, title, duration };
        season.episodes.push(newEpisodes);
        await series.save();

        res.status(201).json({ message: 'Episodes created successfully', episode: newEpisodes });

    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const updateEpisode = async (req, res) => {
    const { id, seasonNumber, episodeNumber } = req.params;
    console.log(req.params);
    const updateData = req.body;
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to update episode' });
          }
        const series = await Series.findOne({ sid: id });
        console.log(series.seasons[0].episodes);
        if (!series) {
            return res.status(404).json({ message: 'Series not found' });
        }

        const seasonIndex = series.seasons.findIndex((season) => season.seasonNumber === parseInt(seasonNumber));
        console.log(seasonIndex);
        if (seasonIndex === -1) {
            return res.status(404).json({ message: 'Season not found' })
        }

        const season = series.seasons[seasonIndex];
        const episodeIndex = season.episodes.findIndex((episode) => episode.episodeNumber === parseInt(episodeNumber));
        if (episodeIndex === -1) {
            return res.status(404).json({ message: 'Episode not found' });
        }
        season.episodes[episodeIndex] = { ...season.episodes[episodeIndex], ...updateData };
        await series.save();
        res.status(201).json({ message: 'Epsode updated successfully', epsiode: season.episodes[episodeIndex] });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const deleteEpisode = async (req, res) => {
    const { id, seasonNumber, episodeNumber } = req.params;

    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to delete episode' });
          }
        const series = await Series.findOne({ sid: id });
        if (!series) {
            return res.status(404).json({ message: 'Series not found' })
        }
        const seasonIndex = series.seasons.findIndex((season) => season.seasonNumber === parseInt(seasonNumber))
        if (seasonIndex === -1) {
            return res.status(404).json({ message: 'Season not found' });
        }
        const season = series.seasons[seasonIndex];
        const episodeIndex = season.episodes.findIndex((episode) => episode.episodeNumber === parseInt(episodeNumber))
        if (episodeIndex === -1) {
            return res.status(404).json({ message: 'Episode not found' })
        }

        season.episodes.splice(episodeIndex, 1);
        await series.save();

        res.status(200).json({ message: 'Episode deleted Successfully' })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getTreandingSeries = async (req, res) => {
    try {
        const getTreandingSeries = await Movie.find().sort({ popularity: -1 }).limit(10);
        res.status(200).json({ getTreandingSeries })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


const getUserSeries = async (req, res) => {
    const userId = req.user.userId; 
  
    try {
      const userSeries = await Series.find({ createdBy: userId });
      res.status(200).json({ series: userSeries });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

module.exports = {
    getAllSeries,
    getSeriessById,
    createSeries,
    updateSeries,
    deleteSeries,
    searchSeries,
    createSeason,
    getAllSeasons,
    updateSeason,
    deleteSeason,
    getAllEpisodes,
    createEpisode,
    updateEpisode,
    deleteEpisode,
    getTreandingSeries,
    getUserSeries
}