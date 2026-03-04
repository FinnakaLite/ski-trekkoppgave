import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ridesRoutes from './routes/ridesRoutes.ts';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/rides', ridesRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


export default app;
