import { MongoClient, Db, ObjectId } from 'mongodb';
import { log } from './logger';
import { hashPassword, verifyPassword } from './password';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGO as string;
const LEGACY_TANK_ID = 'default';

interface TankDoc {
  _id: string;
  fish: SavedFish[];
  tankWidth?: number;
  tankHeight?: number;
  updatedAt?: Date;
}

interface UserDoc {
  _id: ObjectId;
  username: string;
  usernameLower: string;
  email: string;
  emailLower: string;
  passwordHash: string;
  fish: SavedFish[];
  tankWidth?: number;
  tankHeight?: number;
  createdAt: Date;
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
  tankWidth?: number;
  tankHeight?: number;
}

export interface PublicUser {
  id: string;
  username: string;
  email: string;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
  user?: PublicUser;
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
  await ensureIndexes();
  log.success(`Connected to MongoDB database "${db.databaseName}"`);
  return db;
}

async function ensureIndexes(): Promise<void> {
  if (!db) {
    return;
  }
  const users = db.collection<UserDoc>('users');
  await users.createIndex({ usernameLower: 1 }, { unique: true });
  await users.createIndex({ emailLower: 1 }, { unique: true });
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

function publicUser(doc: UserDoc): PublicUser {
  return {
    id: doc._id.toHexString(),
    username: doc.username,
    email: doc.email,
  };
}

export function validateSignup(input: { username: unknown; email: unknown; password: unknown }): string | null {
  const username = typeof input.username === 'string' ? input.username.trim() : '';
  const email = typeof input.email === 'string' ? input.email.trim() : '';
  const password = typeof input.password === 'string' ? input.password : '';

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return 'Username must be 3-20 letters, numbers, or _';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 80) {
    return 'Enter a valid email';
  }
  if (password.length < 8 || password.length > 72) {
    return 'Password must be 8-72 characters';
  }
  return null;
}

async function loadLegacyTank(): Promise<SavedAquarium | null> {
  if (!db) {
    return null;
  }
  const doc = await db.collection<TankDoc>('tanks').findOne({ _id: LEGACY_TANK_ID });
  if (!doc || !Array.isArray(doc.fish)) {
    return null;
  }
  return {
    fish: doc.fish,
    tankWidth: doc.tankWidth,
    tankHeight: doc.tankHeight,
  };
}

export async function signupUser(input: {
  username: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  if (!db) {
    return { ok: false, error: 'Database is not connected' };
  }

  const username = input.username.trim();
  const email = input.email.trim();
  const validationError = validateSignup({ username, email, password: input.password });
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const usernameLower = username.toLowerCase();
  const emailLower = email.toLowerCase();
  const users = db.collection<UserDoc>('users');

  const existing = await users.findOne({
    $or: [{ usernameLower }, { emailLower }],
  });
  if (existing) {
    if (existing.usernameLower === usernameLower) {
      return { ok: false, error: 'That username is already taken' };
    }
    return { ok: false, error: 'That email is already registered' };
  }

  const legacy = await loadLegacyTank();
  const now = new Date();
  const doc: Omit<UserDoc, '_id'> = {
    username,
    usernameLower,
    email,
    emailLower,
    passwordHash: await hashPassword(input.password),
    fish: legacy?.fish ?? [],
    tankWidth: legacy?.tankWidth,
    tankHeight: legacy?.tankHeight,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const result = await users.insertOne(doc as UserDoc);
    log.success(`Created account "${username}"`);
    return {
      ok: true,
      user: {
        id: result.insertedId.toHexString(),
        username,
        email,
      },
    };
  } catch (err) {
    const code = (err as { code?: number }).code;
    if (code === 11000) {
      return { ok: false, error: 'That username or email is already in use' };
    }
    throw err;
  }
}

export async function loginUser(input: { identifier: string; password: string }): Promise<AuthResult> {
  if (!db) {
    return { ok: false, error: 'Database is not connected' };
  }

  const identifier = input.identifier.trim().toLowerCase();
  const password = input.password;
  if (!identifier || !password) {
    return { ok: false, error: 'Enter your username/email and password' };
  }

  const users = db.collection<UserDoc>('users');
  const doc = await users.findOne({
    $or: [{ usernameLower: identifier }, { emailLower: identifier }],
  });
  if (!doc) {
    return { ok: false, error: 'No account matches those details' };
  }

  const matches = await verifyPassword(password, doc.passwordHash);
  if (!matches) {
    return { ok: false, error: 'No account matches those details' };
  }

  log.success(`Logged in "${doc.username}"`);
  return { ok: true, user: publicUser(doc) };
}

export async function findUserById(userId: string): Promise<PublicUser | null> {
  if (!db) {
    return null;
  }
  if (!ObjectId.isValid(userId)) {
    return null;
  }
  const doc = await db.collection<UserDoc>('users').findOne({ _id: new ObjectId(userId) });
  return doc ? publicUser(doc) : null;
}

export async function loadAquariumState(userId: string): Promise<SavedAquarium | null> {
  if (!db) {
    return null;
  }
  if (!ObjectId.isValid(userId)) {
    return null;
  }

  const doc = await db.collection<UserDoc>('users').findOne({ _id: new ObjectId(userId) });
  if (!doc || !Array.isArray(doc.fish)) {
    return null;
  }

  return {
    fish: doc.fish,
    tankWidth: doc.tankWidth,
    tankHeight: doc.tankHeight,
  };
}

export async function saveAquariumState(userId: string, state: SavedAquarium): Promise<void> {
  if (!db) {
    return;
  }
  if (!ObjectId.isValid(userId)) {
    return;
  }

  await db.collection<UserDoc>('users').updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        fish: state.fish,
        tankWidth: state.tankWidth,
        tankHeight: state.tankHeight,
        updatedAt: new Date(),
      },
    }
  );
}
