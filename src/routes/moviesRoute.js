const express = require('express');
const router = express.Router();
const moviesController = require('../controllers/moviesController');
const authenticateToken = require('../middleware/authMiddleware');
const upload = require('../middleware/fileMiddleware');
const {requireAdmin,requireUser} = require('../middleware/role')
const {
    getAllMovies,
    getMovie,
    createMovie,
    updateMovie,
    deleteMovie,
    searchMovies,
    getTreandingMovies,
    getUserMovies
  } = moviesController

router.get('/getAllMovies',authenticateToken, getAllMovies);
router.post('/create', authenticateToken, upload.single('coverImage'),createMovie);
router.get('/getMovie/:id', authenticateToken ,getMovie);
router.put('/updateMovie/:id', authenticateToken,upload.single('coverImage'),updateMovie);
router.delete('/deleteMovie/:id', authenticateToken,deleteMovie);
router.get('/search', authenticateToken, searchMovies);
router.get('/treanding/movies',authenticateToken, getTreandingMovies);
router.get('/user/movies',authenticateToken, getUserMovies);

module.exports = router;

