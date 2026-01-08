import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'notebook',
});

export async function initializeDatabase() {
    try {
        await pool.query('SELECT NOW()');
        console.log('✓ Connected to PostgreSQL');

        // Enable Vector Extension
        await pool.query('CREATE EXTENSION IF NOT EXISTS vector;');

        // Create tables
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS notes (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                parent_id TEXT,
                type TEXT NOT NULL CHECK(type IN ('folder', 'note')),
                title TEXT NOT NULL,
                content_markdown TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        // Migration: Add content_hash to notes if not exists
        await pool.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notes' AND column_name='content_hash') THEN
                    ALTER TABLE notes ADD COLUMN content_hash VARCHAR(64);
                END IF;
            END $$;
        `);

        // Migration: Add position to notes for sorting
        await pool.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notes' AND column_name='position') THEN
                    ALTER TABLE notes ADD COLUMN position DOUBLE PRECISION DEFAULT 0;
                END IF;
            END $$;
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            );
        `);

        await pool.query(`CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_notes_parent_id ON notes(parent_id);`);

        // User Settings Table (Cloud Sync)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_settings (
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                key TEXT NOT NULL,
                value TEXT,
                PRIMARY KEY (user_id, key)
            );
        `);

        // Version History Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS note_versions (
                id SERIAL PRIMARY KEY,
                note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id),
                title TEXT,
                content_markdown TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_note_versions_note_id ON note_versions(note_id);`);

        // Session table for connect-pg-simple
        await pool.query(`
            CREATE TABLE IF NOT EXISTS session (
                sid varchar NOT NULL COLLATE "default" PRIMARY KEY,
                sess json NOT NULL,
                expire timestamp(6) NOT NULL
            )
            WITH (OIDS=FALSE);
        `);
        // ALTER TABLE removed as it is not idempotent
        await pool.query(`CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);`);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS images (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                data BYTEA NOT NULL,
                mime_type TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);





        // Migration: Add content_hash to notes if not exists (already added in previous step, double check unnecessary but safe)

        await pool.query(`
            CREATE TABLE IF NOT EXISTS note_embeddings(
            id SERIAL PRIMARY KEY,
            note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
            chunk_index INTEGER NOT NULL,
            chunk_content TEXT NOT NULL,
            embedding vector,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `);

        // Migration: Alter embedding column to be generic if it has a dimension restriction
        // This allows switching between models (e.g. OpenAI 1536 -> MiniLM 384)
        // We catch error in case incompatible data exists, but usually implicit cast works if table is empty
        try {
            await pool.query('ALTER TABLE note_embeddings ALTER COLUMN embedding TYPE vector');
        } catch (e) {
            console.log('Note: Could not alter embedding column to generic vector (might already be set or data mismatch). ignoring.');
        }

        await pool.query(`CREATE INDEX IF NOT EXISTS idx_note_embeddings_note_id ON note_embeddings(note_id); `);
        // Vector index (IVFFlat) cannot be created without dimensions. We skip it for generic vectors.

        console.log('✓ Database initialized');

    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
}

export function getDb() {
    return pool;
}

// Helper to replace SQLite's db.exec/db.run
export async function query(text: string, params?: any[]): Promise<QueryResult> {
    return pool.query(text, params);
}

// No saveDatabase needed for Postgres
export function saveDatabase() {
    // No-op
}

