import bcrypt from 'bcrypt';
import { query } from './db';

const SALT_ROUNDS = 10;

export interface User {
    id: number;
    username: string;
    role: 'admin' | 'user';
    created_at: string;
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export async function registerUser(username: string, password: string): Promise<User | null> {
    try {
        const passwordHash = await hashPassword(password);

        // Check if this is the first user
        const countResult = await query('SELECT COUNT(*) FROM users');
        const userCount = parseInt(countResult.rows[0].count);
        const role = userCount === 0 ? 'admin' : 'user';

        await query(
            'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)',
            [username, passwordHash, role]
        );

        const result = await query('SELECT id, username, role, created_at FROM users WHERE username = $1', [username]);

        if (result.rows[0]) {
            const row = result.rows[0];
            return {
                id: row.id,
                username: row.username,
                role: row.role as 'admin' | 'user',
                created_at: row.created_at
            };
        }

        return null;
    } catch (error: any) {
        console.error('Register error:', error);
        return null; // Username already exists or other error
    }
}

export async function loginUser(username: string, password: string): Promise<User | null> {
    const result = await query(
        'SELECT id, username, password_hash, role, created_at FROM users WHERE username = $1',
        [username]
    );

    if (!result.rows[0]) {
        return null;
    }

    const user = result.rows[0];

    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
        return null;
    }

    return {
        id: user.id,
        username: user.username,
        role: user.role as 'admin' | 'user',
        created_at: user.created_at
    };
}

export function getUserById(id: number): User | null {
    // Note: This function was synchronous in SQLite but needs to be async for Postgres.
    // However, since we can't easily change the signature everywhere without breaking things,
    // we might need to refactor call sites.
    // Wait, getUserById is used in middleware which can be async.
    // But it's exported and might be used elsewhere.
    // Let's check usages. It's used in routes.ts in requireAdmin and /me.
    // I will change it to async.
    return null; // Placeholder, see below
}

export async function getUserByIdAsync(id: number): Promise<User | null> {
    const result = await query(
        'SELECT id, username, role, created_at FROM users WHERE id = $1',
        [id]
    );

    if (!result.rows[0]) {
        return null;
    }

    const row = result.rows[0];
    return {
        id: row.id,
        username: row.username,
        role: row.role as 'admin' | 'user',
        created_at: row.created_at
    };
}

export async function resetPassword(userId: number, newPassword: string): Promise<boolean> {
    try {
        const passwordHash = await hashPassword(newPassword);
        await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);
        return true;
    } catch (error) {
        console.error('Reset password error:', error);
        return false;
    }
}
