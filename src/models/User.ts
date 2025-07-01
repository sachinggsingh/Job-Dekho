import { createConnection } from '../db/db';
import { ResultSetHeader } from 'mysql2';
import { logger } from '../helpers/logger';

export interface User {
    id?: number;
    name: string;
    phoneNumber: string;
    role: 'HR' | 'jobSeeker';
    password: string;
    note?: string;
    refreshToken?: string;
    created_at?: Date;
    updated_at?: Date;
}

// Create users table if it doesn't exist
export const createUsersTable = async () => {
    const connection = await createConnection();
    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(25) NOT NULL,
                phone_number VARCHAR(10) NOT NULL UNIQUE,
                role ENUM('HR', 'jobSeeker') NOT NULL,
                password VARCHAR(255) NOT NULL,
                note VARCHAR(500) DEFAULT '',
                refresh_token VARCHAR(500) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        await connection.execute(createTableQuery);
        logger.info('Users table created or already exists');
    } catch (error) {
        logger.error('Error creating users table:', error);
        throw error;
    } finally {
        await connection.end();
    }
};

// Find user by phone number
export const findUserByPhoneNumber = async (phoneNumber: string): Promise<User | null> => {
    const connection = await createConnection();
    try {
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE phone_number = ? LIMIT 1',
            [phoneNumber]
        );
        const users = rows as User[];
        return users.length > 0 ? users[0] : null;
    } catch (error) {
        logger.error('Error finding user by phone number:', error);
        throw error;
    } finally {
        await connection.end();
    }
};

// Create new user
export const createUser = async (userData: User): Promise<User> => {
    const connection = await createConnection();
    try {
        const [result] = await connection.execute(
            'INSERT INTO users (name, phone_number, role, password, note, refresh_token) VALUES (?, ?, ?, ?, ?, ?)',
            [
                userData.name,
                userData.phoneNumber,
                userData.role,
                userData.password,
                userData.note || '',
                userData.refreshToken || null
            ]
        );

        const insertResult = result as ResultSetHeader;
        const userId = insertResult.insertId;

        // Fetch the created user
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );
        const users = rows as User[];
        return users[0];
    } catch (error) {
        logger.error('Error creating user:', error);
        throw error;
    } finally {
        await connection.end();
    }
};

// Set refresh token for a user by phone number
export const setUserRefreshToken = async (phoneNumber: string, refreshToken: string) => {
    const connection = await createConnection();
    try {
        await connection.execute(
            'UPDATE users SET refresh_token = ? WHERE phone_number = ?',
            [refreshToken, phoneNumber]
        );
    } catch (error) {
        logger.error('Error setting user refresh token:', error);
        throw error;
    } finally {
        await connection.end();
    }
};

// Get refresh token for a user by phone number
export const getUserRefreshToken = async (phoneNumber: string): Promise<string | null> => {
    const connection = await createConnection();
    try {
        const [rows] = await connection.execute(
            'SELECT refresh_token FROM users WHERE phone_number = ? LIMIT 1',
            [phoneNumber]
        );
        const result = rows as { refresh_token: string }[];
        return result.length > 0 ? result[0].refresh_token : null;
    } catch (error) {
        logger.error('Error getting user refresh token:', error);
        throw error;
    } finally {
        await connection.end();
    }
};

export default {
    createUsersTable,
    findUserByPhoneNumber,
    createUser,
    setUserRefreshToken,
    getUserRefreshToken
}; 