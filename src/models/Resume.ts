import { createConnection } from '../db/db';
import { ResultSetHeader } from 'mysql2';
import { logger } from '../helpers/logger';

interface Resume {
    id?: number;
    file_url: string;
    created_at?: Date;
    updated_at?: Date;
}

export const createResumesTable = async () => {
    const connection = await createConnection();
    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS resumes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                file_url VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        await connection.execute(createTableQuery);
        logger.info('Resumes table created or already exists');
    } catch (error) {
        logger.error('Error creating resumes table:', error);
        throw error;
    } finally {
        await connection.end();
    }
};



export const createResume = async (fileUrl: string): Promise<Resume> => {
    const connection = await createConnection();
    try {
        const [result] = await connection.execute<ResultSetHeader>(
            'INSERT INTO resumes (file_url) VALUES (?)',
            [fileUrl]
        );
        return { id: result.insertId, file_url: fileUrl };
    } catch (error) {
        logger.error('Error creating resume:', error);
        throw error;
    } finally {
        await connection.end();
    }
};

export const deleteResume = async (id: number): Promise<void> => {
    const connection = await createConnection();
    try {
        const [result] = await connection.execute<ResultSetHeader>(
            'DELETE FROM resumes WHERE id = ?',
            [id]
        );
        if (result.affectedRows === 0) {
            throw new Error('Resume not found');
        }
    } catch (error) {
        logger.error('Error deleting resume:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

export default{
    createResumesTable,
    createResume,
    deleteResume
}