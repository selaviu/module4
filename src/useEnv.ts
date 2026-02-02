interface Env {
  PORT: number;
  HOST: string;
  MONGO_ADDRESS: string;
  SONGS_SERVICE_URL: string;
}

const ERROR_MESSAGE = '❌ Missing or invalid environment variable:';

export const useEnv = (): Env => {
  const { PORT, HOST, MONGO_ADDRESS, SONGS_SERVICE_URL } = process.env;

  if (!PORT || isNaN(parseInt(PORT, 10))) {
    throw new Error(`${ERROR_MESSAGE} PORT`);
  }

  if (!HOST) {
    throw new Error(`${ERROR_MESSAGE} HOST`);
  }

  if (!MONGO_ADDRESS) {
    throw new Error(`${ERROR_MESSAGE} MONGO_ADDRESS`);
  }

  if (!SONGS_SERVICE_URL) {
    throw new Error(`${ERROR_MESSAGE} SONG_SERVICE_URL`);
  }

  return {
    PORT: parseInt(PORT, 10),
    HOST,
    MONGO_ADDRESS,
    SONGS_SERVICE_URL,
  };
};
