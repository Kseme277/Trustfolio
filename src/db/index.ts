import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Configuration unique pour tous les environnements
const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });

export * from './schema';