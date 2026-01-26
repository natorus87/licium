import { create } from 'zustand';
import axios from 'axios';
import type { NoteNode, LLMSettings, ChatMessage, LLMProvider, User } from './types';

const API_URL = '/api';

// Token logic removed for security. Authentication relies on Session Cookies.
axios.defaults.withCredentials = true; // Ensure cookies are sent (for session)

interface AppState {
    // Auth
    user: User | null;
    isAuthenticated: boolean;
    isCheckingAuth: boolean;

    tree: NoteNode[];
    selectedNoteId: string | null;
    selectedNoteContent: string | null;
    selectedNoteTitle: string | null;
    chatMessages: ChatMessage[];
    settings: LLMSettings;
    drawioSettings: { provider: 'cloud' | 'local'; localUrl: string };
    setDrawioSettings: (settings: { provider: 'cloud' | 'local'; localUrl: string }) => void;
    isSettingsOpen: boolean;
    saveError: string | null;
    isLoadingChat: boolean;
    isSaving: boolean;
    lastSaved: Date | null;

    // Explorer State
    expandedNodeIds: string[];
    toggleNodeExpansion: (id: string) => void;
    setNodeExpansion: (id: string, expanded: boolean) => void;
    expandPathToNode: (nodeId: string) => void;

    // Language
    language: 'de' | 'en' | 'fr' | 'it' | 'es' | 'nl';
    setLanguage: (lang: 'de' | 'en' | 'fr' | 'it' | 'es' | 'nl') => void;

    // Dark Mode
    darkMode: boolean;
    setDarkMode: (mode: boolean) => void;

    // UI State
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;

