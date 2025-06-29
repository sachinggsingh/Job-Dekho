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