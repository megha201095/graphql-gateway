import { config as loadDotEnv } from 'dotenv';
import { z } from 'zod';

loadDotEnv();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.string().default('info'),
  MONGODB_URI: z.string().default('mongodb+srv://megha201095_db_user:<db_password>@cluster0.abywixe.mongodb.net/Vehicle-Service?appName=Cluster0'),
  MONGODB_DB_NAME: z.string().default('Vehicle-Service'),
  NHTSA_GET_ALL_MAKES_URL: z
    .string()
    .url()
    .default('https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML'),
  NHTSA_GET_VEHICLE_TYPES_URL: z
    .string()
    .default('https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId/{makeId}?format=xml'),
  MAX_MAKES_TO_INGEST: z.coerce.number().int().positive().default(200),
  INGEST_ON_STARTUP: z
    .string()
    .optional()
    .transform((value) => value === undefined ? true : value.toLowerCase() === 'true')
    .pipe(z.boolean())
    .default('true'),
});

export const config = envSchema.parse(process.env);

export function validateConfig(): void {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`);
    throw new Error(`Invalid environment configuration: ${issues.join('; ')}`);
  }
}