    // Auth Actions
    checkAuth: () => Promise<void>;
    login: (username: string, password: string) => Promise<boolean>;
    register: (username: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;

    // Actions
    fetchTree: () => Promise<void>;
    selectNote: (node: NoteNode) => void;
    fetchNoteContent: (id: string) => Promise<void>;
    updateNoteContent: (content: string) => void;
    saveNoteContent: (id?: string, content?: string) => Promise<void>;
    createNode: (parentId: string | null, type: 'folder' | 'note', title: string) => Promise<string>;
    deleteNode: (id: string) => Promise<void>;
    duplicateNode: (id: string) => Promise<void>;
    renameNode: (id: string, title: string) => Promise<void>;
    moveNode: (id: string, parentId: string | null) => Promise<void>;
    reorderNodes: (updates: { id: string; parentId: string | null; position: number }[]) => Promise<void>;
    sortNodes: (parentId: string | null) => Promise<void>;

    // Chat
    sendChatMessage: (message: string, mode?: 'chat' | 'summarize' | 'rewrite' | 'structure', useSearch?: boolean, useContext?: boolean, includeNoteContent?: boolean, label?: string) => Promise<void>;
    clearChat: () => void;

    // Modal State
    modal: {
        isOpen: boolean;
        type: 'alert' | 'confirm' | 'prompt';
        title: string;
        message: string;
        inputValue?: string;
        fields?: { name: string; label: string; placeholder?: string; value: string; type?: 'text' | 'textarea' }[];
        onConfirm: (value?: string | Record<string, string>) => void;
        onCancel: () => void;
    };
    openModal: (params: {
        type: 'alert' | 'confirm' | 'prompt';
        title: string;
        message?: string;
        inputValue?: string;
        fields?: { name: string; label: string; placeholder?: string; value: string; type?: 'text' | 'textarea' }[];
        onConfirm: (value?: string | Record<string, string>) => void;
        onCancel?: () => void;
    }) => void;
    closeModal: () => void;

    // Settings Actions
    addProvider: (provider: LLMProvider) => void;
    updateProvider: (id: string, updates: Partial<LLMProvider>) => void;
    removeProvider: (id: string) => void;
    setActiveProvider: (id: string) => void;
    toggleSettings: () => void;

    // Admin Actions
    fetchUsers: () => Promise<User[]>;
    createUser: (username: string, password: string) => Promise<boolean>;
    deleteUser: (id: number) => Promise<boolean>;
    updateUserRole: (id: number, role: 'admin' | 'user') => Promise<boolean>;
    adminResetPassword: (id: number, newPassword: string) => Promise<boolean>;

    // Registration Settings
    registrationEnabled: boolean;
    fetchRegistrationStatus: () => Promise<void>;
    toggleRegistration: (enabled: boolean) => Promise<boolean>;

    // User Actions
    resetOwnPassword: (newPassword: string) => Promise<boolean>;
    fetchGlobalSettings: () => Promise<void>;
    saveGlobalSettings: (config: LLMSettings) => Promise<boolean>;

    // Custom Prompts (Cloud Synced)
    customPrompts: { label: string, prompt: string }[];
    fetchCustomPrompts: () => Promise<void>;
    addCustomPrompt: (label: string, prompt: string) => void;
    updateCustomPrompt: (index: number, label: string, prompt: string) => void;
    removeCustomPrompt: (index: number) => void;

    // Version History
    fetchNoteVersions: (noteId: string) => Promise<{ id: number, created_at: string }[]>;
    restoreNoteVersion: (noteId: string, versionId: number) => Promise<boolean>;
}

const defaultProviders: LLMProvider[] = [
    {
        id: 'default-openai',
        name: 'OpenAI',
        type: 'openai',
        apiKey: '',
        model: 'gpt-4o',
        privacy: 'external',
        searxngUrl: 'http://searxng:8080',
        category: 'chat'
    },
    {
        id: 'default-ollama',
        name: 'Ollama (Local)',
        type: 'ollama',
        baseUrl: 'http://ollama:11434',
        model: 'llama3',
        privacy: 'local',
        searxngUrl: 'http://searxng:8080',
        category: 'chat'
    },
    {
        id: 'default-embeddings',
        name: 'Local TEI (Embeddings)',
        type: 'transformers',
        baseUrl: 'http://embeddings:8080',
        model: 'all-MiniLM-L6-v2',
        privacy: 'local',
        category: 'embedding'
    },
    {
        id: 'default-whisper',
        name: 'Local Whisper',
        type: 'custom',
        baseUrl: 'http://whisper:8000/v1/audio/transcriptions',
        model: 'deepdml/faster-whisper-large-v3-turbo-ct2',
        privacy: 'local',
        category: 'audio'
    }
];

const defaultSettings: LLMSettings = {
    activeProviderId: 'default-openai',
    embeddingProviderId: 'default-embeddings',
    audioProviderId: 'default-whisper',
    searxngUrl: 'http://searxng:8080',
    providers: defaultProviders
};

const initialSettings = defaultSettings;

const savedPrompts = localStorage.getItem('custom_prompts');
let initialPrompts: { label: string, prompt: string }[] = [];
try {
    if (savedPrompts) {
        initialPrompts = JSON.parse(savedPrompts);
    }
} catch (e) {
    console.error("Failed to parse custom prompts", e);
}

const savedExpandedNodes = localStorage.getItem('expanded_nodes');
let initialExpandedNodes: string[] = [];
try {
    if (savedExpandedNodes) {
        initialExpandedNodes = JSON.parse(savedExpandedNodes);
    }
} catch (e) {
    console.error("Failed to parse expanded nodes", e);
}

export const useStore = create<AppState>((set, get) => ({
    // Auth state
    user: null,
    isAuthenticated: false,
    isCheckingAuth: true,

    tree: [],
    selectedNoteId: null,
    selectedNoteContent: null,
    selectedNoteTitle: null,
    chatMessages: [],
    settings: initialSettings,
    drawioSettings: JSON.parse(localStorage.getItem('drawio_settings') || '{"provider":"local","localUrl":"/draw"}'),
    setDrawioSettings: (newSettings) => {
        set({ drawioSettings: newSettings });
        localStorage.setItem('drawio_settings', JSON.stringify(newSettings));
    },
    isSettingsOpen: false,
    isLoadingChat: false,
    isSaving: false,
    lastSaved: null,
    saveError: null,
    registrationEnabled: true,

    // Explorer State
    expandedNodeIds: initialExpandedNodes,
    toggleNodeExpansion: (id) => {
        const { expandedNodeIds } = get();
        const newExpanded = expandedNodeIds.includes(id)
            ? expandedNodeIds.filter(nodeId => nodeId !== id)
            : [...expandedNodeIds, id];
        set({ expandedNodeIds: newExpanded });
        localStorage.setItem('expanded_nodes', JSON.stringify(newExpanded));
    },
    setNodeExpansion: (id, expanded) => {
        const { expandedNodeIds } = get();
        let newExpanded;
        if (expanded) {
            newExpanded = expandedNodeIds.includes(id) ? expandedNodeIds : [...expandedNodeIds, id];
        } else {
            newExpanded = expandedNodeIds.filter(nodeId => nodeId !== id);
        }
        set({ expandedNodeIds: newExpanded });
        localStorage.setItem('expanded_nodes', JSON.stringify(newExpanded));
    },
    expandPathToNode: (nodeId) => {
        const { tree, expandedNodeIds } = get();
        const path: string[] = [];

        const search = (nodes: NoteNode[], targetId: string, parents: string[]): boolean => {
            for (const node of nodes) {
                if (node.id === targetId) {
                    path.push(...parents);
                    return true;
                }
                if (node.children) {
                    if (search(node.children, targetId, [...parents, node.id])) return true;
                }
            }
            return false;
        };

        search(tree, nodeId, []);

        const newExpanded = Array.from(new Set([...expandedNodeIds, ...path]));
        set({ expandedNodeIds: newExpanded });
        localStorage.setItem('expanded_nodes', JSON.stringify(newExpanded));
    },

    // Language
    language: (localStorage.getItem('language') as 'de' | 'en' | 'fr' | 'it' | 'es' | 'nl') || 'de',
    setLanguage: (lang) => {
        set({ language: lang });
        localStorage.setItem('language', lang);
    },

    // Dark Mode
    darkMode: (function () {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('darkMode');
            if (saved !== null) return JSON.parse(saved);
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    })(),
    setDarkMode: (mode) => {
        set({ darkMode: mode });
        localStorage.setItem('darkMode', JSON.stringify(mode));
    },

    // UI
    isSidebarOpen: true,
    setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

    // Auth actions
    checkAuth: async () => {
        try {
            const res = await axios.get(`${API_URL}/me`, { withCredentials: true });
            set({ user: res.data, isAuthenticated: true, isCheckingAuth: false });
            get().fetchTree();
            get().fetchGlobalSettings();
            get().fetchCustomPrompts();
            get().fetchRegistrationStatus();
        } catch (error) {
            set({ user: null, isAuthenticated: false, isCheckingAuth: false });
        }
    },

    login: async (username: string, password: string) => {
        try {
            const res = await axios.post(`${API_URL}/login`, { username, password }, { withCredentials: true });
            set({ user: res.data, isAuthenticated: true });
            get().fetchTree();
            get().fetchGlobalSettings();
            get().fetchCustomPrompts();
            get().fetchRegistrationStatus();
            return true;
        } catch (error) {
            return false;
        }
    },

    register: async (username: string, password: string) => {
        try {
            const res = await axios.post(`${API_URL}/register`, { username, password }, { withCredentials: true });
            set({ user: res.data, isAuthenticated: true });
            return true;
        } catch (error) {
            return false;
        }
    },

    logout: async () => {
        try {
            await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
            set({ user: null, isAuthenticated: false, tree: [], selectedNoteId: null, selectedNoteContent: '', chatMessages: [] });
        } catch (error) {
            console.error('Logout failed:', error);
        }
    },

    fetchTree: async () => {
        try {
            const res = await axios.get(`${API_URL}/tree`, { withCredentials: true });
            set({ tree: res.data });
        } catch (error) {
            console.error("Failed to fetch tree:", error);
        }
    },

    selectNote: (node) => {
        if (node.type === 'note') {
            set({
                selectedNoteId: node.id,
                selectedNoteContent: null,
                selectedNoteTitle: node.title
            });

            get().fetchNoteContent(node.id);
            get().fetchTree();
        }
    },

    fetchNoteContent: async (id: string) => {
        try {
            const res = await axios.get(`${API_URL}/notes/${id}`, { withCredentials: true });
            if (res.data) {
                const content = res.data.content_markdown === null ? '' : res.data.content_markdown;
                if (typeof content === 'string') {
                    if (get().selectedNoteId === id) {
                        set({ selectedNoteContent: content });

                        const updateTree = (nodes: NoteNode[]): NoteNode[] => {
                            return nodes.map(node => {
                                if (node.id === id) return { ...node, contentMarkdown: content };
                                if (node.children) return { ...node, children: updateTree(node.children) };
                                return node;
                            });
                        };
                        set(state => ({ tree: updateTree(state.tree) }));
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch fresh note content:", error);
        }
    },

    updateNoteContent: (content) => {
        set({ selectedNoteContent: content });
    },

    saveNoteContent: async (id?: string, content?: string) => {
        const { selectedNoteId, selectedNoteContent } = get();
        const targetId = id || selectedNoteId;
        const targetContent = content !== undefined ? content : selectedNoteContent;

        if (!targetId) return;
        if (targetContent === null) {
            console.warn("Skipping save: Content not loaded (null)");
            return;
        }

        set({ isSaving: true, saveError: null });
        try {
            await axios.put(`${API_URL}/notes/${targetId}`, { content: targetContent }, { withCredentials: true });

            const updateNodeInTree = (nodes: NoteNode[]): NoteNode[] => {
                return nodes.map(node => {
                    if (node.id === targetId) {
                        return { ...node, contentMarkdown: targetContent || '' };
                    }
                    if (node.children && node.children.length > 0) {
                        return { ...node, children: updateNodeInTree(node.children) };
                    }
                    return node;
                });
            };

            set((state) => ({
                tree: updateNodeInTree(state.tree),
                isSaving: false,
                lastSaved: targetId === state.selectedNoteId ? new Date() : state.lastSaved
            }));

        } catch (error) {
            console.error("Save failed:", error);
            if (targetId === get().selectedNoteId) {
                set({ isSaving: false, saveError: "Speichern fehlgeschlagen" });
            } else {
                set({ isSaving: false });
            }
        }
    },

    createNode: async (parentId, type, title) => {
        const res = await axios.post(`${API_URL}/notes`, { parentId, type, title }, { withCredentials: true });
        await get().fetchTree();
        return res.data.id;
    },

    deleteNode: async (id) => {
        await axios.delete(`${API_URL}/notes/${id}`, { withCredentials: true });
        if (get().selectedNoteId === id) {
            set({ selectedNoteId: null, selectedNoteContent: '' });
        }
        await get().fetchTree();
    },

    duplicateNode: async (id) => {
        await axios.post(`${API_URL}/notes/${id}/duplicate`, {}, { withCredentials: true });
        await get().fetchTree();
    },

    renameNode: async (id, title) => {
        await axios.put(`${API_URL}/notes/${id}`, { title }, { withCredentials: true });

        const { selectedNoteId } = get();
        if (selectedNoteId === id) {
            set({ selectedNoteTitle: title });
        }

        await get().fetchTree();
    },

    moveNode: async (id: string, parentId: string | null) => {
        await axios.put(`${API_URL}/notes/${id}/move`, { parentId }, { withCredentials: true });
        await get().fetchTree();
    },

    reorderNodes: async (updates) => {
        try {
            await axios.put(`${API_URL}/notes/reorder`, { updates }, { withCredentials: true });
            await get().fetchTree();
        } catch (error) {
            console.error('Reorder failed:', error);
        }
    },

    sortNodes: async (parentId: string | null) => {
        try {
            await axios.post(`${API_URL}/notes/sort`, { parentId }, { withCredentials: true });
            await get().fetchTree();
        } catch (error) {
            console.error('Sort failed:', error);
        }
    },

    sendChatMessage: async (message, mode = 'chat', useSearch = false, useContext = false, includeNoteContent = true, label?: string) => {
        const { settings, chatMessages, selectedNoteContent } = get();
        const activeProvider = settings.providers.find(p => p.id === settings.activeProviderId);

        if (!activeProvider) {
            set({
                chatMessages: [...chatMessages, { role: 'user', content: message, label }, { role: 'assistant', content: "Fehler: Kein aktiver LLM-Anbieter ausgewählt. Bitte überprüfen Sie Ihre Einstellungen." }],
                isLoadingChat: false
            });
            return;
        }

        if (activeProvider.type === 'openai' && !activeProvider.apiKey) {
            set({
                chatMessages: [...chatMessages, { role: 'user', content: message, label }, { role: 'assistant', content: "Fehler: OpenAI API-Schlüssel fehlt. Bitte konfigurieren Sie ihn in den Einstellungen." }],
                isLoadingChat: false
            });
            return;
        }

        const newMessages: ChatMessage[] = [...chatMessages, { role: 'user', content: message, label }];
        set({ chatMessages: newMessages, isLoadingChat: true });

        try {
            let backendMessages = newMessages.map(m => ({ role: m.role, content: m.content }));

            if (useContext) {
                try {
                    const ragRes = await axios.post(`${API_URL}/rag/search`, { query: message }, { withCredentials: true });
                    const chunks = ragRes.data;
                    if (chunks && chunks.length > 0) {
                        const contextBlock = chunks.map((c: any) => `[Note: ${c.title}]\n${c.chunk_content}`).join('\n\n');
                        const contextString = `\n\nRelevant Context from Notes:\n${contextBlock}\n\n`;
                        const lastMsgFn = backendMessages[backendMessages.length - 1];
                        lastMsgFn.content = contextString + lastMsgFn.content;
                    }
                } catch (ragError) {
                    console.error("RAG fetch failed", ragError);
                }
            }

            const configToSend = {
                ...activeProvider,
                searxngUrl: settings.searxngUrl || 'http://searxng:8080'
            };

            const res = await axios.post(`${API_URL}/chat`, {
                config: configToSend,
                messages: backendMessages,
                noteContent: includeNoteContent ? selectedNoteContent : undefined,
                mode,
                useSearch,
                language: get().language
            }, { withCredentials: true });

            set({
                chatMessages: [...newMessages, { role: 'assistant', content: res.data.assistantMessage }],
                isLoadingChat: false
            });
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.response?.data?.error || error.message || "Antwort konnte nicht abgerufen werden.";
            set({
                chatMessages: [...newMessages, { role: 'assistant', content: `Fehler: ${errorMessage}` }],
                isLoadingChat: false
            });
        }
    },

    clearChat: () => set({ chatMessages: [] }),

    addProvider: (provider) => {
        const { settings } = get();
        const newSettings = { ...settings, providers: [...settings.providers, provider] };
        set({ settings: newSettings });
    },

    updateProvider: (id, updates) => {
        const { settings } = get();
        const newProviders = settings.providers.map(p => p.id === id ? { ...p, ...updates } : p);
        const newSettings = { ...settings, providers: newProviders };
        set({ settings: newSettings });
    },

    removeProvider: (id) => {
        const { settings } = get();
        const newProviders = settings.providers.filter(p => p.id !== id);
        let newActiveId = settings.activeProviderId;
        if (id === settings.activeProviderId) {
            newActiveId = newProviders.length > 0 ? newProviders[0].id : '';
        }
        const newSettings = { ...settings, providers: newProviders, activeProviderId: newActiveId };
        set({ settings: newSettings });
    },

    setActiveProvider: (id) => {
        const { settings } = get();
        const newSettings = { ...settings, activeProviderId: id };
        set({ settings: newSettings });
    },

    toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),

    modal: {
        isOpen: false,
        type: 'alert',
        title: '',
        message: '',
        onConfirm: () => { },
        onCancel: () => { }
    },

    openModal: (params) => set({
        modal: {
            isOpen: true,
            type: params.type,
            title: params.title,
            message: params.message || '',
            inputValue: params.inputValue,
            fields: params.fields,
            onConfirm: params.onConfirm,
            onCancel: params.onCancel || (() => set((state) => ({ modal: { ...state.modal, isOpen: false } }))),
        }
    }),

    closeModal: () => set((state) => ({
        modal: { ...state.modal, isOpen: false }
    })),

    fetchUsers: async () => {
        try {
            const res = await axios.get(`${API_URL}/users`, { withCredentials: true });
            return res.data;
        } catch (error) {
            console.error('Fetch users error:', error);
            return [];
        }
    },

    createUser: async (username: string, password: string) => {
        try {
            await axios.post(`${API_URL}/users`, { username, password }, { withCredentials: true });
            return true;
        } catch (error) {
            console.error('Create user error:', error);
            return false;
        }
    },

    deleteUser: async (id) => {
        try {
            await axios.delete(`${API_URL}/users/${id}`, { withCredentials: true });
            return true;
        } catch (error) {
            console.error('Delete user error:', error);
            return false;
        }
    },

    updateUserRole: async (id, role) => {
        try {
            await axios.put(`${API_URL}/users/${id}/role`, { role }, { withCredentials: true });
            return true;
        } catch (error) {
            console.error('Update role error:', error);
            return false;
        }
    },

    adminResetPassword: async (id: number, newPassword: string) => {
        try {
            await axios.post(`${API_URL}/users/${id}/reset-password`, { newPassword }, { withCredentials: true });
            return true;
        } catch (error) {
            console.error('Admin reset password error:', error);
            return false;
        }
    },

    fetchRegistrationStatus: async () => {
        try {
            const res = await axios.get(`${API_URL}/settings/registration`);
            set({ registrationEnabled: res.data.enabled });
        } catch (error) {
            console.error('Failed to fetch registration status:', error);
        }
    },

    toggleRegistration: async (enabled: boolean) => {
        try {
            await axios.put(`${API_URL}/settings/registration`, { enabled }, { withCredentials: true });
            set({ registrationEnabled: enabled });
            return true;
        } catch (error) {
            console.error('Failed to update registration settings:', error);
            return false;
        }
    },

    resetOwnPassword: async (newPassword) => {
        try {
            await axios.post(`${API_URL}/auth/reset-password`, { newPassword }, { withCredentials: true });
            return true;
        } catch (error) {
            console.error('Reset password error:', error);
            return false;
        }
    },

    fetchGlobalSettings: async () => {
        try {
            const res = await axios.get(`${API_URL}/settings/llm`, { withCredentials: true });
            if (res.data) {
                if (res.data) {
                    let newSettings;
                    if (res.data.providers && Array.isArray(res.data.providers)) {
                        newSettings = res.data;

                        const currentProviderIds = new Set(newSettings.providers.map((p: any) => p.id));
                        const missingDefaults = defaultProviders.filter(dp =>
                            !currentProviderIds.has(dp.id) &&
                            (dp.id === 'default-whisper')
                        );

                        if (missingDefaults.length > 0) {
                            newSettings.providers = [...newSettings.providers, ...missingDefaults];
                        }

                        if (!newSettings.audioProviderId) {
                            newSettings.audioProviderId = 'default-whisper';
                        }

                        newSettings.providers = newSettings.providers.map((p: any) => {
                            if (p.id === 'default-whisper') {
                                const updates: any = {};
                                if (p.baseUrl === 'http://whisper:8000') {
                                    updates.baseUrl = 'http://whisper:8000/v1/audio/transcriptions';
                                }
                                if (p.model === 'faster-whisper-large-v3-turbo-ct2' || p.model === 'large-v3') {
                                    updates.model = 'deepdml/faster-whisper-large-v3-turbo-ct2';
                                }
                                return { ...p, ...updates };
                            }
                            return p;
                        });
                    } else {
                        newSettings = {
                            ...get().settings,
                            providers: [res.data],
                            activeProviderId: res.data.id,
                            embeddingProviderId: res.data.id,
                            audioProviderId: 'default-whisper'
                        };
                    }

                    set({ settings: newSettings });
                }
            }
        } catch (error) {
            console.error('Fetch settings error:', error);
        }
    },

    saveGlobalSettings: async (config) => {
        try {
            await axios.put(`${API_URL}/settings/llm`, config, { withCredentials: true });
            return true;
        } catch (error) {
            console.error('Save settings error:', error);
            return false;
        }
    },

    customPrompts: initialPrompts,

    fetchCustomPrompts: async () => {
        try {
            const { user } = get();
            if (!user) return;

            const res = await axios.get(`${API_URL}/user/settings/custom_prompts`);
            let serverPrompts = res.data;

            if (!serverPrompts) {
                const localPrompts = localStorage.getItem('custom_prompts');
                if (localPrompts) {
                    try {
                        serverPrompts = JSON.parse(localPrompts);
                        await axios.put(`${API_URL}/user/settings/custom_prompts`, { value: serverPrompts });
                        localStorage.removeItem('custom_prompts');
                    } catch (e) {
                        console.error('Migration parse error', e);
                        serverPrompts = [];
                    }
                } else {
                    serverPrompts = [];
                }
            }
            set({ customPrompts: serverPrompts });
        } catch (error) {
            console.error('Failed to fetch custom prompts:', error);
        }
    },

    addCustomPrompt: (label, prompt) => {
        const { customPrompts } = get();
        const newPrompts = [...customPrompts, { label, prompt }];
        set({ customPrompts: newPrompts });
        axios.put(`${API_URL}/user/settings/custom_prompts`, { value: newPrompts }).catch(console.error);
    },

    updateCustomPrompt: (index, label, prompt) => {
        const { customPrompts } = get();
        if (index < 0 || index >= customPrompts.length) return;

        const newPrompts = [...customPrompts];
        newPrompts[index] = { label, prompt };

        set({ customPrompts: newPrompts });
        axios.put(`${API_URL}/user/settings/custom_prompts`, { value: newPrompts }).catch(console.error);
    },

    removeCustomPrompt: (index) => {
        const { customPrompts } = get();
        const newPrompts = customPrompts.filter((_, i) => i !== index);
        set({ customPrompts: newPrompts });
        axios.put(`${API_URL}/user/settings/custom_prompts`, { value: newPrompts }).catch(console.error);
    },

    fetchNoteVersions: async (noteId: string) => {
        try {
            const res = await axios.get(`${API_URL}/notes/${noteId}/versions`, { withCredentials: true });
            return res.data;
        } catch (error) {
            console.error('Fetch versions error:', error);
            return [];
        }
    },

    restoreNoteVersion: async (noteId: string, versionId: number) => {
        try {
            const res = await axios.post(`${API_URL}/notes/${noteId}/restore/${versionId}`, {}, { withCredentials: true });
            const restoredContent = res.data.content;

            set({ selectedNoteContent: restoredContent });

            const updateNodeInTree = (nodes: NoteNode[]): NoteNode[] => {
                return nodes.map(node => {
                    if (node.id === noteId) {
                        return { ...node, contentMarkdown: restoredContent };
                    }
                    if (node.children && node.children.length > 0) {
                        return { ...node, children: updateNodeInTree(node.children) };
                    }
                    return node;
                });
            };
            set(state => ({ tree: updateNodeInTree(state.tree) }));
            return true;
        } catch (error) {
            console.error('Restore version error:', error);
            return false;
        }
    }
}));
