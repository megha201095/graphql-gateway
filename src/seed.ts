import { config } from './config.js';
import { ingestVehicleData, type IngestionOptions } from './ingestion.js';
import { saveVehicleData } from './repository.js';

export async function seedVehicleCatalog(options?: Partial<IngestionOptions>): Promise<Awaited<ReturnType<typeof ingestVehicleData>>> {
  const data = await ingestVehicleData({
    makesUrl: options?.makesUrl ?? config.NHTSA_GET_ALL_MAKES_URL,
    vehicleTypesUrlTemplate: options?.vehicleTypesUrlTemplate ?? config.NHTSA_GET_VEHICLE_TYPES_URL,
    fetcher: options?.fetcher,
    maxMakes: options?.maxMakes ?? config.MAX_MAKES_TO_INGEST,
  });

  if (config.NODE_ENV !== 'test') {
    await saveVehicleData(data);
  }

  return data;
}
