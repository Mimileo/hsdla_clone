// routes/auth.route.ts
import express from 'express';

import { registerController, loginController, checkAuthController, refreshController, logoutController } from '../controllers/authController';
import { requireRole, verifyToken } from '../middleware/auth';

const router = express.Router();

// POST /api/auth/register
router.post('/auth/register', registerController);

// POST /api/auth/login
router.post('/auth/login', loginController);


// POST /api/auth/logout — handled client-side
router.post('/auth/logout', logoutController);

router.get('/auth/session', verifyToken, checkAuthController);

router.post('/auth/refresh', refreshController);

//router.post('/auth/createUser', verifyToken, requireRole('admin'), findOrCreateUserController);

export default router;
