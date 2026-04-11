import express from 'express';
const router = express.Router();

import userController from '../controllers/UserControllers.js';



router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.post('/', userController.createUser);
router.put('/change-password', userController.changePassword);

// Routes pour le mot de passe oublié
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

export default router;
