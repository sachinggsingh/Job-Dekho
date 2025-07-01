import express from 'express'
const router = express.Router();

import { CreateJob, GetJobById, GetAllJobs, UpdateJob, DeleteJob } from '../controller/Job'
import { cacheMiddleware } from '../middleware/cache';

router.post('/job-create',CreateJob);
router.get('/job-get', cacheMiddleware(() => 'jobs:all'), GetAllJobs);
router.get('/job-get/:id', cacheMiddleware(req => `job:${req.params.id}`), GetJobById);
router.put('/update-job',UpdateJob);
router.delete('/delete-job',DeleteJob);


export default router;