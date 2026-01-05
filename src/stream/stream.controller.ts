import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { StreamCreateDto } from './dto/StreamCreateDto';
import { StreamDetailsDto } from './dto/StreamDetailsDto';
import { StreamCountsRequestDto } from './dto/StreamCountsRequestDto';
import * as streamService from './stream.service';
import { plainToInstance } from 'class-transformer';

export const get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { entity1Id, size, from } = req.query;
    
    const results = await streamService.getList(
      entity1Id as string, 
      Number(size) || 10, 
      Number(from) || 0
    );

    res.json(results);
  } catch (error: any) {
    if (error.message === 'SONG_NOT_FOUND') {
      res.status(404).json({ error: 'Song not found' });
      return;
    }
    if (error.message === 'INVALID_INPUT') {
       res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid input' });
       return;
    }
    next(error);
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {

    const streamCreateDto = plainToInstance(StreamCreateDto, req.body); 

    const id = await streamService.create(streamCreateDto);

    res.status(StatusCodes.CREATED).json({
      id,
    });
  } catch (error: any) {
    if (error.message === 'SONG_NOT_FOUND') {
       res.status(StatusCodes.NOT_FOUND).json({ error: 'Song not found' });
       return;
    }
    
    next(error);
  }
};

export const getCounts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { entity1Ids } = plainToInstance(StreamCountsRequestDto, req.body);
        
        const counts = await streamService.getStatsForSongs(entity1Ids);
        res.json(counts);
    } catch (error : any) {
        if (error.message === 'INVALID_INPUT') {
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid input' });
      return;
    }
        next(error);
    }
}