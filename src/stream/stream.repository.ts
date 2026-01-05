
import { StreamCreateDto } from './dto/StreamCreateDto';
import Stream, { StreamData } from './stream.model';

export const create = async (
  streamData: StreamCreateDto,
): Promise<string> => {
  const stream = await new Stream(streamData).save();

  return stream._id.toString();
};

export const findAllBySongId = async (songId: string, size: number, from: number) => {
  
  return Stream.find({ songId })
    .sort({ playedAt: -1 })
    .skip(from)      
    .limit(size)         
    .exec();
};

export const countBySongId = async (songId: string): Promise<number> => {
  return Stream.countDocuments({ songId }).exec();
}