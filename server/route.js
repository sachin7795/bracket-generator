const express = require('express');
const router = express.Router();

// Require the controllers WHICH WE DID NOT CREATE YET!!
const controller = require('./controller');


// a simple test url to check that all of our files are communicating correctly.
router.post('/login', controller.login);
router.get('/seasons', controller.seasons);
router.get('/players', controller.players);
router.get('/countries', controller.countries);
router.get('/seasonDetails/:id', controller.seasonDetails);
router.post('/seasonDetails', controller.saveSeasonDetails);
router.post('/matchDetails', controller.saveMatchDetails);
router.get('/matchDetails/:id', controller.getMatchDetails);
router.delete('/season/:id', controller.deleteSeason);
router.post('/season', controller.addSeason);
router.post('/country', controller.addCountry);
router.put('/country/:id', controller.updateCountry);
router.delete('/country/:id', controller.deleteCountry);
router.post('/player', controller.addPlayer);
router.put('/player/:id', controller.updatePlayer);
router.delete('/player/:id', controller.deletePlayer);

module.exports = router;