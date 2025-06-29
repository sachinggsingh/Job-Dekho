import { Request, Response } from 'express';
import { logger } from '../helpers/logger';
import { findUserByPhoneNumber, createUser } from '../models/User';
import { hash, compare } from 'bcrypt';
import { SignUpValidation, LoginValidation } from '../helpers/validations';

export const CreateAccount = async (req: Request, res: Response): Promise<void> => {
  try {
        const validationResult = SignUpValidation.validate(req.body, { abortEarly: false });
    if (validationResult.error) {
      const errorMessages = validationResult.error.details.map(detail => detail.message);
      logger.warn(`User validation failed: ${errorMessages.join(', ')}`);
      res.status(400).json({ error: "Validation failed", details: errorMessages, success: false });
      return;
    }


      const { name, phoneNumber, password, role, note } = req.body;
    // Check if required fields exist
    if (!name || !phoneNumber || !password || !role) {
      logger.error("Missing required fields in request body");
      res.status(400).json({ 
        error: "Missing required fields: name, phoneNumber, password, role", 
        success: false 
      });
      return;
    }

    const existingUser = await findUserByPhoneNumber(phoneNumber);
    if (existingUser) {
      res.status(400).json({ error: "User already exists with this phone number", success: false });
      return;
    }

    const hashedPassword = await hash(password, 10);

    const newUser = await createUser({
      name,
      phoneNumber,
      role,
      password: hashedPassword,
      note: note || ''
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
        note: newUser.note
      },
      success: true
    });

  } catch (error) {
    logger.error(`Problem in CreateAccount: ${(error as Error).message}`);
    res.status(500).json({ error: "Internal Server Error", success: false });
  }
};

export const LoginAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber, password } = req.body;

    const validationResult = LoginValidation.validate(req.body, { abortEarly: false });
    if (validationResult.error) {
      const errorMessages = validationResult.error.details.map(detail => detail.message);
      logger.warn(`Login validation failed: ${errorMessages.join(', ')}`);
      res.status(400).json({ error: "Validation failed", details: errorMessages, success: false });
      return;
    }

    const user = await findUserByPhoneNumber(phoneNumber);
    if (!user) {
      res.status(404).json({ error: "User not found with this phone number", success: false });
      return;
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid password", success: false });
      return;
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        note: user.note
      },
      success: true
    });

  } catch (error) {
    logger.error(`Error in LoginAccount: ${(error as Error).message}`);
    res.status(500).json({ error: "Internal Server Error", success: false });
  }
};

export const LogoutAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info("User logged out successfully");
    res.status(200).json({ message: "Logged out successfully", success: true });
  } catch (error) {
    logger.error(`Error in LogoutAccount: ${(error as Error).message}`);
    res.status(500).json({ error: "Internal Server Error", success: false });
  }
}; 