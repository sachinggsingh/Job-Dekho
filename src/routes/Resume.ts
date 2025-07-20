import express from "express";
import { UploadResume, DeleteResume } from "../controller/Resume";

import multer from "multer";
const router = express.Router();

// Only allow PDF files
const upload = multer({
    dest: 'upload/resume',
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'));
        }
    }
});

router.post('/upload',upload.single('resume'), UploadResume);
router.delete('/delete/:id',  DeleteResume);


export default router;