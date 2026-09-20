import { afterEach, describe, expect, it, vi } from 'vitest';

describe('MongoDB configuration', () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('exposes the MongoDB connection settings used by the app', async () => {
    process.env.NODE_ENV = 'test';
    process.env.MONGODB_URI = 'mongodb://localhost:27017/vehicles';
    process.env.MONGODB_DB_NAME = 'vehicles';

    const { config } = await import('../config.js');

    expect(config.MONGODB_URI).toBe('mongodb://localhost:27017/vehicles');
    expect(config.MONGODB_DB_NAME).toBe('vehicles');
  });

});
