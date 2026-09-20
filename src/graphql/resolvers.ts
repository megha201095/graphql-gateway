import { getVehicleData, getVehicleMakeById } from '../repository.js';

export const resolvers = {
  Query: {
    vehicleMakes: async () => getVehicleData(),
    vehicleMake: async (_: unknown, { makeId }: { makeId: string }) => getVehicleMakeById(makeId),
  },
};
