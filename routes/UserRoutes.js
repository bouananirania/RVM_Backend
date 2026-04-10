import express from 'express';
const router = express.Router();

import userController from '../controllers/UserControllers.js';



router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.post('/', userController.createUser);
router.put('/change-password', userController.changePassword);

export default router;
