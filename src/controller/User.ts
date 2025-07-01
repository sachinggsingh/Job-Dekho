import { Request, Response } from 'express';
import { logger } from '../helpers/logger';
import { findUserByPhoneNumber, createUser, setUserRefreshToken, getUserRefreshToken } from '../models/User';
import { hash, compare } from 'bcrypt';
import { SignUpValidation, LoginValidation } from '../helpers/validations';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../helpers/jwt';
import { sendMessage } from '../helpers/twillio';

export const CreateAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info(`CreateAccount called with body: ${JSON.stringify(req.body)}`);
    logger.info(`Content-Type: ${req.get('Content-Type')}`);
    if (!req.body) {
      logger.error("Request body is undefined");
      res.status(400).json({ error: "Request body is required", success: false });
      return;
    }
    const { name, phoneNumber, password, role, note } = req.body;
    if (!name || !phoneNumber || !password || !role) {
      logger.error("Missing required fields in request body");
      res.status(400).json({ error: "Missing required fields: name, phoneNumber, password, role", success: false });
      return;
    }
    const validationResult = SignUpValidation.validate(req.body, { abortEarly: false });
    if (validationResult.error) {
      const errorMessages = validationResult.error.details.map(detail => detail.message);
      logger.warn(`User validation failed: ${errorMessages.join(', ')}`);
      res.status(400).json({ error: "Validation failed", details: errorMessages, success: false });
      return;
    }
    const existingUser = await findUserByPhoneNumber(phoneNumber);
    if (existingUser) {
      res.status(400).json({ error: "User already exists with this phone number", success: false });
      return;
    }
    const hashedPassword = await hash(password, 10);
    // JWT tokens
    const payload = { id: undefined, phoneNumber, role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    const newUser = await createUser({
      name,
      phoneNumber,
      role,
      password: hashedPassword,
      note: note || '',
      refreshToken
    });
    await setUserRefreshToken(phoneNumber, refreshToken);
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
        note: newUser.note
      },
      accessToken,
      refreshToken,
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
    // JWT tokens
    const payload = { id: user.id, phoneNumber: user.phoneNumber, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    await setUserRefreshToken(phoneNumber, refreshToken);
    // sendMessage(phoneNumber);
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        note: user.note
      },
      accessToken,
      refreshToken,
      success: true
    });
  } catch (error) {
    logger.error(`Error in LoginAccount: ${(error as Error).message}`);
    res.status(500).json({ error: "Internal Server Error", success: false });
  }
};

export const RefreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken, phoneNumber } = req.body;
  if (!refreshToken || !phoneNumber) {
    res.status(403).json({ error: "Refresh token and phone number are required, login again" });
    return;
  }
  try {
    const storedToken = await getUserRefreshToken(phoneNumber);
    if (!storedToken || storedToken !== refreshToken) {
      res.status(403).json({ error: "Refresh token not found or does not match, login again" });
      return;
    }
    const userData = verifyRefreshToken(refreshToken) as any;
    const newAccessToken = generateAccessToken({ id: userData.id, phoneNumber: userData.phoneNumber, role: userData.role });
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ error: "Invalid refresh token" });
  }
};

export const LogoutAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber } = req.body;
    if (phoneNumber) {
      await setUserRefreshToken(phoneNumber, ''); // Clear the refresh token
    }
    logger.info("User logged out successfully");
    res.status(200).json({ message: "Logged out successfully", success: true });
  } catch (error) {
    logger.error(`Error in LogoutAccount: ${(error as Error).message}`);
    res.status(500).json({ error: "Internal Server Error", success: false });
  }
}; 