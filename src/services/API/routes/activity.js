const router = require('express').Router();
const {filterURLs,searchURL} = require('../controllers/activity');

router.post('/filter', filterURLs)
router.post('/search', searchURL)

module.exports = router;