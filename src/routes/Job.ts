import express from 'express'
const router = express.Router();

import { CreateJob, GetJobById, GetAllJobs, UpdateJob, DeleteJob } from '../controller/Job'

router.post('/job-create',CreateJob);
router.get('/job-get',GetAllJobs);
router.get('/job-get/:id',GetJobById);
router.put('/update-job',UpdateJob);
router.delete('/delete-job',DeleteJob);


export default router;