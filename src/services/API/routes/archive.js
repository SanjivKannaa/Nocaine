const router = require('express').Router();
const {elasticSearch} = require('../controllers/archive');

router.post('/elastic', elasticSearch)

module.exports = router;