# GraphQL Vehicle Gateway

A TypeScript GraphQL service that ingests the NHTSA vehicle make catalog from XML endpoints, transforms it into a unified JSON shape, stores it in MongoDB, and exposes it through a single GraphQL API.

## Features

- XML ingestion from NHTSA endpoints
- Transformation into a normalized make + vehicle type shape
- MongoDB persistence for the transformed catalog
- Apollo GraphQL API with typed queries
- JSON structured logging
- Docker support
- Environment validation via Zod

## Local setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the app in development mode:
   ```bash
   npm run dev
   ```
4. Or build and run the production bundle:
   ```bash
   npm run build
   npm run start
   ```

The server listens on the configured port, defaulting to `4000`.

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `NODE_ENV` | `development` | Runtime environment (`development`, `test`, `production`) |
| `PORT` | `4000` | Apollo GraphQL server port |
| `LOG_LEVEL` | `info` | Pino logging level |
| `MONGODB_URI` | `mongodb://localhost:27017/vehicles` | MongoDB connection string |
| `MONGODB_DB_NAME` | `Vehicle-Service` | Mongo database name |
| `NHTSA_GET_ALL_MAKES_URL` | `https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML` | Endpoint used to fetch all makes |
| `NHTSA_GET_VEHICLE_TYPES_URL` | `https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId/{makeId}?format=xml` | Endpoint template for per-make types |
| `INGEST_ON_STARTUP` | `true` | Ingest and persist vehicle data when the service starts |

## Build and test

```bash
npm run typecheck
npm test
npm run build
```

## Data model

The transformed dataset follows the structure below:

```json
[
  {
    "makeId": "440",
    "makeName": "TOYOTA",
    "vehicleTypes": [
      {
        "typeId": "2",
        "typeName": "Passenger Car"
      }
    ]
  }
]
```

## GraphQL schema

```graphql
 type VehicleType {
   typeId: ID!
   typeName: String!
 }

 type VehicleMake {
   makeId: ID!
   makeName: String!
   vehicleTypes: [VehicleType!]!
 }

 type Query {
   vehicleMakes: [VehicleMake!]!
   vehicleMake(makeId: ID!): VehicleMake
 }
```

## Example GraphQL queries

```graphql
query GetAllMakes {
  vehicleMakes {
    makeId
    makeName
    vehicleTypes {
      typeId
      typeName
    }
  }
}

query GetMakeById($makeId: ID!) {
  vehicleMake(makeId: $makeId) {
    makeId
    makeName
    vehicleTypes {
      typeId
      typeName
    }
  }
}
```

## Ingestion pipeline

1. Fetch all vehicle makes from the NHTSA XML endpoint.
2. Parse XML into JavaScript objects.
3. For each make, fetch that make's vehicle type list using the template endpoint.
4. Transform the normalized records to the final JSON shape.
5. Persist the result to MongoDB.
6. Expose the persisted dataset through GraphQL.

## Error handling and logging

- Network call failures are caught and logged as structured JSON events.
- XML parsing issues are isolated to the transformation logic and fail gracefully.
- Database write failures during persistence are surfaced through startup failures.
- Startup and shutdown events are logged with Pino.

## Docker

Build the container:

```bash
docker build -t graphql-gateway .
```

Run it locally:

```bash
docker run --rm -p 4000:4000 --env-file .env graphql-gateway
```

The image is kept minimal for the Node.js TypeScript runtime and MongoDB client, without any SQLite-specific build dependency.

## Docker Compose

```bash
docker compose up --build
```
