import express from 'express';
const router = express.Router();

import userController from '../controllers/UserControllers.js';


// Login
router.post('/login', userController.login);

// Logout
router.post('/logout', userController.logout);



// Create user (admin only – à protéger plus tard par middleware)
router.post('/', userController.createUser);




// Change password
router.put('/change-password', userController.changePassword);

export default router;
