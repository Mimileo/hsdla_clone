// backend/src/server.ts
import express, { Application, Request, Response} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './database';
import transcriptRoutes from './routes/transcript.route';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoute';
import userRoutes from './routes/userRoute';
import cookieParser from 'cookie-parser';
import history from 'connect-history-api-fallback';


import path from 'path';
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4004;



connectDB();
app.use(cors({
  origin:  process.env.CLIENT_ORIGIN || 'http://localhost:5173', 
  credentials: true, // Access-Control-Allow-Credentials
}));

app.use(cookieParser());
app.use(express.json());




// api routes set up
app.use('/api', transcriptRoutes);
app.use('/api', authRoutes);
app.use('/api', adminRoutes);
app.use('/api', userRoutes);

const frontendPath = path.resolve(__dirname, '../public');

app.use(history());

app.use(express.static(frontendPath));

app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});


app.listen(PORT, () => {
    console.log(`Server node is running on port ${PORT}`);
});