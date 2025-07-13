// all libraries
import express from "express";
require('dotenv').config()
import { Request, Response } from "express";
import cors from "cors";
import { logger } from './helpers/logger';
import path from 'path';
// tables and database
import { createConnection } from './db/db';
import { createUsersTable } from './models/User';
import { createJobsTable } from './models/Job';
import { createResumesTable } from './models/Resume';
// redis
import { redis } from './helpers/redis';

// routes
import routerUser from './routes/User';
import routerJob from './routes/Job'
import routerResume from './routes/Resume';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


// Test endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ msg: "Server running" });
});
// Serve static files for resumes
// app.use('/uploads/resumes', express.static(path.join(__dirname, '../../uploads/resumes')));

// API routes
app.use('/api', routerUser);
app.use('/api',routerJob);
app.use('/api', routerResume);

// Initialize database and tables
const initializeDatabase = async () => {
  try {
    await createConnection();
    await createUsersTable();
    await createJobsTable();
    await createResumesTable();
    logger.info("Database initialized successfully");
  } catch (error) {
    logger.error("Database initialization failed:", error);
    process.exit(1);
  }
};

// Check Redis connection
const checkRedisConnection = async () => {
  try {
    await redis.set('connection_test', 'ok');
    const value = await redis.get('connection_test');
    if (value === 'ok') {
      logger.info('Redis connected successfully');
    } else {
      logger.error('Redis connection test failed: Unexpected value');
      process.exit(1);
    }
  } catch (error) {
    logger.error('Redis connection failed:', error);
    process.exit(1);
  }
};

// Start server after database and Redis initialization
const startServer = async () => {
  await initializeDatabase();
  await checkRedisConnection();
  app.listen(PORT, () => {
    logger.info(`Server is running at http://localhost:${PORT}`);
  });
};

startServer();