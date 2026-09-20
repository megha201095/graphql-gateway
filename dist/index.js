import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { config, validateConfig } from './config.js';
import { ingestVehicleData } from './ingestion.js';
import { logger } from './logger.js';
import { saveVehicleData } from './repository.js';
import { typeDefs } from './graphql/typeDefs.js';
import { resolvers } from './graphql/resolvers.js';
async function bootstrap() {
    validateConfig();
    logger.info({ env: config.NODE_ENV }, 'Starting GraphQL gateway');
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        includeStacktraceInErrorResponses: config.NODE_ENV !== 'production',
    });
    const { url } = await startStandaloneServer(server, {
        listen: {
            port: config.PORT,
        },
    });
    logger.info({ url }, 'GraphQL server is ready');
    if (config.INGEST_ON_STARTUP) {
        void (async () => {
            try {
                const data = await ingestVehicleData({
                    makesUrl: config.NHTSA_GET_ALL_MAKES_URL,
                    vehicleTypesUrlTemplate: config.NHTSA_GET_VEHICLE_TYPES_URL,
                });
                saveVehicleData(data);
                logger.info({ count: data.length }, 'Vehicle catalog ingested and persisted');
            }
            catch (error) {
                logger.error({ err: error }, 'Vehicle ingestion failed during startup');
            }
        })();
    }
}
void bootstrap().catch((error) => {
    logger.error({ err: error }, 'Application bootstrap failed');
    process.exit(1);
});
const shutdown = (signal) => {
    logger.info({ signal }, 'Shutdown signal received');
    process.exitCode = 0;
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
