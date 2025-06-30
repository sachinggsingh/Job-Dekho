// all libraries
import express from "express";
require('dotenv').config()
import { Request, Response } from "express";
import cors from "cors";
import { logger } from './helpers/logger';

// tables and database
import { createConnection } from './db/db';
import { createUsersTable } from './models/User';
import { createJobsTable } from './models/Job';

// routes
import routerUser from './routes/User';
import routerJob from './routes/Job'

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

// API routes
app.use('/api', routerUser);
app.use('/api',routerJob);

// Initialize database and tables
const initializeDatabase = async () => {
  try {
    await createConnection();
    await createUsersTable();
    await createJobsTable();
    logger.info("Database initialized successfully");
  } catch (error) {
    logger.error("Database initialization failed:", error);
    process.exit(1);
  }
};

// Start server after database initialization
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server is running at http://localhost:${PORT}`);
  });
});