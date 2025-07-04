import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI || 'mongodb://127.0.0.1:27017/hsdla');
    console.log('Connected to MongoDB:', process.env.DB_URI);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); 
  }
};
