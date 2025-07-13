import express from "express";
import { UploadResume, DeleteResume } from "../controller/Resume";
// import { authMiddleware } from "../middleware/auth.middleware";

import multer from "multer";
const router = express.Router();

const upload = multer({dest:'upload/resume'})

router.post('/upload', upload.single('resume'), UploadResume);
router.delete('/delete/:id',  DeleteResume);


export default router;