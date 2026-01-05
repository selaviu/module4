import express from 'express';
import {
  get,
  create,
  getCounts,
} from './stream.controller';
import validateDto from '../middleware/validateDto';
import { StreamCreateDto } from './dto/StreamCreateDto';
import { StreamCountsRequestDto } from './dto/StreamCountsRequestDto';

const router = express.Router();

router.get('', get);
router.post('', validateDto(StreamCreateDto), create);
router.post('/_counts', validateDto(StreamCountsRequestDto), getCounts);

export default router;
