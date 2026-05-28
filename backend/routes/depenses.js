const router = require('express').Router();
const ctrl = require('../controllers/depenseController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.get('/chantier/:chantierId', ctrl.getByChantier);
router.get('/chantier/:chantierId/stats', ctrl.getStats);
router.post('/', ctrl.create);
router.delete('/:id', ctrl.remove);

module.exports = router;