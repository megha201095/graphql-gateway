import { config } from './config.js';
import { connectMongo } from './db.js';
import type { VehicleMakeWithTypes, VehicleType } from './ingestion.js';

let inMemoryVehicleData: VehicleMakeWithTypes[] = [];

async function persistMongoVehicleData(data: VehicleMakeWithTypes[]): Promise<void> {
  const database = await connectMongo();
  const collection = database.collection('vehicle_makes');

  await collection.deleteMany({});

  for (const make of data) {
    await collection.insertOne({
      makeId: make.makeId,
      makeName: make.makeName,
      vehicleTypes: make.vehicleTypes.map((type) => ({
        typeId: type.typeId,
        typeName: type.typeName,
      })),
    });
  }
}

export async function saveVehicleData(data: VehicleMakeWithTypes[]): Promise<void> {
  inMemoryVehicleData = data.map((make) => ({
    makeId: make.makeId,
    makeName: make.makeName,
    vehicleTypes: [...make.vehicleTypes]
      .map((type) => ({
        typeId: type.typeId,
        typeName: type.typeName,
      }))
      .sort((a, b) => a.typeName.localeCompare(b.typeName)),
  }));

  if (config.NODE_ENV !== 'test') {
    try {
      await persistMongoVehicleData(data);
    } catch (error) {
      console.warn('MongoDB persistence failed, keeping in-memory data only.', error);
    }
  }
}

type MongoVehicleMakeRecord = {
  _id?: unknown;
  makeId: string;
  makeName: string;
  vehicleTypes?: VehicleType[];
};

export async function getVehicleData(): Promise<VehicleMakeWithTypes[]> {
  if (config.NODE_ENV === 'test') {
    return [...inMemoryVehicleData]
      .sort((a, b) => a.makeName.localeCompare(b.makeName))
      .map((make) => ({
        ...make,
        vehicleTypes: [...make.vehicleTypes].sort((a, b) => a.typeName.localeCompare(b.typeName)),
      }));
  }

  try {
    const database = await connectMongo();
    const rows = await database
      .collection<MongoVehicleMakeRecord>('vehicle_makes')
      .find({})
      .sort({ makeName: 1 })
      .toArray();

    return rows
      .map(({ _id, ...make }) => ({
        makeId: make.makeId,
        makeName: make.makeName,
        vehicleTypes: (make.vehicleTypes ?? [])
          .map((type: VehicleType) => ({
            typeId: type.typeId,
            typeName: type.typeName,
          }))
          .sort((a: VehicleType, b: VehicleType) => a.typeName.localeCompare(b.typeName)),
      }))
      .sort((a: VehicleMakeWithTypes, b: VehicleMakeWithTypes) => a.makeName.localeCompare(b.makeName));
  } catch (error) {
    console.warn('MongoDB lookup failed, returning in-memory data.', error);
    return [...inMemoryVehicleData]
      .sort((a, b) => a.makeName.localeCompare(b.makeName))
      .map((make) => ({
        ...make,
        vehicleTypes: [...make.vehicleTypes].sort((a, b) => a.typeName.localeCompare(b.typeName)),
      }));
  }
}

export async function getVehicleMakeById(makeId: string): Promise<VehicleMakeWithTypes | undefined> {
  const rows = await getVehicleData();
  return rows.find((make) => make.makeId === makeId);
}
