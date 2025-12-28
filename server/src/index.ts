import express from 'express';
import cors from 'cors';
import session from 'express-session';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { initializeDatabase, getDb } from './db';
import pgSession from 'connect-pg-simple';

const app = express();

// Security Headers
app.use(helmet({
    contentSecurityPolicy: false, // Managed by Frontend/Nginx
    crossOriginEmbedderPolicy: false
}));

app.set('trust proxy', 1); // Trust the first proxy (Ingress/Traefik)

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Session
const PgStore = pgSession(session);

app.use(session({
    store: new PgStore({
        pool: getDb(),
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

app.use('/api', routes);

const PORT = 3001;

// Initialize database and start server
(async () => {
    try {
        await initializeDatabase();

        const server = app.listen(PORT, () => {
            console.log(`✓ Server running on http://localhost:${PORT}`);
        });

        // Increase server timeout to 30 minutes to match Ingress and Whisper processing time
        server.setTimeout(1800000);
        server.keepAliveTimeout = 1800000;
        server.headersTimeout = 1800000 + 1000; // Must be higher than keepAliveTimeout
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
})();
