import express from "express";
import { CreateAccount, LoginAccount, LogoutAccount, RefreshToken } from '../controller/User';

const router = express.Router();

router.post('/register', CreateAccount);
router.post('/login', LoginAccount);
router.post('/logout', LogoutAccount);
router.post('/refresh-token', RefreshToken);

export default router;