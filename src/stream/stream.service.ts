import * as streamRepository from './stream.repository';
import { StreamCreateDto } from './dto/StreamCreateDto';
import { StreamDetailsDto } from './dto/StreamDetailsDto';
import axios from 'axios';
export const create = async (createDto: StreamCreateDto): Promise<string> => {
  const isSongValid = await validateSongId(createDto.songId);

  if (!isSongValid) {
    throw new Error('SONG_NOT_FOUND');
  }

  return streamRepository.create(createDto);
};

export const validateSongId = async (songId: string): Promise<boolean> => {
  try {
    const response = await axios.get(
      `${process.env.SONGS_SERVICE_URL}/api/song/${songId}`,
    );

    return response.status === 200;
  } catch (error: any) {
    console.error('Error validating song:', error.message);
    return false;
  }
};

export const getList = async (
  songId: string,
  size: number,
  from: number,
): Promise<StreamDetailsDto[]> => {
  if (!songId) {
    throw new Error('INVALID_INPUT');
  }
  const isSongValid = await validateSongId(songId);

  if (!isSongValid) {
    throw new Error('SONG_NOT_FOUND');
  }

  const documents = await streamRepository.findAllBySongId(songId, size, from);

  return documents.map((doc) => ({
    id: doc._id.toString(),
    songId: doc.songId,
    userId: doc.userId,
    playedAt: doc.playedAt,
  }));
};

export const getStatsForSongs = async (
  ids: string[],
): Promise<Record<string, number>> => {
  console.log('Getting stats for songs:', ids);
  const counts: Record<string, number> = {};

  if (ids instanceof Array === false) {
    throw new Error('INVALID_INPUT');
  }
  await Promise.all(
    ids.map(async (id) => {
      counts[id] = await streamRepository.countBySongId(id);
    }),
  );

  return counts;
};
