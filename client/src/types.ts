export type NodeType = 'folder' | 'note';

export interface NoteNode {
    id: string;
    parentId: string | null;
    type: NodeType;
    title: string;
    contentMarkdown?: string;
    children?: NoteNode[];
    createdAt: string;
    updatedAt: string;
    position?: number;
}

export interface User {
    id: number;
    username: string;
    role: 'admin' | 'user';
    created_at: string;
}

export interface LLMProvider {
    id: string;
    name: string;
    type: 'openai' | 'ollama' | 'transformers' | 'custom'; // 'custom' is for other OpenAI-compatible APIs
    baseUrl?: string;
    apiKey?: string;
    model: string;
    searxngUrl?: string;
    privacy: 'local' | 'external';
    category?: 'chat' | 'embedding' | 'audio'; // 'chat' is default for backward compatibility
}

export interface LLMSettings {
    activeProviderId: string;
    embeddingProviderId?: string; // Optional for backward compatibility, defaults to activeProviderId if missing
    audioProviderId?: string; // ID of the selected audio provider
    searxngUrl?: string; // Global SearXNG URL
    providers: LLMProvider[];
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    label?: string;
}
