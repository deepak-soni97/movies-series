const Movie = require('../models/moviesModel');
const uuid = require('uuid')

const getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find();
        res.status(200).json(movies);
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
};

const getMovie = async (req, res) => {
    const { id } = req.params;
    try {
        const movie = await Movie.findOne({ mid: id });
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' })
        }
        res.status(200).json({ movie })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
};

const createMovie = async (req, res) => {
    const { title, genre, releaseYear, director, castCrew, description, duration } = req.body;
    const imageUrl = req.file ? req.file.originalname : null
    try {

    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'You are not authorized to create movies' });
      }

        const movie = new Movie({
            mid: uuid.v4(),
            title,
            genre,
            releaseYear,
            director,
            description,
            duration,
            castCrew,
            coverImage: imageUrl,
            createdBy: req.user.userId, 

        });
        await movie.save();
        res.status(201).json({ message: 'Movie created successfully' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message })
    }
};

const updateMovie = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to update movies' });
          }

        const updatedMovie = await Movie.findOneAndUpdate({ mid: id }, updateData, { new: true });

        if (!updatedMovie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.status(200).json({ message: 'Movie updated successfully', updatedMovie });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
};

const deleteMovie = async (req, res) => {
    const { id } = req.params;
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to delete movies' });
          }
        const movie = await Movie.deleteOne({ mid: id })
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' })
        }
        res.status(200).json({ message: 'movie deleted successfully', movie });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
};

const searchMovies = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const searchQuery = req.query.text;
        if (!searchQuery) {
            return res.status(200).json({ movies: [] })
        }
        const searchRegex = new RegExp(searchQuery, 'i');

        const totalMovies = await Movie.countDocuments({
            $or: [
                { title: { $regex: searchRegex } },
                { genre: { $regex: searchQuery } },
                { castCrew: { $regex: searchQuery } }
            ],
            // createdBy: req.user._id
        });

        const totalPages = Math.ceil(totalMovies / limit)

        const movies = await Movie.find({
            $or: [
                { title: { $regex: searchRegex } },
                { genre: { $regex: searchQuery } },
                { castCrew: { $regex: searchQuery } }
            ]
        })
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({ movies, totalPages, currentPage: page });

    } catch (error) {
        res.status(500).json({ error: error.message })

    }
}

const getTreandingMovies = async (req, res) => {
    try {
        const treandingMovies = await Movie.find().sort({ popularity: -1 }).limit(10);
        res.status(200).json({ treandingMovies })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const getUserMovies = async (req, res) => {
    const userId = req.user.userId;

    try {
        const userMovies = await Movie.find({ createdBy: userId });
        res.status(200).json({ movies: userMovies });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllMovies,
    getMovie,
    createMovie,
    updateMovie,
    deleteMovie,
    searchMovies,
    getTreandingMovies,
    getUserMovies
}