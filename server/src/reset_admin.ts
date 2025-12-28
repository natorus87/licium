
import { hashPassword } from './auth';
import { getDb, saveDatabase, initializeDatabase } from './db';

(async () => {
    await initializeDatabase();
    const db = getDb();
    const passwordHash = await hashPassword('admin123');
    await db.query("UPDATE users SET password_hash = $1 WHERE username = 'sebastian'", [passwordHash]);
    saveDatabase();
    console.log("Password for 'sebastian' reset to 'admin123'");
})();
