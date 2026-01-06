import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import hotelsRoutes from './routes/hotels';
import customersRoutes from './routes/customers';
import agentsRoutes from './routes/agents';
import quotationsRoutes from './routes/quotations';
import sightseeingRoutes from './routes/sightseeing';
import mealsRoutes from './routes/meals';
import transfersRoutes from './routes/transfers';
import entryTicketsRoutes from './routes/entryTickets';
import visaRoutes from './routes/visa';
import dashboardRoutes from './routes/dashboard';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wtb-tourism';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
const allowedOrigins = FRONTEND_URL.split(',').map(url => url.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/hotels', hotelsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/quotations', quotationsRoutes);
app.use('/api/sightseeing', sightseeingRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/transfers', transfersRoutes);
app.use('/api/entry-tickets', entryTicketsRoutes);
app.use('/api/visa', visaRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

export default app;
