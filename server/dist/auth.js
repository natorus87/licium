"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.getUserById = getUserById;
exports.getUserByIdAsync = getUserByIdAsync;
exports.resetPassword = resetPassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("./db");
const SALT_ROUNDS = 10;
async function hashPassword(password) {
    return bcrypt_1.default.hash(password, SALT_ROUNDS);
}
async function verifyPassword(password, hash) {
    return bcrypt_1.default.compare(password, hash);
}
async function registerUser(username, password) {
    try {
        const passwordHash = await hashPassword(password);
        // Check if this is the first user
        const countResult = await (0, db_1.query)('SELECT COUNT(*) FROM users');
        const userCount = parseInt(countResult.rows[0].count);
        const role = userCount === 0 ? 'admin' : 'user';
        await (0, db_1.query)('INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)', [username, passwordHash, role]);
        const result = await (0, db_1.query)('SELECT id, username, role, created_at FROM users WHERE username = $1', [username]);
        if (result.rows[0]) {
            const row = result.rows[0];
            return {
                id: row.id,
                username: row.username,
                role: row.role,
                created_at: row.created_at
            };
        }
        return null;
    }
    catch (error) {
        console.error('Register error:', error);
        return null; // Username already exists or other error
    }
}
async function loginUser(username, password) {
    const result = await (0, db_1.query)('SELECT id, username, password_hash, role, created_at FROM users WHERE username = $1', [username]);
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
        role: user.role,
        created_at: user.created_at
    };
}
function getUserById(id) {
    // Note: This function was synchronous in SQLite but needs to be async for Postgres.
    // However, since we can't easily change the signature everywhere without breaking things,
    // we might need to refactor call sites.
    // Wait, getUserById is used in middleware which can be async.
    // But it's exported and might be used elsewhere.
    // Let's check usages. It's used in routes.ts in requireAdmin and /me.
    // I will change it to async.
    return null; // Placeholder, see below
}
async function getUserByIdAsync(id) {
    const result = await (0, db_1.query)('SELECT id, username, role, created_at FROM users WHERE id = $1', [id]);
    if (!result.rows[0]) {
        return null;
    }
    const row = result.rows[0];
    return {
        id: row.id,
        username: row.username,
        role: row.role,
        created_at: row.created_at
    };
}
async function resetPassword(userId, newPassword) {
    try {
        const passwordHash = await hashPassword(newPassword);
        await (0, db_1.query)('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);
        return true;
    }
    catch (error) {
        console.error('Reset password error:', error);
        return false;
    }
}
