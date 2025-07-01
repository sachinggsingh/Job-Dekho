import { Request, Response } from "express";
import { logger } from "../helpers/logger";
import { createJob, getAllJobs, getJobById, updateJob, deleteJob, findJobCompanyTitleAndDescription } from "../models/Job";
import { JobValidation } from "../helpers/validations";
import {  deleteCache } from '../utils/cache';
    
export const CreateJob = async (req: Request, res: Response): Promise<void> => {
    try {
        const validationResult = JobValidation.validate(req.body, { abortEarly: false });
        if (validationResult.error) {
            const errorMessages = validationResult.error.details.map(detail => detail.message);
            logger.warn(`Job validation failed: ${errorMessages.join(', ')}`);
            res.status(400).json({ error: "Validation failed", details: errorMessages, success: false });
            return;
        }

        const { title, description, company_name, salary_range, job_type, hr_id, location } = req.body;
        if (!title || !description || !company_name || !salary_range || !job_type || !hr_id) {
            logger.error("Missing required fields in request body");
            res.status(400).json({
                error: "Missing required fields: name, phoneNumber, password, role",
                success: false
            });
            return;
        }
        // existing job already created
        const existingJob = await findJobCompanyTitleAndDescription(title, company_name, description);
        if (existingJob) {
            res.status(400).json({ error: "Job already exists with this phone number", success: false });
            return;
        }

        const newJob = await createJob({
            title, description, company_name, salary_range, job_type, hr_id, location
        })
        // Invalidate all jobs cache
        await deleteCache('jobs:all');
        res.status(201).json({ msg: `Job created successfully`, newJob, success: true });
    } catch (error) {
        logger.error("Error in CreateJob controller", error)
        res.status(500).json({ msg: "Internal Server error", success: false });
    }
}

export const GetAllJobs = async (req: Request, res: Response): Promise<void> => {
    try {
        const jobs = await getAllJobs();
        if(!jobs){
            logger.error("No jobs found")
            res.status(404).json({msg:"No jobs at all",success:false})
            return;
        }
        res.status(200).json({ jobs, success: true });
    } catch (error) {
        logger.error("Error in GetAllJobs controller", error);
        res.status(500).json({ msg: "Internal Server error", success: false });
    }
}

export const GetJobById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: "Job ID is required", success: false });
            return;
        }
        const job = await getJobById(Number(id));
        if (!job) {
            res.status(404).json({ error: "Job not found", success: false });
            return;
        }
        res.status(200).json({ job, success: true });
    } catch (error) {
        logger.error("Error in GetJobById controller", error);
        res.status(500).json({ msg: "Internal Server error", success: false });
    }
}

export const UpdateJob = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: "Job ID is required", success: false });
            return;
        }
        const updatedJob = await updateJob(Number(id), req.body);
        if (!updatedJob) {
            res.status(404).json({ error: "Job not found or not updated", success: false });
            return;
        }
        // Invalidate caches
        await deleteCache('jobs:all');
        await deleteCache(`job:${id}`);
        res.status(200).json({ msg: "Job updated successfully", updatedJob, success: true });
    } catch (error) {
        logger.error("Error in UpdateJob controller", error);
        res.status(500).json({ msg: "Internal Server error", success: false });
    }
}

export const DeleteJob = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: "Job ID is required", success: false });
            return;
        }
        const deleted = await deleteJob(Number(id));
        if (!deleted) {
            res.status(404).json({ error: "Job not found or not deleted", success: false });
            return;
        }
        // Invalidate caches
        await deleteCache('jobs:all');
        await deleteCache(`job:${id}`);
        res.status(200).json({ msg: "Job deleted successfully", success: true });
    } catch (error) {
        logger.error("Error in DeleteJob controller", error);
        res.status(500).json({ msg: "Internal Server error", success: false });
    }
}