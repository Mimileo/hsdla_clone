import { Request, RequestHandler, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import { AuthRequest, UserPayload } from '../utils/types';
import { createAccessToken, createRefreshToken } from '../utils/token';
import { clearAuthCookies, setAuthCookies } from '../utils/cookie';



 export const registerController = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, roles = ['user'] } = req.body;

  try {
    
    const newUser = await User.create({ firstName, lastName, email, password, roles });
    res.status(201).json({ id: newUser._id, email: newUser.email, roles: newUser.roles });

  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err });
  }
};


 export const loginController: RequestHandler = async (req, res) => {
  console.log('Login request received:', req.body);

  const { email, password } = req.body;
  if (!email || !password) {
    console.log('Missing email or password');
    res.status(400).json({ message: 'Email and password required' });
    return;
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('User found:', user ? user.email : 'No user');

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate tokens and respond
    const userPayload: UserPayload = {
      id: user._id as string,
      email: user.email,
      roles: user.roles,
    };

    const accessToken = createAccessToken(userPayload);
    const refreshToken = createRefreshToken(userPayload);

    user.refreshToken = refreshToken;
    await user.save();

    // set refresh token in cookie
    setAuthCookies({ res, accessToken, refreshToken });

    console.log('Sending login response for user:', user.email);

    const loginUser = await User.findById(user._id).select('-password -refreshToken');  
    res.json({
      accessToken,
      user: {
       loginUser
        
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: err instanceof Error ? err.message : err });
  }
};


export const checkAuthController: RequestHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user.id).select('-password -refreshToken');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        roles: user.roles,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check auth', details: err });
  }
};



export const logoutController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      clearAuthCookies(res);
      res.status(200).json({ message: 'Logged out (no token)' });
      return;
    }

    // Try to find user with this refresh token
    const user = await User.findOne({ refreshToken });
    if (user && user.refreshToken === refreshToken) {
        user.refreshToken = undefined;
        await user.save();
    }


    // Clear auth cookies (access + refresh)
    clearAuthCookies(res);

    res.json({ message: 'Logged out successfully' });
  } catch (err: any) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Logout failed', error: err.message });
  }
};



export const refreshController: RequestHandler = async (req, res): Promise<void> => {
  const refreshToken  = req.cookies?.refreshToken;

  if (!refreshToken) {
     res.status(401).json({
         message: 'No refresh token provided' 
    });
    return;
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { id: string };

    const user = await User.findById(payload.id);
    if (!user || user.refreshToken !== refreshToken) {
       res.status(403).json({ message: 'Invalid refresh token' });
       return;
    }

    const userPayload: UserPayload = {
      id: user._id as string,
      email: user.email,
      roles: user.roles,
    };

    const newAccessToken = createAccessToken(userPayload);

    // reissue refresh token to keep session alive
    setAuthCookies({ res, accessToken: newAccessToken, refreshToken });

    // pass back new access token to client
    res.json({ accessToken: newAccessToken });
  } catch (err: any) {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
    return;
  }
};
