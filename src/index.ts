import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

import { config, validateConfig } from './config.js';
import { pingMongo } from './db.js';
import { logger } from './logger.js';
import { seedVehicleCatalog } from './seed.js';
import { typeDefs } from './graphql/typeDefs.js';
import { resolvers } from './graphql/resolvers.js';

async function bootstrap(): Promise<void> {
  validateConfig();

  logger.info({ env: config.NODE_ENV }, 'Starting GraphQL gateway');

  if (config.NODE_ENV !== 'test') {
    await pingMongo();
  }

  if (config.INGEST_ON_STARTUP) {
    logger.info('Starting vehicle catalog seed into MongoDB');
    const data = await seedVehicleCatalog();
    logger.info({ count: data.length }, 'Vehicle catalog ingested and persisted');
  }

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
}

void bootstrap().catch((error: unknown) => {
  logger.error({ err: error }, 'Application bootstrap failed');
  process.exit(1);
});