const router = require('express').Router();
const {crawlerStatus,crawlerSwitch,getQueue,AddURL,getUptime,getServicesCount,getCrimeCount,getServiceDailyCount,getUptimeDailyCount} = require('../controllers/dashboard');

router.get('/status', crawlerStatus)
router.get('/switch', crawlerSwitch)
router.get('/queue', getQueue)
router.post('/add', AddURL)
router.get('/uptime', getUptime)
router.get('/services', getServicesCount)
router.get('/crimes', getCrimeCount)
router.post('/service-daily-count',getServiceDailyCount)
router.post('/uptime-daily-count',getUptimeDailyCount)

module.exports = router;