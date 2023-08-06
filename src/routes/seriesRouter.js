const express = require('express');
const router = express.Router();
const seriesController = require('../controllers/seriesController');
const upload = require('../middleware/fileMiddleware');
const authenticateToken = require('../middleware/authMiddleware');

const {
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
} = seriesController

router.post('/create', authenticateToken, authenticateToken, upload.single('coverImage'), createSeries);
router.get('/getAllSeries', authenticateToken, getAllSeries);
router.get('/getSeries/:id', authenticateToken, getSeriessById);
router.put('/updateSeries/:id', authenticateToken, upload.single('coverImage'), updateSeries);
router.delete('/deleteSeries/:id', authenticateToken, deleteSeries);
router.get('/search', authenticateToken, searchSeries);
router.get('/trending/series', authenticateToken, getTreandingSeries);
router.get('/user/series', authenticateToken, getUserSeries);
router.get('/:id/seasons', authenticateToken, getAllSeasons);
router.post('/:id/seasons', authenticateToken, createSeason);
router.put('/:id/seasons/:seasonNumber', authenticateToken, updateSeason);
router.delete('/:id/seasons/:seasonNumber', authenticateToken, deleteSeason);
router.get('/:id/seasons/:seasonNumber/episodes', authenticateToken, getAllEpisodes);
router.post('/:id/seasons/:seasonNumber/episodes', authenticateToken, createEpisode);
router.put('/:id/seasons/:seasonNumber/episodes/:episodeNumber', authenticateToken, updateEpisode);
router.delete('/:id/seasons/:seasonNumber/episodes/:episodeNumber', authenticateToken, deleteEpisode);


module.exports = router;

