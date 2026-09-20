import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('GraphQL query integration', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'graphql-gateway-'));

    process.env.NODE_ENV = 'test';
    process.env.PORT = '4001';
    process.env.LOG_LEVEL = 'error';
    process.env.DATABASE_URL = path.join(tempDir, 'vehicles.db');
    process.env.INGEST_ON_STARTUP = 'false';

    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('returns persisted vehicle data through the GraphQL query layer', async () => {
    const { saveVehicleData } = await import('../repository.js');
    const { ApolloServer } = await import('@apollo/server');
    const { typeDefs } = await import('../graphql/typeDefs.js');
    const { resolvers } = await import('../graphql/resolvers.js');

    saveVehicleData([
      {
        makeId: '440',
        makeName: 'TOYOTA',
        vehicleTypes: [
          { typeId: '2', typeName: 'Passenger Car' },
          { typeId: '7', typeName: 'Multipurpose Passenger Vehicle (MPV)' },
        ],
      },
    ]);

    const server = new ApolloServer({
      typeDefs,
      resolvers,
    });

    const result = await server.executeOperation({
      query: `
        query GetVehicleMakes {
          vehicleMakes {
            makeId
            makeName
            vehicleTypes {
              typeId
              typeName
            }
          }
        }
      `,
    });

    expect(result.body.kind).toBe('single');

    if (result.body.kind !== 'single') {
      throw new Error('Expected single GraphQL result body');
    }

    expect(result.body.singleResult.errors).toBeUndefined();
    expect(result.body.singleResult.data).toEqual({
      vehicleMakes: [
        {
          makeId: '440',
          makeName: 'TOYOTA',
          vehicleTypes: [
            { typeId: '7', typeName: 'Multipurpose Passenger Vehicle (MPV)' },
            { typeId: '2', typeName: 'Passenger Car' },
          ],
        },
      ],
    });
  });
});
