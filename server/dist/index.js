"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const routes_1 = __importDefault(require("./routes"));
const db_1 = require("./db");
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
const app = (0, express_1.default)();
// Security Headers
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // Managed by Frontend/Nginx
    crossOriginEmbedderPolicy: false
}));
app.set('trust proxy', 1); // Trust the first proxy (Ingress/Traefik)
// Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000, // Limit each IP to 2000 requests per windowMs (approx 2 req/sec)
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express_1.default.json({ limit: '100mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '100mb' }));
// Session
const PgStore = (0, connect_pg_simple_1.default)(express_session_1.default);
app.use((0, express_session_1.default)({
    store: new PgStore({
        pool: (0, db_1.getDb)(),
        tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET || 'ai-notebook-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // set to true in production with HTTPS
        httpOnly: true,
        sameSite: 'lax', // Protect against CSRF
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
}));
// Routes
app.get('/', (req, res) => {
    res.send('AI Notebook API is running');
});
app.use('/api', routes_1.default);
const PORT = 3001;
// Initialize database and start server
(async () => {
    try {
        await (0, db_1.initializeDatabase)();
        const server = app.listen(PORT, () => {
            console.log(`✓ Server running on http://localhost:${PORT}`);
        });
        // Increase server timeout to 30 minutes to match Ingress and Whisper processing time
        server.setTimeout(1800000);
        server.keepAliveTimeout = 1800000;
        server.headersTimeout = 1800000 + 1000; // Must be higher than keepAliveTimeout
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
})();
