import express from "express";
import { CreateAccount, LoginAccount, LogoutAccount } from '../controller/User';

const router = express.Router();

router.post('/register', CreateAccount);
router.post('/login', LoginAccount);
router.post('/logout', LogoutAccount);

export default router;