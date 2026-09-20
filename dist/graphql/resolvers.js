import { getVehicleData, getVehicleMakeById } from '../repository.js';
export const resolvers = {
    Query: {
        vehicleMakes: () => getVehicleData(),
        vehicleMake: (_, { makeId }) => getVehicleMakeById(makeId),
    },
};
