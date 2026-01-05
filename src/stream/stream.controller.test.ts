import request from 'supertest';
import axios from 'axios';
import { describe, it, expect, beforeEach, afterAll, beforeAll, jest } from '@jest/globals';
import app from '../app';
import Stream from './stream.model';
import { startMongoContainer, stopMongoContainer, clearDatabase } from '../test/mongo.setup'; 

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Stream Module Integration (with Testcontainers)', () => {
  const SONG_ID = 'dae19752-7ba2-4726-87b6-7a59008886ac';

  beforeAll(async () => {
    await startMongoContainer();
  }, 60000); 

  afterAll(async () => {
    await stopMongoContainer();
  });

  beforeEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
  });

  describe('POST /api/streams (Create)', () => {
    it('1. Success: creates stream when song exists', async () => {
      mockedAxios.get.mockResolvedValue({ status: 200 });
      
      const res = await request(app)
        .post('/api/streams')
        .send({ songId: SONG_ID, userId: 'u1' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
    });

    it('2. Fail: returns 404 when song does not exist in external service', async () => {
      mockedAxios.get.mockRejectedValue({ response: { status: 404 } });

      const res = await request(app)
        .post('/api/streams')
        .send({ songId: 'invalid-id', userId: 'u1' });

      expect(res.status).toBe(404);
    });

    it('3. Fail: returns 400 when userId is missing', async () => {
      const res = await request(app)
        .post('/api/streams')
        .send({ songId: SONG_ID });
        
      expect(res.status).toBe(400);
    });

    it('4. Edge: handles long userId strings', async () => {
      mockedAxios.get.mockResolvedValue({ status: 200 });
      const longUserId = 'a'.repeat(500);
      
      const res = await request(app)
        .post('/api/streams')
        .send({ songId: SONG_ID, userId: longUserId });

      expect(res.status).toBe(201);
    });
  });

  describe('GET /api/streams (List)', () => {
    it('1. Success: returns list of streams for a specific song', async () => {
      mockedAxios.get.mockResolvedValue({ status: 200 });
      await Stream.create({ songId: SONG_ID, userId: 'u1', playedAt: new Date() });

      const res = await request(app)
        .get('/api/streams')
        .query({ entity1Id: SONG_ID });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
    });

    it('2. Fail: 400 if no entity1Id provided', async () => {
      const res = await request(app).get('/api/streams');
      expect(res.status).toBe(400);
    });

    it('3. Edge: returns empty array if no streams found for valid song', async () => {
      mockedAxios.get.mockResolvedValue({ status: 200 });
      const res = await request(app)
        .get('/api/streams')
        .query({ entity1Id: 'empty-song' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('4. Pagination: respects size and from parameters', async () => {
      mockedAxios.get.mockResolvedValue({ status: 200 });
      await Stream.create({ songId: SONG_ID, userId: 'u1' });
      await Stream.create({ songId: SONG_ID, userId: 'u2' });

      const res = await request(app)
        .get('/api/streams')
        .query({ entity1Id: SONG_ID, size: 1, from: 0 });

      expect(res.body.length).toBe(1);
    });
  });

  describe('POST /api/streams/_counts (Statistics)', () => {
    it('1. Success: counts streams for multiple IDs', async () => {
      await Stream.create({ songId: SONG_ID, userId: 'u1' });
      await Stream.create({ songId: 'another-id', userId: 'u2' });

      const res = await request(app)
        .post('/api/streams/_counts')
        .send({ entity1Ids: [SONG_ID, 'another-id'] });

      expect(res.status).toBe(200);
      expect(res.body[SONG_ID]).toBe(1);
      expect(res.body['another-id']).toBe(1);
    });

    it('2. Edge: empty array returns empty object', async () => {
      const res = await request(app)
        .post('/api/streams/_counts')
        .send({ entity1Ids: [] });

      expect(res.body).toEqual({});
    });

    it('3. Fail: returns 400 if entity1Ids is not an array', async () => {
      const res = await request(app)
        .post('/api/streams/_counts')
        .send({ entity1Ids: 'not-array' });

      expect(res.status).toBe(400);
    });

    it('4. Edge: handles duplicate IDs in one request', async () => {
      await Stream.create({ songId: SONG_ID, userId: 'u1' });

      const res = await request(app)
        .post('/api/streams/_counts')
        .send({ entity1Ids: [SONG_ID, SONG_ID] });

      expect(res.status).toBe(200);
      expect(res.body[SONG_ID]).toBe(1);
    });
  });
});