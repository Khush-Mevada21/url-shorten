const express = require('express');
const { shortenURL, redirectURL } = require('../controllers/urlController');
const router = express.Router();

router.post('/shorten', shortenURL);
router.get('/:shortId', redirectURL);

module.exports = router;
