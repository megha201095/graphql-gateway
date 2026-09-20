import { config as loadDotEnv } from 'dotenv';
import { z } from 'zod';
loadDotEnv();
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    LOG_LEVEL: z.string().default('info'),
    DATABASE_URL: z.string().default('data/vehicles.db'),
    NHTSA_GET_ALL_MAKES_URL: z
        .string()
        .url()
        .default('https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML'),
    NHTSA_GET_VEHICLE_TYPES_URL: z
        .string()
        .default('https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId/{makeId}?format=xml'),
    INGEST_ON_STARTUP: z
        .string()
        .optional()
        .transform((value) => value === undefined ? true : value.toLowerCase() === 'true')
        .pipe(z.boolean())
        .default('true'),
});
export const config = envSchema.parse(process.env);
export function validateConfig() {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
        const issues = parsed.error.issues.map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`);
        throw new Error(`Invalid environment configuration: ${issues.join('; ')}`);
    }
}
