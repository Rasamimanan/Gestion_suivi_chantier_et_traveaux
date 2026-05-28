const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const validateRegister = [
  body('nom').notEmpty().withMessage('Nom obligatoire.'),
  body('prenom').notEmpty().withMessage('Prénom obligatoire.'),
  body('email').isEmail().withMessage('Email invalide.'),
  body('mot_de_passe').isLength({ min: 6 }).withMessage('Mot de passe min. 6 caractères.'),
];

const validateLogin = [
  body('email').isEmail().withMessage('Email invalide.'),
  body('mot_de_passe').notEmpty().withMessage('Mot de passe obligatoire.'),
];

router.post('/register', validateRegister, ctrl.register);
router.post('/login', validateLogin, ctrl.login);
router.get('/me', authMiddleware, ctrl.me);
router.put('/password', authMiddleware, ctrl.changePassword);

module.exports = router;
