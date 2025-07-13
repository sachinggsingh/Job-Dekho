import Joi from 'joi'
import { Request, Response, NextFunction } from 'express';

export const SignUpValidation = Joi.object({
    name: Joi.string().required().trim().min(2).max(25).messages({
        "string.empty": "Name is required",
        "string.min": "Name must be at least 2 characters long",
        "string.max": "Name must not exceed 25 characters",
        "any.required": "Name is required"
    }),
    phoneNumber: Joi.string().required().pattern(/^\d{10}$/).messages({
        "string.empty": "Phone number is required",
        "string.pattern.base": "Phone number must be exactly 10 digits",
        "any.required": "Phone number is required"
    }),
    role: Joi.string().required().valid('HR', 'jobSeeker').messages({
        "string.empty": "Role is required",
        "any.only": "Role must be either 'HR' or 'jobSeeker'",
        "any.required": "Role is required"
    }),
    password: Joi.string().required().min(6).max(50).messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 6 characters long",
        "string.max": "Password must not exceed 50 characters",
        "any.required": "Password is required"
    }),
    note: Joi.string().optional().allow('').max(500).messages({
        "string.base": "Note must be a string",
        "string.max": "Note must not exceed 500 characters"
    }),
})

export const LoginValidation = Joi.object({
    phoneNumber: Joi.string().required().pattern(/^\d{10}$/).messages({
        "string.empty": "Phone number is required",
        "string.pattern.base": "Phone number must be exactly 10 digits",
        "any.required": "Phone number is required"
    }),
    password: Joi.string().required().messages({
        "string.empty": "Password is required",
        "any.required": "Password is required"
    }),
})

export const JobValidation = Joi.object({
    title: Joi.string().required().trim().min(2).max(100).messages({
        "string.empty": "Job title is required",
        "string.min": "Job title must be at least 2 characters long",
        "string.max": "Job title must not exceed 100 characters",
        "any.required": "Job title is required"
    }),
    description: Joi.string().required().trim().min(10).max(1000).messages({
        "string.empty": "Job description is required",
        "string.min": "Job description must be at least 10 characters long",
        "string.max": "Job description must not exceed 1000 characters",
        "any.required": "Job description is required"
    }),
    company_name: Joi.string().required().trim().min(2).max(100).messages({
        "string.empty": "Company name is required",
        "string.min": "Company name must be at least 2 characters long",
        "string.max": "Company name must not exceed 100 characters",
        "any.required": "Company name is required"
    }),
    location: Joi.string().required().trim().min(2).max(100).messages({
        "string.empty": "Job location is required",
        "string.min": "Job location must be at least 2 characters long",
        "string.max": "Job location must not exceed 100 characters",
        "any.required": "Job location is required"
    }),
    salary_range: Joi.string().min(0).required().messages({
        "number.base": "Salary must be a number",
        "number.min": "Salary must be at least 0",
        "any.required": "Salary is required"
    }),
    job_type: Joi.string().required().valid('Full-Time', 'Part-Time', 'Internship', 'Contract').messages({
        "string.empty": "Job type is required",
        "any.only": "Job type must be one of 'Full-Time', 'Part-Time', 'Internship', or 'Contract'",
        "any.required": "Job type is required"
    }),
    hr_id: Joi.number().integer().required().messages({
        "number.base": "HR ID must be a number",
        "number.integer": "HR ID must be an integer", 
        "any.required": "HR ID is required"
    })
})

export const ResumeValidation = Joi.object({
    fileUrl: Joi.string().uri().required().messages({
        "string.empty": "File URL is required",
        "string.uri": "File URL must be a valid URI",
        "any.required": "File URL is required"
    })
});



// Joi validation middleware
export const validateWithJoi = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessage = error.details.map(detail => detail.message);
            res.status(400).json({ errors: errorMessage });
            return;
        }
        next();
    };
};