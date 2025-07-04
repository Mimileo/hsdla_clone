import { RequestHandler } from "express";
import User from "../models/User";


export const getAllUsersController: RequestHandler = async (req, res): Promise<void> => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users', details: err });
    }
};

export const getUserByIdController: RequestHandler = async (req, res): Promise<void> => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('-password -refreshToken');
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user', details: err });
    }
}

export const updateUserController: RequestHandler = async (req, res): Promise<void> => {
    try {
        const userId = req.params.id;
        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }

        if (!req.body) {
            res.status(400).json({ error: 'User data is required' });
            return;
        }

       
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

       

        const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });

        if (!updatedUser) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user', details: err });
    }
}

export const grantAdminRoleController: RequestHandler = async (req, res): Promise<void> => {
    try {
        const userId = req.params.id;
        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        if (user.roles.includes('admin')) {
            res.status(400).json({ error: 'User already has admin role' });
            return;
        }

        user.roles.push('admin');
        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: 'Failed to grant admin role', details: err });
    }
}


export const deleteUserController: RequestHandler = async (req, res): Promise<void> => {
    try {
        const userId = req.params.id;

        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
             res.status(404).json({ error: 'User not found' });
             return;
        }
        res.json({ message: 'User deleted successfully with id: ' + userId});
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete user', details: err });
    }
};  

