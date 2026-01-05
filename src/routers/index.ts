import express from 'express';
import streams from '../stream/stream.router';

const router = express.Router();

router.use('/api/streams', streams);

export default router;
