import express from 'express';
import User from '../models/User';
import bcrypt from 'bcrypt';
import { deleteUserController } from '../controllers/user.controller';
const router = express.Router();

router.delete('/admin/users/delete/:id', deleteUserController);

export default router;
