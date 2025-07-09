import express from 'express';
import { deleteUserController } from '../controllers/user.controller';
const router = express.Router();

router.delete('/admin/users/delete/:id', deleteUserController);

export default router;
