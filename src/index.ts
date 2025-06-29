import express from "express";
import { Request, Response } from "express";
import cors from "cors";
import { logger } from './helpers/logger';
import { createConnection } from './db/db';
import { createUsersTable } from './models/User';
import router from './routes/User';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // <-- This parses JSON bodies

// If you expect URL-encoded bodies (e.g., from forms), also add:
app.use(express.urlencoded({ extended: true }));

// Test endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ msg: "Server running" });
});

// API routes
app.use('/api', router);

// Initialize database and tables
const initializeDatabase = async () => {
  try {
    await createConnection();
    await createUsersTable();
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