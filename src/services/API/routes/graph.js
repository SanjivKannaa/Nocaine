const router = require('express').Router();
const {graphDetails} = require('../controllers/graph');

router.get('/', graphDetails)

module.exports = router;