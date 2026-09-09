import { MongoClient, Db } from 'mongodb';
import { log } from './logger';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGO as string;

const TANK_DOC_ID = 'default';

interface TankDoc {
  _id: string;
  fish: SavedFish[];
  updatedAt?: Date;
}

export interface SavedFish {
  x: number;
  y: number;
  speed: number;
  bob: number;
  bobSpeed: number;
  phase: number;
  facingRight: boolean;
  body: string;
  fin: string;
  animationPhase: number;
}

export interface SavedAquarium {
  fish: SavedFish[];
}

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongo(): Promise<Db> {
  if (db) {
    return db;
  }

  log.info('Connecting to MongoDB');
  client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db();
  await db.command({ ping: 1 });
  log.success(`Connected to MongoDB database "${db.databaseName}"`);
  return db;
}

export async function disconnectMongo(): Promise<void> {
  if (!client) {
    return;
  }
  await client.close();
  client = null;
  db = null;
  log.info('Disconnected from MongoDB');
}

export async function loadAquariumState(): Promise<SavedAquarium | null> {
  if (!db) {
    return null;
  }

  const doc = await db.collection<TankDoc>('tanks').findOne({ _id: TANK_DOC_ID });
  if (!doc || !Array.isArray(doc.fish)) {
    return null;
  }

  return { fish: doc.fish };
}

export async function saveAquariumState(state: SavedAquarium): Promise<void> {
  if (!db) {
    return;
  }

  await db.collection<TankDoc>('tanks').updateOne(
    { _id: TANK_DOC_ID },
    {
      $set: {
        fish: state.fish,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}
