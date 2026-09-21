import { describe, it, expect, vi } from 'vitest';

import {
  transformVehicleMakesXml,
  transformVehicleTypesXml,
  ingestVehicleData,
} from '../ingestion.js';

const makesXml = `
<Response xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <Count>2</Count>
  <Message>Response returned successfully</Message>
  <Results>
    <AllVehicleMakes>
      <Make_ID>440</Make_ID>
      <Make_Name>TOYOTA</Make_Name>
    </AllVehicleMakes>
    <AllVehicleMakes>
      <Make_ID>441</Make_ID>
      <Make_Name>FORD</Make_Name>
    </AllVehicleMakes>
  </Results>
</Response>`;

const typesXml = `
<Response xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <Count>2</Count>
  <Message>Response returned successfully</Message>
  <SearchCriteria>Make ID: 440</SearchCriteria>
  <Results>
    <VehicleTypesForMakeIds>
      <VehicleTypeId>2</VehicleTypeId>
      <VehicleTypeName>Passenger Car</VehicleTypeName>
    </VehicleTypesForMakeIds>
    <VehicleTypesForMakeIds>
      <VehicleTypeId>7</VehicleTypeId>
      <VehicleTypeName>Multipurpose Passenger Vehicle (MPV)</VehicleTypeName>
    </VehicleTypesForMakeIds>
  </Results>
</Response>`;

describe('NHTSA XML transformation', () => {
  it('converts XML make records into the unified JSON shape', () => {
    expect(transformVehicleMakesXml(makesXml)).toEqual([
      { makeId: '440', makeName: 'TOYOTA' },
      { makeId: '441', makeName: 'FORD' },
    ]);
  });

  it('converts XML vehicle type records into typed entries', () => {
    expect(transformVehicleTypesXml(typesXml)).toEqual([
      { typeId: '2', typeName: 'Passenger Car' },
      { typeId: '7', typeName: 'Multipurpose Passenger Vehicle (MPV)' },
    ]);
  });

  it('calls the remote XML endpoints and merges the final dataset', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        text: async () => makesXml,
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => typesXml,
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => '',
      });

    const result = await ingestVehicleData({
      makesUrl: 'https://example.test/makes?format=XML',
      vehicleTypesUrlTemplate: 'https://example.test/makes/{makeId}?format=xml',
      fetcher: fetchMock,
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result).toEqual([
      {
        makeId: '440',
        makeName: 'TOYOTA',
        vehicleTypes: [
          { typeId: '2', typeName: 'Passenger Car' },
          { typeId: '7', typeName: 'Multipurpose Passenger Vehicle (MPV)' },
        ],
      },
      {
        makeId: '441',
        makeName: 'FORD',
        vehicleTypes: [],
      },
    ]);
  });

  it('limits how many makes are processed during ingestion', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        text: async () => makesXml,
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => typesXml,
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => '',
      });

    const result = await ingestVehicleData({
      makesUrl: 'https://example.test/makes?format=XML',
      vehicleTypesUrlTemplate: 'https://example.test/makes/{makeId}?format=xml',
      fetcher: fetchMock,
      maxMakes: 1,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      makeId: '440',
      makeName: 'TOYOTA',
    });
  });

  it('seeds the ingested XML dataset into the Mongo repository', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        text: async () => makesXml,
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => typesXml,
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => '',
      });

    const { seedVehicleCatalog } = await import('../seed.js');

    const result = await seedVehicleCatalog({
      makesUrl: 'https://example.test/makes?format=XML',
      vehicleTypesUrlTemplate: 'https://example.test/makes/{makeId}?format=xml',
      fetcher: fetchMock,
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result[0]).toMatchObject({
      makeId: '440',
      makeName: 'TOYOTA',
    });
  });
});
