import { createConnection } from '../db/db';
import { logger } from '../helpers/logger';
import { ResultSetHeader } from 'mysql2';

export interface Job {
    id?: number;
    title: string;
    description: string;
    company_name: string;
    location?: string;
    salary_range: string;
    job_type: 'Full-Time' | 'Part-Time' | 'Internship' | 'Contract';
    hr_id: number;
    created_at?: Date;
    updated_at?: Date;
}
interface JobSearchOptions {
    page: number;
    limit: number;
    title?: string;
    location?: string;
    job_type?: string;
}
export const createJobsTable = async () => {
    const connection = await createConnection();
    try {
        const createTableQuery = `
        CREATE TABLE IF NOT EXISTS jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        company_name VARCHAR(100) NOT NULL,
        location VARCHAR(100) DEFAULT NULL,
        salary_range VARCHAR(50) NOT NULL,
        job_type ENUM('Full-Time', 'Part-Time', 'Internship', 'Contract') NOT NULL,
        hr_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (hr_id) REFERENCES users(id)
        );
    `;
        await connection.execute(createTableQuery);
        logger.info('Jobs table created or already exists');
    } catch (error) {
        logger.error('Error creating jobs table:', error);
        throw error;
    } finally {
        await connection.end();
    }
};

export const createJob = async (job: Job): Promise<Job> => {
    const connection = await createConnection();
    try {
        const [result] = await connection.execute(
            `INSERT INTO jobs (title, description, company_name, location, salary_range, job_type, hr_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [job.title, job.description, job.company_name, job.location, job.salary_range, job.job_type, job.hr_id]
        );
        const insertResult = result as ResultSetHeader;
        const jobId = insertResult.insertId;

        // Fetch the created job
        const [rows] = await connection.execute(
            'SELECT * FROM jobs WHERE id = ?',
            [jobId]
        );
        const jobs = rows as Job[];
        return jobs[0];
    } catch (error) {
        logger.error('Error creating job:', error);
        throw error;
    }
    finally {
        await connection.end();
    }
}

export const getJobById = async (id: number): Promise<Job | null> => {
    const connection = await createConnection();
    try {
        const [rows]: any = await connection.execute(`SELECT * FROM jobs WHERE id = ?`, [id]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        logger.error("Error in getting the Job by ID:", error)
        throw error;
    } finally {
        await connection.end()
    }
}
export const getAllJobs = async ({
    page,
    limit,
    title = '',
    location = '',
    job_type = ''} :JobSearchOptions 
): Promise<{ jobs: Job[]; total: number }> => {
    const connection = await createConnection();

    // ✅ Make sure these are integers
    const parsedLimit = Number(limit);
    const parsedPage = Number(page);
    const offset = (parsedPage - 1) * parsedLimit;
    const filters : string[] = [];
    const params : any[] = [];
    if (title) {
        filters.push(`title LIKE ?`);
        params.push(`%${title}%`);
    }
    if (location) {
        filters.push(`location LIKE ?`);
        params.push(`%${location}%`);
    }
    if (job_type) {
        filters.push(`job_type = ?`);
        params.push(job_type);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    const jobQuery = `
    SELECT * FROM jobs
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
`;

const countQuery = `
    SELECT COUNT(*) as total FROM jobs
    ${whereClause}
`;

try {
    const [rows] = await connection.execute(jobQuery, params);
    const [countResult] = await connection.execute(countQuery, params);
    const total = (countResult as any)[0].total;

    return { jobs: rows as Job[], total };
} catch (error) {
    logger.error("Error in searching jobs", error);
    throw error;
} finally {
    await connection.end();
}
};


export const updateJob = async (id: number, job: Partial<Job>): Promise<Job | null> => {
    const connection = await createConnection();
    try {
        // Update the job
        await connection.execute(
            `UPDATE jobs SET title=?, description=?, company_name=?, location=?, salary_range=?, job_type=? WHERE id=?`,
            [job.title, job.description, job.company_name, job.location, job.salary_range, job.job_type, id]
        );

        // Fetch and return the updated job
        const [rows]: any = await connection.execute(`SELECT * FROM jobs WHERE id = ?`, [id]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        logger.error("Error in the job Update", error)
        throw error;
    } finally {
        await connection.end();
    }
}

export const deleteJob = async (id: number): Promise<boolean> => {
    const connection = await createConnection();
    try {
        const [result] = await connection.execute(
            `DELETE FROM jobs WHERE id = ?`,
            [id]
        );

        
        // mysql2 returns a ResultSetHeader for DELETE
        const { affectedRows } = result as any;
        return affectedRows > 0;
    } catch (error) {
        logger.error("Error in Deleting Job", error);
        throw error;
    } finally {
        await connection.end();
    }
}

export const findJobCompanyTitleAndDescription = async (title:string,company:string,description:string,job_type:string):Promise<Job | null>=>{
    const connection = await createConnection();
    try {
        const [result] = await connection.execute(`SELECT * FROM jobs WHERE title = ? AND company_name = ? AND description = ? AND job_type = ?`,
            [title, company, description,job_type])
            const jobs = result as Job[];
        return jobs.length > 0 ? jobs[0] : null;
    } catch (error) {
        logger.error("Error in findJobCompanyTitleAndDescription");
        throw error
    }finally{
        await connection.end();
    }
}