import express from 'express';
import { v4 as uuidv4 } from 'uuid';

import { query } from './db';
import { registerUser, loginUser, getUserByIdAsync, resetPassword } from './auth';
import { handleChat } from './llm';
import { embeddingService } from './services/embeddingService';
import multer from 'multer';
import axios from 'axios';
import rateLimit from 'express-rate-limit';

// Configure Multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit (approx 30m+ of high quality audio)
});

const router = express.Router();

// Extend Express Session type
declare module 'express-session' {
    interface SessionData {
        userId?: number;
    }
}



// Middleware to check if user is authenticated (Session ONLY)
const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // SECURITY FIX: Removed Bearer Token impersonation. 
    // All client API access must be authenticated via valid Session Cookie.

    if (req.session && req.session.userId) {
        return next();
    }

    res.status(401).json({ error: 'Unauthorized' });
};

// Middleware to check if user is admin
const requireAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.session && req.session.userId) {
        const user = await getUserByIdAsync(req.session.userId);
        if (user && user.role === 'admin') {
            next();
            return;
        }
    }
    res.status(403).json({ error: 'Forbidden: Admin access required' });
};

// Helper: Background Embedding Update
async function updateNoteEmbeddings(noteId: string, content: string) {
    if (!content) return;

    try {
        const hash = embeddingService.calculateHash(content);

        // Check current hash
        const res = await query('SELECT content_hash FROM notes WHERE id = $1', [noteId]);
        if (res.rows.length > 0 && res.rows[0].content_hash === hash) {
            // No content change (or at least same hash)
            return;
        }

        console.log(`[RAG] Updating embeddings for note ${noteId}...`);

        // Fetch Embedding Config from DB
        const settingsRes = await query("SELECT value FROM settings WHERE key = 'llm_config'");
        let embeddingConfig = null;
        if (settingsRes.rows[0]) {
            const dbValue = JSON.parse(settingsRes.rows[0].value);
            // Check for embeddingProviderId
            if (dbValue.embeddingProviderId && dbValue.providers) {
                embeddingConfig = dbValue.providers.find((p: any) => p.id === dbValue.embeddingProviderId);
            }
            // Fallback to active provider if not explicitly set
            if (!embeddingConfig && dbValue.activeProviderId && dbValue.providers) {
                embeddingConfig = dbValue.providers.find((p: any) => p.id === dbValue.activeProviderId);
            }
        }


        // Update Hash
        await query('UPDATE notes SET content_hash = $1 WHERE id = $2', [hash, noteId]);

        // Generate Embeddings
        const chunks = embeddingService.chunkText(content);

        // Delete old embeddings
        await query('DELETE FROM note_embeddings WHERE note_id = $1', [noteId]);

        // Insert new ones (Sequential for now to be nice to API limits)
        let idx = 0;
        for (const chunk of chunks) {
            try {
                const vector = await embeddingService.getEmbedding(chunk, embeddingConfig);
                // Postgres params cannot handle raw vector string directly sometimes depending on driver version, 
                // but pgvector package suggests simply passing the string representation '[...]'
                await query(
                    'INSERT INTO note_embeddings (note_id, chunk_index, chunk_content, embedding) VALUES ($1, $2, $3, $4)',
                    [noteId, idx++, chunk, embeddingService.toSqlVector(vector)]
                );
            } catch (err) {
                console.error(`[RAG] Failed to embed chunk ${idx} for note ${noteId}:`, err);
            }
        }
        console.log(`[RAG] Finished updating embeddings for note ${noteId}`);
    } catch (error) {
        console.error('[RAG] Error in background update:', error);
    }
}

// Auth Routes
router.post('/register', async (req, res) => {
    // Check if registration is enabled
    const result = await query("SELECT value FROM settings WHERE key = 'registration_enabled'");
    const registrationEnabled = result.rows.length > 0 ? result.rows[0].value === 'true' : true; // Default to true if not set

    // If disabled, only allow if user is already an admin (creating another user)
    if (!registrationEnabled) {
        if (!req.session?.userId) {
            return res.status(403).json({ error: 'Registration is currently disabled.' });
        }
        // Optional: strictly enforce admin only? For now, the public register endpoint is blocked.
        // But wait, the admin "Create User" endpoint calls registerUser directly, it does NOT call this route.
        // This route is for PUBLIC registration.
        return res.status(403).json({ error: 'Registration is currently disabled.' });
    }

    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await registerUser(username, password);
    if (user) {
        req.session.userId = user.id;
        res.json(user);
    } else {
        res.status(400).json({ error: 'Username already exists' });
    }
});

