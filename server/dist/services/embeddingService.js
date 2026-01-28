"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.embeddingService = void 0;
exports.calculateContentHash = calculateContentHash;
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
const pg_1 = __importDefault(require("pgvector/pg"));
// Calculate SHA-256 hash of content
function calculateContentHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
}
// OpenAI Provider (and compatible)
class OpenAIEmbeddingProvider {
    constructor(apiKey, model = 'text-embedding-3-small', baseUrl = 'https://api.openai.com/v1') {
        this.apiKey = apiKey;
        this.model = model;
        this.baseUrl = baseUrl.replace(/\/+$/, ''); // Strip trailing slash
    }
    async getEmbedding(text) {
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/embeddings`, {
                input: text,
                model: this.model
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.data[0].embedding;
        }
        catch (error) {
            console.error('OpenAI Embedding Error:', error.response?.data || error.message);
            throw new Error('Failed to generate embedding');
        }
    }
}
// Ollama Provider (for local/future use)
class OllamaEmbeddingProvider {
    constructor(baseUrl = 'http://ollama:11434', model = 'nomic-embed-text') {
        this.baseUrl = baseUrl;
        this.model = model;
    }
    async getEmbedding(text) {
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/api/embeddings`, {
                model: this.model,
                prompt: text
            });
            return response.data.embedding; // Ollama returns 'embedding': [...]
        }
        catch (error) {
            console.error('Ollama Embedding Error:', error.response?.data || error.message);
            throw new Error('Failed to generate embedding via Ollama');
        }
    }
}
// Local Transformers Provider (via Hugging Face TEI - OpenAI Compatible)
class TransformersEmbeddingProvider {
    constructor(baseUrl = 'http://embeddings:8080') {
        this.baseUrl = baseUrl;
    }
    async getEmbedding(text) {
        try {
            // TEI exposes an OpenAI-compatible endpoint at /v1/embeddings (if using newer versions)
            // or we can use the native /embed endpoint: POST /embed { "inputs": "string" } -> [[0.1, ...]]
            // Current common usage for TEI:
            const response = await axios_1.default.post(`${this.baseUrl}/embed`, {
                inputs: text
            });
            // Response is array of arrays (batch support), we sent one string, so take index 0
            return response.data[0];
        }
        catch (error) {
            console.error('Transformers (TEI) Embedding Error:', error.response?.data || error.message);
            // Fallback: Try OpenAI compatible /v1/embeddings if /embed fails
            try {
                const response = await axios_1.default.post(`${this.baseUrl}/v1/embeddings`, {
                    input: text,
                    model: 'sentence-transformers/all-MiniLM-L6-v2'
                });
                return response.data.data[0].embedding;
            }
            catch (e) {
                throw new Error('Failed to generate embedding via Transformers (TEI)');
            }
        }
    }
}
// Factory to get provider based on config
function getProvider(config) {
    if (!config) {
        // Fallback to Env if no config provided (Backward compatibility)
        if (process.env.OPENAI_API_KEY) {
            return new OpenAIEmbeddingProvider(process.env.OPENAI_API_KEY);
        }
        if (process.env.OLLAMA_BASE_URL) {
            return new OllamaEmbeddingProvider(process.env.OLLAMA_BASE_URL);
        }
        throw new Error('No embedding provider configured.');
    }
    if (config.type === 'openai') {
        return new OpenAIEmbeddingProvider(config.apiKey || '', config.model);
    }
    if (config.type === 'ollama') {
        return new OllamaEmbeddingProvider(config.baseUrl, config.model);
    }
    if (config.type === 'transformers') {
        return new TransformersEmbeddingProvider(config.baseUrl || 'http://embeddings:8080'); // Use internal K8s DNS by default
    }
    // Custom is OpenAI compatible usually
    if (config.type === 'custom') {
        return new OpenAIEmbeddingProvider(config.apiKey || '', config.model, config.baseUrl);
    }
    throw new Error(`Unsupported provider type: ${config.type}`);
}
exports.embeddingService = {
    calculateHash: calculateContentHash,
    getEmbedding: async (text, config) => {
        const provider = getProvider(config);
        return provider.getEmbedding(text);
    },
    // Chunking logic
    chunkText: (text, chunkSize = 350, overlap = 100) => {
        if (!text)
            return [];
        const chunks = [];
        let start = 0;
        while (start < text.length) {
            const end = Math.min(start + chunkSize, text.length);
            chunks.push(text.slice(start, end));
            if (end === text.length)
                break;
            start += (chunkSize - overlap);
        }
        return chunks;
    },
    // Format for pgvector (although pg driver handles array of numbers -> vector string automatically mostly, but being explicit helps)
    toSqlVector: (embedding) => {
        return pg_1.default.toSql(embedding);
    }
};
