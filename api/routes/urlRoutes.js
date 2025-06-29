const express = require('express');
const router = express.Router();
const controller = require('../controllers/urlController');

router.post('/shorten', controller.shortenUrl);
router.get('/analytics/:shortCode', controller.getAnalytics);
router.get('/:shortCode', controller.redirect);

module.exports = router;
