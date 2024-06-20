const router = require('express').Router();
const dashboardRoutes = require('./dashboard');
const archiveRoutes = require('./archive');
const activityRoutes = require('./activity');
const graphRoutes = require('./graph');

router.get('/', (req, res) => {
  res.send('Nocaine API endpoint');
}
);

router.use('/dashboard', dashboardRoutes);
router.use('/archive', archiveRoutes);
router.use('/activity', activityRoutes);
router.use('/graph', graphRoutes);

module.exports = router;