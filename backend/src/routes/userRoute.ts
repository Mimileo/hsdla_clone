import express from 'express';
import { getAllUsersController, getUserByIdController, grantAdminRoleController } from '../controllers/user.controller';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

router.get('/users/all',verifyToken, getAllUsersController);

router.get('/users/:id', verifyToken, getUserByIdController);

router.patch('/users/:id', verifyToken, getUserByIdController);

router.patch('/users/grant-role/:id', verifyToken, grantAdminRoleController);

router.delete('/users/:id', verifyToken, getUserByIdController);



export default router;
