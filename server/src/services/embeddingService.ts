import axios from 'axios';
import * as crypto from 'crypto';
import pgvector from 'pgvector/pg';

// Calculate SHA-256 hash of content
export function calculateContentHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
}

// Interface for embedding request
interface EmbeddingProvider {
    getEmbedding(text: string): Promise<number[]>;
}

// OpenAI Provider (and compatible)
class OpenAIEmbeddingProvider implements EmbeddingProvider {
    private apiKey: string;
    private model: string;
    private baseUrl: string;

    constructor(apiKey: string, model: string = 'text-embedding-3-small', baseUrl: string = 'https://api.openai.com/v1') {
        this.apiKey = apiKey;
        this.model = model;
        this.baseUrl = baseUrl.replace(/\/+$/, ''); // Strip trailing slash
    }

    async getEmbedding(text: string): Promise<number[]> {
        try {
            const response = await axios.post(
                `${this.baseUrl}/embeddings`,
                {
                    input: text,
                    model: this.model
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data.data[0].embedding;
        } catch (error: any) {
            console.error('OpenAI Embedding Error:', error.response?.data || error.message);
            throw new Error('Failed to generate embedding');
        }
    }
}

// Ollama Provider (for local/future use)
class OllamaEmbeddingProvider implements EmbeddingProvider {
    private baseUrl: string;
    private model: string;

    constructor(baseUrl: string = 'http://ollama:11434', model: string = 'nomic-embed-text') {
        this.baseUrl = baseUrl;
        this.model = model;
    }

    async getEmbedding(text: string): Promise<number[]> {
        try {
            const response = await axios.post(`${this.baseUrl}/api/embeddings`, {
                model: this.model,
                prompt: text
            });
            return response.data.embedding; // Ollama returns 'embedding': [...]
        } catch (error: any) {
            console.error('Ollama Embedding Error:', error.response?.data || error.message);
            throw new Error('Failed to generate embedding via Ollama');
        }
    }
}

// Local Transformers Provider (via Hugging Face TEI - OpenAI Compatible)
class TransformersEmbeddingProvider implements EmbeddingProvider {
    private baseUrl: string;

    constructor(baseUrl: string = 'http://embeddings:8080') {
        this.baseUrl = baseUrl;
    }

    async getEmbedding(text: string): Promise<number[]> {
        try {
            // TEI exposes an OpenAI-compatible endpoint at /v1/embeddings (if using newer versions)
            // or we can use the native /embed endpoint: POST /embed { "inputs": "string" } -> [[0.1, ...]]

            // Current common usage for TEI:
            const response = await axios.post(`${this.baseUrl}/embed`, {
                inputs: text
            });
            // Response is array of arrays (batch support), we sent one string, so take index 0
            return response.data[0];
        } catch (error: any) {
            console.error('Transformers (TEI) Embedding Error:', error.response?.data || error.message);

            // Fallback: Try OpenAI compatible /v1/embeddings if /embed fails
            try {
                const response = await axios.post(`${this.baseUrl}/v1/embeddings`, {
                    input: text,
                    model: 'sentence-transformers/all-MiniLM-L6-v2'
                });
                return response.data.data[0].embedding;
            } catch (e: any) {
                throw new Error('Failed to generate embedding via Transformers (TEI)');
            }
        }
    }
}

// Factory to get provider based on config
function getProvider(config?: { type: string, apiKey?: string, baseUrl?: string, model?: string }): EmbeddingProvider {
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

export const embeddingService = {
    calculateHash: calculateContentHash,

    getEmbedding: async (text: string, config?: any): Promise<number[]> => {
        const provider = getProvider(config);
        return provider.getEmbedding(text);
    },

    // Chunking logic
    chunkText: (text: string, chunkSize: number = 350, overlap: number = 100): string[] => {
        if (!text) return [];
        const chunks: string[] = [];
        let start = 0;

        while (start < text.length) {
            const end = Math.min(start + chunkSize, text.length);
            chunks.push(text.slice(start, end));

            if (end === text.length) break;
            start += (chunkSize - overlap);
        }
        return chunks;
    },

    // Format for pgvector (although pg driver handles array of numbers -> vector string automatically mostly, but being explicit helps)
    toSqlVector: (embedding: number[]): string => {
        return pgvector.toSql(embedding);
    }
};