const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // Limit each IP to 20 login requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts, please try again after 1 minute' }
});

router.post('/login', loginLimiter, async (req, res) => {
    const { username, password } = req.body;
    const user = await loginUser(username, password);

    if (user) {
        req.session.userId = user.id;
        res.json(user);
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ message: 'Logged out' });
    });
});

router.get('/me', async (req, res) => {
    if (req.session.userId) {
        const user = await getUserByIdAsync(req.session.userId);
        if (user) {
            res.json(user);
        } else {
            res.status(401).json({ error: 'User not found' });
        }
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

router.post('/auth/reset-password', requireAuth, async (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ error: 'New password required' });

    const success = await resetPassword(req.session.userId!, newPassword);
    if (success) {
        res.json({ message: 'Password updated' });
    } else {
        res.status(500).json({ error: 'Failed to update password' });
    }
});

// Admin: User Management Routes
router.get('/users', requireAdmin, async (req, res) => {
    const result = await query("SELECT id, username, role, created_at FROM users");
    const users = result.rows.map(row => ({
        id: row.id,
        username: row.username,
        role: row.role,
        created_at: row.created_at
    }));
    res.json(users);
});

router.post('/users', requireAdmin, async (req, res) => {
    const { username, password } = req.body;
    const user = await registerUser(username, password); // This handles hashing and DB insert
    if (user) {
        res.json(user);
    } else {
        res.status(400).json({ error: 'Failed to create user' });
    }
});

router.delete('/users/:id', requireAdmin, async (req, res) => {
    const userId = parseInt(req.params.id);
    if (userId === req.session.userId) {
        return res.status(400).json({ error: 'Cannot delete yourself' });
    }
    await query('DELETE FROM users WHERE id = $1', [userId]);
    res.json({ message: 'User deleted' });
});

router.post('/users/:id/reset-password', requireAdmin, async (req, res) => {
    const userId = parseInt(req.params.id);
    const { newPassword } = req.body;
    const success = await resetPassword(userId, newPassword);
    if (success) {
        res.json({ message: 'Password reset successful' });
    } else {
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

router.put('/users/:id/role', requireAdmin, async (req, res) => {
    const userId = parseInt(req.params.id);
    const { role } = req.body;
    if (userId === req.session.userId) {
        return res.status(400).json({ error: 'Cannot change your own role' });
    }
    if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }
    await query('UPDATE users SET role = $1 WHERE id = $2', [role, userId]);
    res.json({ message: 'Role updated' });
});

// Admin: Global Settings Routes
router.get('/settings/llm', requireAuth, async (req, res) => {
    const result = await query("SELECT value FROM settings WHERE key = 'llm_config'");
    if (result.rows[0]) {
        res.json(JSON.parse(result.rows[0].value));
    } else {
        res.json(null);
    }
});

router.put('/settings/llm', requireAdmin, async (req, res) => {
    const config = req.body;
    // Postgres UPSERT
    await query(
        "INSERT INTO settings (key, value) VALUES ('llm_config', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
        [JSON.stringify(config)]
    );
    res.json({ message: 'Settings saved' });
});

router.get('/settings/registration', async (req, res) => {
    const result = await query("SELECT value FROM settings WHERE key = 'registration_enabled'");
    const enabled = result.rows.length > 0 ? result.rows[0].value === 'true' : true;
    res.json({ enabled });
});

router.put('/settings/registration', requireAdmin, async (req, res) => {
    const { enabled } = req.body;
    await query(
        "INSERT INTO settings (key, value) VALUES ('registration_enabled', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
        [String(enabled)]
    );
    res.json({ message: 'Registration settings updated' });
});

// Note Routes
router.get('/tree', requireAuth, async (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get all notes for user (Sort by position, then by updated_at)
    const result = await query(
        'SELECT id, parent_id, type, title, content_markdown, created_at, updated_at, position FROM notes WHERE user_id = $1 ORDER BY position ASC, updated_at DESC',
        [userId]
    );

    if (result.rows.length === 0) {
        return res.json([]);
    }

    const rows = result.rows;
    const nodes: any[] = rows.map(row => ({
        id: row.id,
        parentId: row.parent_id,
        type: row.type,
        title: row.title,
        contentMarkdown: row.content_markdown,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        position: row.position || 0,
        children: []
    }));

    // Build tree
    const nodeMap = new Map();
    const rootNodes: any[] = [];

    nodes.forEach(node => nodeMap.set(node.id, node));

    nodes.forEach(node => {
        if (node.parentId) {
            const parent = nodeMap.get(node.parentId);
            if (parent) {
                parent.children.push(node);
            } else {
                rootNodes.push(node);
            }
        } else {
            rootNodes.push(node);
        }
    });

    res.json(rootNodes);
});

// Reorder Notes - MUST be at top level, NOT nested inside another route!
router.put('/notes/reorder', requireAuth, async (req, res) => {
    const { updates } = req.body;
    const userId = req.session.userId;

    if (!Array.isArray(updates)) {
        return res.status(400).json({ error: 'Invalid updates format' });
    }

    try {
        for (const update of updates) {
            await query(
                'UPDATE notes SET position = $1, parent_id = $2 WHERE id = $3 AND user_id = $4',
                [update.position, update.parentId || null, update.id, userId]
            );
        }
        res.json({ message: 'Updated' });
    } catch (e) {
        console.error("Reorder failed", e);
        res.status(500).json({ error: 'Reorder failed' });
    }
});

// Auto-Sort Notes: Numbers first, then alphabetical
router.post('/notes/sort', requireAuth, async (req, res) => {
    const { parentId } = req.body; // null for root level
    const userId = req.session.userId;

    try {
        // Fetch all notes at this level
        const result = await query(
            'SELECT id, title FROM notes WHERE user_id = $1 AND parent_id IS NOT DISTINCT FROM $2',
            [userId, parentId]
        );

        if (result.rows.length === 0) {
            return res.json({ message: 'Nothing to sort' });
        }

        // Sort: Numbers first (by numeric value), then alphabetical
        const sorted = result.rows.sort((a, b) => {
            const aTitle = a.title || '';
            const bTitle = b.title || '';

            // Check if titles start with numbers
            const aNumMatch = aTitle.match(/^(\d+)/);
            const bNumMatch = bTitle.match(/^(\d+)/);

            if (aNumMatch && bNumMatch) {
                // Both start with numbers - compare numerically
                return parseInt(aNumMatch[1]) - parseInt(bNumMatch[1]);
            } else if (aNumMatch) {
                // Only A starts with number - A comes first
                return -1;
            } else if (bNumMatch) {
                // Only B starts with number - B comes first
                return 1;
            } else {
                // Neither starts with number - alphabetical (case-insensitive)
                return aTitle.toLowerCase().localeCompare(bTitle.toLowerCase(), 'de');
            }
        });

        // Assign new positions
        for (let i = 0; i < sorted.length; i++) {
            await query(
                'UPDATE notes SET position = $1 WHERE id = $2 AND user_id = $3',
                [(i + 1) * 65536, sorted[i].id, userId]
            );
        }

        res.json({ message: 'Sorted' });
    } catch (e) {
        console.error("Sort failed", e);
        res.status(500).json({ error: 'Sort failed' });
    }
});

router.post('/notes', requireAuth, async (req, res) => {
    let { id, parentId, type, title } = req.body;
    const userId = req.session.userId;

    if (!id) {
        id = uuidv4();
    }

    await query(
        'INSERT INTO notes (id, user_id, parent_id, type, title) VALUES ($1, $2, $3, $4, $5)',
        [id, userId, parentId, type, title]
    );
    res.json({ message: 'Created', id });
});

router.put('/notes/:id', requireAuth, async (req, res) => {
    const { title, content } = req.body;
    const { id } = req.params;
    const userId = req.session.userId;

    // Version History: Before updating, save current state
    try {
        const currentNoteResult = await query('SELECT title, content_markdown FROM notes WHERE id = $1 AND user_id = $2', [id, userId]);
        if (currentNoteResult.rows.length > 0) {
            const currentNote = currentNoteResult.rows[0];

            // Only save version if content is changing (simple check)
            if (content !== undefined && content !== currentNote.content_markdown) {
                // 1. Save current version
                await query(
                    'INSERT INTO note_versions (note_id, user_id, title, content_markdown) VALUES ($1, $2, $3, $4)',
                    [id, userId, currentNote.title, currentNote.content_markdown]
                );

                // 2. Prune old versions (Max 10 per note)
                await query(`
                    DELETE FROM note_versions
                    WHERE id IN (
                        SELECT id FROM note_versions
                        WHERE note_id = $1
                        ORDER BY created_at DESC
                        OFFSET 10
                    )
                `, [id]);
            }
        }
    } catch (err) {
        console.error("Failed to save version history:", err);
        // Continue with update even if versioning fails (non-blocking)
    }

    if (title !== undefined) {
        await query('UPDATE notes SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3', [title, id, userId]);
    }
    if (content !== undefined) {
        await query('UPDATE notes SET content_markdown = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3', [content, id, userId]);

        // Trigger background embedding update
        // We don't await this to keep UI snappy
        updateNoteEmbeddings(id, content);
    }
    res.json({ message: 'Updated' });
});

router.get('/notes/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const userId = req.session.userId;

    const result = await query(
        'SELECT id, parent_id, type, title, content_markdown, created_at, updated_at FROM notes WHERE id = $1 AND user_id = $2',
        [id, userId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Note not found' });
    }

    res.json(result.rows[0]);
});

router.get('/notes/:id/versions', requireAuth, async (req, res) => {
    const { id } = req.params;
    const userId = req.session.userId;

    const result = await query(
        'SELECT id, created_at FROM note_versions WHERE note_id = $1 AND user_id = $2 ORDER BY created_at DESC',
        [id, userId]
    );

    res.json(result.rows); // Return simplified list for UI
});

router.post('/notes/:id/restore/:versionId', requireAuth, async (req, res) => {
    const { id, versionId } = req.params;
    const userId = req.session.userId;

    const versionResult = await query(
        'SELECT title, content_markdown FROM note_versions WHERE id = $1 AND note_id = $2 AND user_id = $3',
        [versionId, id, userId]
    );

    if (versionResult.rows.length === 0) {
        return res.status(404).json({ error: 'Version not found' });
    }

    const version = versionResult.rows[0];

    // Restore content to main table
    await query(
        'UPDATE notes SET content_markdown = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3',
        [version.content_markdown, id, userId]
    );

    // Optionally: We could also create a new version of the state *before* restore, but the user just requested a restore.
    // The previous state is effectively lost unless we version it too.
    // For now, simple restore implies overwriting current state with old state.
    // (Ideally, the 'overwrite' action itself triggers the PUT logic above if called via PUT, but here we do direct SQL)
    // Let's manually trigger a "save current before restore" to be safe?
    // Actually, let's keep it simple: Restore overwrites.

    res.json({ message: 'Restored', content: version.content_markdown });
});

router.post('/notes/:id/duplicate', requireAuth, async (req, res) => {
    const { id } = req.params;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
        // Fetch original note
        const originalResult = await query(
            'SELECT * FROM notes WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (originalResult.rows.length === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }

        const original = originalResult.rows[0];
        const newId = uuidv4();
        const newTitle = `${original.title} (Kopie)`;

        // Insert duplicate
        await query(
            'INSERT INTO notes (id, user_id, parent_id, type, title, content_markdown) VALUES ($1, $2, $3, $4, $5, $6)',
            [newId, userId, original.parent_id, original.type, newTitle, original.content_markdown]
        );

        res.json({ message: 'Duplicated', id: newId });
    } catch (error) {
        console.error('Duplicate error:', error);
        res.status(500).json({ error: 'Failed to duplicate note' });
    }
});

router.put('/notes/:id/move', requireAuth, async (req, res) => {
    const { parentId } = req.body;
    const { id } = req.params;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    if (parentId === id) {
        return res.status(400).json({ error: 'Cannot move a folder into itself' });
    }

    // Check for cycles if moving a folder
    const allNotesResult = await query('SELECT id, parent_id FROM notes WHERE user_id = $1', [userId]);
    if (allNotesResult.rows.length > 0) {
        const rows = allNotesResult.rows;
        const nodeMap = new Map<string, string | null>();
        rows.forEach(row => nodeMap.set(row.id, row.parent_id));

        let currentParentId = parentId;
        while (currentParentId) {
            if (currentParentId === id) {
                return res.status(400).json({ error: 'Cannot move a folder into its own child' });
            }
            currentParentId = nodeMap.get(currentParentId) || null;
        }
    }

    await query('UPDATE notes SET parent_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3', [parentId, id, userId]);
    res.json({ message: 'Moved' });
});

router.delete('/notes/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    // Postgres CASCADE delete handles children
    await query('DELETE FROM notes WHERE id = $1 AND user_id = $2', [id, userId]);
    res.json({ message: 'Deleted' });
});

// RAG Search Route
router.post('/rag/search', requireAuth, async (req, res) => {
    const { query: userQuery } = req.body;
    if (!userQuery) return res.status(400).json({ error: 'Query required' });

    try {
        // Fetch Config
        const settingsRes = await query("SELECT value FROM settings WHERE key = 'llm_config'");
        let embeddingConfig = null;
        if (settingsRes.rows[0]) {
            const dbValue = JSON.parse(settingsRes.rows[0].value);
            if (dbValue.embeddingProviderId && dbValue.providers) {
                embeddingConfig = dbValue.providers.find((p: any) => p.id === dbValue.embeddingProviderId);
            }
            if (!embeddingConfig && dbValue.activeProviderId && dbValue.providers) {
                embeddingConfig = dbValue.providers.find((p: any) => p.id === dbValue.activeProviderId);
            }
        }

        const vector = await embeddingService.getEmbedding(userQuery, embeddingConfig);
        const sqlVector = embeddingService.toSqlVector(vector);

        // Cosine similarity search (<=> operator)
        // We cast the parameter to vector explicitly: $1::vector
        const result = await query(
            `SELECT note_id, chunk_content, 
             1 - (embedding <=> $1) as similarity
             FROM note_embeddings
             ORDER BY embedding <=> $1
             LIMIT 5`,
            [sqlVector]
        );

        // Fetch Note Titles for better context
        // OR join in the query above. Let's do a join or simple fetch.
        // Let's keep it simple: The client might want titles.
        // We can JOIN notes table.
        const enrichedResult = await query(
            `SELECT ne.note_id, n.title, ne.chunk_content, 
             1 - (ne.embedding <=> $1) as similarity
             FROM note_embeddings ne
             JOIN notes n ON ne.note_id = n.id
             WHERE n.user_id = $2
             ORDER BY ne.embedding <=> $1
             LIMIT 5`,
            [sqlVector, req.session.userId]
        );

        res.json(enrichedResult.rows);
    } catch (error: any) {
        console.error('RAG Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Chat Route
router.post('/chat', requireAuth, async (req, res) => {
    try {
        const { messages, noteContent, mode, useSearch, config: clientConfig, language } = req.body;

        // Determine LLM config: Use client info if provided (for Multi-LLM), else fallback to global DB default
        let config = clientConfig;

        if (!config) {
            // Fetch global LLM config from DB (Legacy/Fallback)
            const result = await query("SELECT value FROM settings WHERE key = 'llm_config'");
            if (result.rows[0]) {
                const dbValue = JSON.parse(result.rows[0].value);
                // Handle new format (LLMSettings) vs old format (single provider)
                if (dbValue.providers && Array.isArray(dbValue.providers)) {
                    // If DB has new format but client didn't send config, pick active or first
                    const activeId = dbValue.activeProviderId;
                    config = dbValue.providers.find((p: any) => p.id === activeId) || dbValue.providers[0];
                } else {
                    // Old format: dbValue is the provider itself
                    config = dbValue;
                }
            }
        }

        if (!config) {
            return res.status(400).json({ error: "LLM not configured by admin." });
        }

        const response = await handleChat(messages, noteContent, mode, config, useSearch, language);
        res.json({ assistantMessage: response });
    } catch (error: any) {
        console.error('Chat error:', error);
        res.status(500).json({ error: error.message || 'Failed to get response' });
    }
});

// Upload Image
router.post('/upload', upload.single('image'), async (req, res) => {
    console.log(`[Upload] Request received from ${req.ip}`);

    if (!req.session?.userId) {
        console.warn('[Upload] Unauthorized');
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
        console.warn('[Upload] No file');
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const result = await query(
            'INSERT INTO images (user_id, data, mime_type) VALUES ($1, $2, $3) RETURNING id',
            [req.session.userId, req.file.buffer, req.file.mimetype]
        );

        const imageId = result.rows[0].id;
        console.log(`[Upload] Success, id: ${imageId}`);
        res.json({ url: `/api/images/${imageId}` });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Serve Image
router.get('/images/:id', async (req, res) => {
    try {
        const result = await query('SELECT data, mime_type FROM images WHERE id = $1', [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).send('Not found');
        }

        const image = result.rows[0];
        res.contentType(image.mime_type);
        res.send(image.data);
    } catch (error) {
        console.error('Image fetch error:', error);
        res.status(500).send('Error retrieving image');
    }
});

// Transcribe Audio (Whisper Proxy) with SSE Keep-Alive
router.post('/transcribe', requireAuth, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No audio file provided' });
    }

    // Initialize SSE Headers
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });

    // Send initial status
    res.write(`data: ${JSON.stringify({ status: 'processing' })}\n\n`);

    // Setup Keep-Alive Interval
    const keepAlive = setInterval(() => {
        res.write(`data: ${JSON.stringify({ status: 'processing' })}\n\n`);
    }, 10000); // 10 seconds

    try {
        // Parse Provider Config
        let providerConfig: any = null;
        try {
            const configHeader = req.headers['x-audio-config'];
            if (configHeader && typeof configHeader === 'string') {
                providerConfig = JSON.parse(configHeader);
            }
        } catch (e) {
            console.warn('Failed to parse audio config header', e);
        }

        // Default to Internal Whisper if no config or type is local
        let targetUrl = 'http://whisper:8000/v1/audio/transcriptions';
        let headers: any = {};
        let model = null;

        if (providerConfig && providerConfig.baseUrl && (providerConfig.type === 'custom' || providerConfig.type === 'openai')) {
            targetUrl = providerConfig.baseUrl;
            if (providerConfig.apiKey) {
                headers['Authorization'] = `Bearer ${providerConfig.apiKey}`;
            }
            if (providerConfig.model) {
                model = providerConfig.model;
            }
        }

        const formData = new FormData();
        const blob = new Blob([new Uint8Array(req.file.buffer)], { type: req.file.mimetype });
        formData.append('file', blob, 'recording.webm');

        // Append model if specified (required for OpenAI)
        if (model) {
            formData.append('model', model);
        }

        const language = req.body.language || 'de';
        formData.append('language', language);

        console.log(`[SSE] Sending audio to ${targetUrl} (Language: ${language}). File size: ${req.file.size} bytes`);

        // Await transcription (blocking)
        const response = await axios.post(targetUrl, formData, {
            headers: {
                ...headers,
                // axios automatically sets Content-Type for FormData, but sometimes better to let it handle it
            },
            timeout: 1800000 // 30 minutes
        });

        console.log(`[SSE] Transcription success (Language: ${language})`);

        // Send final result
        res.write(`data: ${JSON.stringify({ status: 'complete', text: response.data.text })}\n\n`);
    } catch (error: any) {
        console.error('[SSE] Transcription error:', error.response?.data || error.message);
        res.write(`data: ${JSON.stringify({ status: 'error', error: 'Failed to transcribe audio' })}\n\n`);
    } finally {
        clearInterval(keepAlive);
        res.end();
    }
});

// Check Whisper Service Status
router.get('/status/whisper', requireAuth, async (req, res) => {
    try {
        // Check if the service is reachable and ready
        await axios.get('http://whisper:8000/health', { timeout: 2000 });
        res.json({ status: 'ready' });
    } catch (error) {
        // network error or 503 means not ready
        res.json({ status: 'loading' });
    }
});

// User Settings Routes (Cloud Sync)
router.get('/user/settings/:key', requireAuth, async (req, res) => {
    const { key } = req.params;
    const userId = req.session.userId;

    try {
        const result = await query(
            'SELECT value FROM user_settings WHERE user_id = $1 AND key = $2',
            [userId, key]
        );
        if (result.rows.length > 0) {
            res.json(JSON.parse(result.rows[0].value));
        } else {
            res.json(null); // Key not found for user
        }
    } catch (error) {
        console.error('Get User Settings error:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

router.put('/user/settings/:key', requireAuth, async (req, res) => {
    const { key } = req.params;
    const { value } = req.body; // Expecting raw JSON value (object or array)
    const userId = req.session.userId;

    try {
        await query(
            `INSERT INTO user_settings (user_id, key, value) 
             VALUES ($1, $2, $3) 
             ON CONFLICT (user_id, key) 
             DO UPDATE SET value = $3`,
            [userId, key, JSON.stringify(value)]
        );
        res.json({ message: 'Saved' });
    } catch (error) {
        console.error('Save User Settings error:', error);
        res.status(500).json({ error: 'Failed to save settings' });
    }
});

// System Info Route
router.get('/system/info', requireAuth, async (req, res) => {
    try {
        // Read version from package.json (use path.join to handle different environments)
        const fs = require('fs');
        const path = require('path');

        let version = '1.0.0'; // Fallback
        try {
            // In production (compiled), package.json is at project root
            // In dev, we're in src/
            const packagePath = path.join(__dirname, '../../package.json');
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            version = packageJson.version;
        } catch (err) {
            console.warn('[SystemInfo] Could not read package.json, using fallback version');
        }

        // Check database connection
        let dbStatus = 'disconnected';
        try {
            await query('SELECT 1');
            dbStatus = 'connected';
        } catch (dbError) {
            console.error('[SystemInfo] DB Health Check failed:', dbError);
        }

        // Calculate uptime in readable format
        const uptimeSeconds = Math.floor(process.uptime());
        const days = Math.floor(uptimeSeconds / (3600 * 24));
        const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const uptimeFormatted = `${days}d ${hours}h ${minutes}m`;

        res.json({
            backend: {
                version: version,
                nodeVersion: process.version,
                uptime: uptimeFormatted,
                buildDate: process.env.BUILD_TIMESTAMP || 'Development'
            },
            database: {
                status: dbStatus
            }
        });
    } catch (error) {
        console.error('[SystemInfo] Error:', error);
        res.status(500).json({ error: 'Failed to retrieve system information' });
    }
});



// ==================== Proxies ====================

// Proxy for Draw.io (Internal Access to bypass Basic Auth)
// Using regex to match both /api/drawio and /api/drawio/whatever
router.all(/\/api\/drawio.*/, requireAuth, async (req, res) => {
    const drawioUrl = 'http://drawio:8080'; // Internal K8s Service URL
    // Remove /api/drawio prefix to get the path for Draw.io
    const path = req.url.replace('/api/drawio', '');
    const targetUrl = `${drawioUrl}${path}`;

    try {
        const response = await axios({
            method: req.method,
            url: targetUrl,
            headers: {
                // Do not forward Host header to avoid confusion
                ...req.headers,
                host: 'drawio:8080'
            },
            data: req.method !== 'GET' ? req.body : undefined,
            responseType: 'stream',
            validateStatus: () => true // Forward all status codes
        });

        res.status(response.status);
        res.set(response.headers);
        response.data.pipe(res);
    } catch (error) {
        console.error('Draw.io Proxy Error:', error);
        res.status(502).send('Bad Gateway');
    }
});

export default router;
