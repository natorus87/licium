"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("./auth");
const db_1 = require("./db");
(async () => {
    await (0, db_1.initializeDatabase)();
    const db = (0, db_1.getDb)();
    const passwordHash = await (0, auth_1.hashPassword)('admin123');
    await db.query("UPDATE users SET password_hash = $1 WHERE username = 'sebastian'", [passwordHash]);
    (0, db_1.saveDatabase)();
    console.log("Password for 'sebastian' reset to 'admin123'");
})();
