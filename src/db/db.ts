// db.ts
import mysql from 'mysql2/promise';

export const createConnection = async () => {
  try {
    // First connect without database to create it if needed
    const initialConnection = await mysql.createConnection({
      host: "process.env.host",
      user: "process.env.username",
      password: "process.env.password"
    });
    
    // Create database if it doesn't exist
    await initialConnection.execute('CREATE DATABASE IF NOT EXISTS job');
    await initialConnection.end();
    
    // Now connect to the specific database
    const connection = await mysql.createConnection({
      host: "process.env.host",
      user: "process.env.username",
      password: "process.env.password",
      database: "job"
    });
    
    console.log("Connected to MySQL database");
    return connection;
  } catch (error) {
    console.error("Error connecting to MySQL:", error);
    throw error;
  }
};

