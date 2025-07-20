import { createResume, deleteResume } from "../models/Resume";
import { ResumeValidation } from "../helpers/validations";
import { Request, Response } from "express";
import { logger } from "../helpers/logger";
import cloudinary from "../helpers/cloudinary";

export const UploadResume = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        // Only validate fields that are actually sent in the form-data
        const validationResult = ResumeValidation.validate(
            {},
            { abortEarly: false }
        );

        if (!req.file || !req.file.path) {
            res.status(400).json({ message: "No file uploaded", success: false });
            return;
        }
        // If uploading to Cloudinary:
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "resumes",
            resource_type: "raw",
        });
        const resume = await createResume(result.secure_url);

        res.status(201).json({
            message: "Resume uploaded successfully",
            resume,
            success: true,
        });
    } catch (error) {
        logger.error("Error uploading resume:", error);
        res.status(500).json({
            message: "Failed to upload resume",
            error: "uploadResume Failed",
            success: false,
        });
    }
};

export const DeleteResume = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ message: "Resume ID is required" });
            return;
        }
        await cloudinary.uploader.destroy(`resumes/${id}`, {
            resource_type: "raw",
        });
        await deleteResume(Number(id));
        res.status(200).json({
            message: "Resume deleted successfully",
            success: true,
        });
    } catch (error) {
        logger.error("Error deleting resume:", error);
        res.status(500).json({
            message: "Failed to delete resume",
            error: "deleteResume Failed",
            success: false,
        });
    }
};
