export const typeDefs = `#graphql
  """Vehicle type metadata returned by the NHTSA dataset."""
  type VehicleType {
    typeId: ID!
    typeName: String!
  }

  """A vehicle make with all associated vehicle type categories."""
  type VehicleMake {
    makeId: ID!
    makeName: String!
    vehicleTypes: [VehicleType!]!
  }

  type Query {
    """Return all transformed vehicle makes."""
    vehicleMakes: [VehicleMake!]!

    """Return a single vehicle make and its associated type list."""
    vehicleMake(makeId: ID!): VehicleMake
  }
`;
