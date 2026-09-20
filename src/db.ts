import { MongoClient, ServerApiVersion, type Db } from 'mongodb';

import { config } from './config.js';

let mongoClient: MongoClient | undefined;
let mongoDb: Db | undefined;

export async function connectMongo(): Promise<Db> {
  if (mongoDb && mongoClient) {
    return mongoDb;
  }

  mongoClient = new MongoClient(config.MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await mongoClient.connect();
  mongoDb = mongoClient.db(config.MONGODB_DB_NAME);

  return mongoDb;
}

export async function pingMongo(): Promise<void> {
  try {
    const database = await connectMongo();
    await database.command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } catch (error) {
    if (config.NODE_ENV === 'test') {
      return;
    }

    throw error;
  }
}

export async function closeMongo(): Promise<void> {
  if (!mongoClient) {
    return;
  }

  await mongoClient.close();
  mongoClient = undefined;
  mongoDb = undefined;
}
