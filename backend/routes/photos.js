const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const ctrl = require('../controllers/photoController');
const { authMiddleware } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.random().toString(36).substr(2,9)}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  },
});

router.use(authMiddleware);
router.get('/etape/:etapeId', ctrl.getByEtape);
router.post('/', upload.single('photo'), ctrl.upload);
router.delete('/:id', ctrl.remove);

module.exports = router;
