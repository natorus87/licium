
import { hashPassword } from './auth';
import { getDb, saveDatabase, initializeDatabase } from './db';

(async () => {
    try {
        await initializeDatabase();
        const db = getDb();
        const passwordHash = await hashPassword('admin123');

        // Update sebastian
        await db.query("UPDATE users SET password_hash = $1 WHERE username = 'sebastian'", [passwordHash]);
        console.log("Updated password for 'sebastian'");

        // Create or update admin user
        const existingAdmin = await db.query("SELECT id FROM users WHERE username = 'admin'");
        if (existingAdmin.rows.length > 0) {
            await db.query("UPDATE users SET password_hash = $1, role = 'admin' WHERE username = 'admin'", [passwordHash]);
            console.log("Updated password for 'admin'");
        } else {
            await db.query("INSERT INTO users (username, password_hash, role) VALUES ('admin', $1, 'admin')", [passwordHash]);
            console.log("Created user 'admin'");
        }

        saveDatabase();
        console.log("Database saved successfully");
    } catch (error) {
        console.error("Error:", error);
    }
})();
