import express from 'express';
import { getAllUsersController, getUserByIdController, grantAdminRoleController, updateUserController } from '../controllers/user.controller';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

router.get('/users/all',verifyToken, getAllUsersController);

router.get('/users/:id', verifyToken, getUserByIdController);

router.patch('/users/edit/:id', verifyToken, updateUserController);

router.patch('/users/grant-role/:id', verifyToken, grantAdminRoleController);




export default router;
