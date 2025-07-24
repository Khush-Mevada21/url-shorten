const express = require('express');
const urlController  = require('../controllers/urlController');
const router = express.Router();

router.post('/shorten', urlController.shortenURL);
router.get('/:shortId', urlController.redirectURL);

router.get('/stats/:shortId', urlController.getStats);
router.get('/logs/:shortId',urlController.getLogs)

module.exports = router;
