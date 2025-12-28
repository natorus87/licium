import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { X, Save, Key, Shield, Plus, Trash2, Database, Mic } from 'lucide-react';
import type { LLMProvider } from '../types';
import { UserManagement } from './UserManagement';
import { translations } from '../i18n/translations';
import packageJson from '../../package.json';

export const Settings: React.FC = () => {
    const {
        isSettingsOpen, toggleSettings, settings,
        user, resetOwnPassword, openModal, fetchGlobalSettings, saveGlobalSettings,
        language, setLanguage,
        drawioSettings, setDrawioSettings
    } = useStore();

    const t = translations[language];
    const [activeTab, setActiveTab] = useState<'general' | 'llm' | 'embeddings' | 'tools' | 'users' | 'info'>('general');
    const [localProviders, setLocalProviders] = useState<LLMProvider[]>([]);
    const [localSearxngUrl, setLocalSearxngUrl] = useState('');
    const [systemInfo, setSystemInfo] = useState<any>(null);
    const [systemInfoLoading, setSystemInfoLoading] = useState(false);
    const hasEditedRef = useRef(false);

    useEffect(() => {
        if (isSettingsOpen) {
            hasEditedRef.current = false;
            fetchGlobalSettings();
            setLocalProviders(settings.providers);
            setLocalSearxngUrl(settings.searxngUrl || '');
            // Fetch system info when opening settings
            fetchSystemInfo();

        }
    }, [isSettingsOpen]);



    useEffect(() => {
        if (isSettingsOpen && !hasEditedRef.current && settings.providers.length > 0) {
            setLocalProviders(settings.providers);
            setLocalSearxngUrl(settings.searxngUrl || '');
        }
    }, [isSettingsOpen, settings.providers, settings.searxngUrl]);

    const [saveStatus, setSaveStatus] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    if (!isSettingsOpen) return null;

    const handleSave = async () => {
        if (user?.role === 'admin') {
            const configToSave = {
                activeProviderId: settings.activeProviderId,
                embeddingProviderId: settings.embeddingProviderId || settings.activeProviderId,
                searxngUrl: localSearxngUrl,
                providers: localProviders
            };

            const success = await saveGlobalSettings(configToSave);
            if (success) {
                setSaveStatus({ message: t.editor.saved, type: 'success' });
            } else {
                setSaveStatus({ message: t.editor.error, type: 'error' });
            }
            setTimeout(() => setSaveStatus(null), 3000);
        } else {
            setSaveStatus({ message: 'Admin required', type: 'error' });
            setTimeout(() => setSaveStatus(null), 3000);
        }
        // toggleSettings(); // Remove this if we want to show the message inside the modal
        // The user wants the message "from the website", so inline is best.
        // But if I keep it open, they might want to close it manually.
        // Let's close it after a delay OR just show the message and let them close.
        // I'll keep the modal open so they see the message.
    };

    const handlePasswordReset = () => {
        openModal({
            type: 'prompt',
            title: t.settings.account.changePassword,
            message: t.settings.account.enterNewPassword,
            onConfirm: async (val) => {
                if (typeof val !== 'string' || !val) return;
                const password = val;
                if (password) {
                    const success = await resetOwnPassword(password);
                    if (success) {
                        setSaveStatus({ message: t.settings.account.success, type: 'success' });
                    } else {
                        setSaveStatus({ message: t.settings.account.error, type: 'error' });
                    }
                    setTimeout(() => setSaveStatus(null), 3000);
                }
            }
        });
    };

    const fetchSystemInfo = async () => {
        setSystemInfoLoading(true);
        try {
            const response = await fetch('/api/system/info', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setSystemInfo(data);
            }
        } catch (error) {
            console.error('Failed to fetch system info:', error);
        } finally {
            setSystemInfoLoading(false);
        }
    };

    const isAdmin = user?.role === 'admin';

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t.settings.title}</h2>
                    <button onClick={toggleSettings} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex border-b dark:border-gray-700 overflow-x-auto no-scrollbar">
                    <button
                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap shrink-0 ${activeTab === 'general' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        onClick={() => setActiveTab('general')}
                    >
                        {t.settings.tabs.general}
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap shrink-0 ${activeTab === 'llm' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        onClick={() => setActiveTab('llm')}
                    >
                        {t.settings.tabs.llm}
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap shrink-0 ${activeTab === 'embeddings' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        onClick={() => setActiveTab('embeddings')}
                    >
                        {t.settings.tabs.embeddings}
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap shrink-0 ${activeTab === 'tools' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        onClick={() => setActiveTab('tools')}
                    >
                        {t.settings.tabs.tools}
                    </button>

                    {isAdmin && (
                        <button
                            className={`px-4 py-2 text-sm font-medium whitespace-nowrap shrink-0 ${activeTab === 'users' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                            onClick={() => setActiveTab('users')}
                        >
                            {t.settings.tabs.users}
                        </button>
                    )}

                    <button
                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap shrink-0 ${activeTab === 'info' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        onClick={() => setActiveTab('info')}
                    >
                        {t.settings.info.title}
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <div className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.settings.labels.language}</label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setLanguage('de')}
                                            className={`px-4 py-2 rounded border ${language === 'de' ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200' : 'bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600'}`}
                                        >
                                            🇩🇪 Deutsch
                                        </button>
                                        <button
                                            onClick={() => setLanguage('en')}
                                            className={`px-4 py-2 rounded border ${language === 'en' ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200' : 'bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600'}`}
                                        >
                                            🇬🇧 English
                                        </button>
                                        <button
                                            onClick={() => setLanguage('fr')}
                                            className={`px-4 py-2 rounded border ${language === 'fr' ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200' : 'bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600'}`}
                                        >
                                            🇫🇷 Français
                                        </button>
                                        <button
                                            onClick={() => setLanguage('it')}
                                            className={`px-4 py-2 rounded border ${language === 'it' ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200' : 'bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600'}`}
                                        >
                                            🇮🇹 Italiano
                                        </button>
                                        <button
                                            onClick={() => setLanguage('es')}
                                            className={`px-4 py-2 rounded border ${language === 'es' ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200' : 'bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600'}`}
                                        >
                                            🇪🇸 Español
                                        </button>
                                        <button
                                            onClick={() => setLanguage('nl')}
                                            className={`px-4 py-2 rounded border ${language === 'nl' ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200' : 'bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600'}`}
                                        >
                                            🇳🇱 Nederlands
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100">{t.settings.account.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    {t.settings.account.loggedInAs} <span className="font-mono font-bold">{user?.username}</span>
                                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full uppercase">{user?.role}</span>
                                </p>
                                <button
                                    onClick={handlePasswordReset}
                                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-sm"
                                >
                                    <Key size={16} /> {t.settings.account.changePassword}
                                </button>
                            </div>
                        </div>
                    )}
                    {activeTab === 'llm' && (
                        <div className="space-y-6">
                            {!isAdmin && (
                                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                                    <Shield size={16} />
                                    {t.settings.llm.adminManaged}
                                </div>
                            )}

                            {/* Chat Models Section */}
                            <div>
                                <h4 className="font-bold text-md mb-2 text-gray-800 dark:text-gray-200 border-b dark:border-gray-700 pb-1">{t.settings.llm.chatModels}</h4>
                                <button
                                    onClick={() => {
                                        const newId = `custom-${Date.now()}`;
                                        const newProvider: LLMProvider = {
                                            id: newId,
                                            name: `Chat Model ${localProviders.filter(p => !p.category || p.category === 'chat').length + 1}`,
                                            type: 'custom',
                                            baseUrl: '',
                                            apiKey: '',
                                            model: '',
                                            privacy: 'external',
                                            category: 'chat'
                                        };
                                        const newProviders = [...localProviders, newProvider];
                                        setLocalProviders(newProviders);
                                        hasEditedRef.current = true;
                                    }}
                                    className="mb-4 flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                >
                                    <Plus size={16} /> {t.settings.llm.addModel}
                                </button>

                                {localProviders.filter(p => !p.category || p.category === 'chat').map((provider) => (
                                    <div key={provider.id} className="border dark:border-gray-700 rounded-lg p-4 space-y-4 relative mb-4">
                                        <div className="absolute top-4 right-4">
                                            <button
                                                onClick={() => {
                                                    if (confirm(t.settings.labels.deleteProvider + '?')) {
                                                        const newProviders = localProviders.filter(p => p.id !== provider.id);
                                                        setLocalProviders(newProviders);
                                                        hasEditedRef.current = true;
                                                    }
                                                }}
                                                className="text-red-500 hover:text-red-700 p-1"
                                                title={t.settings.labels.deleteProvider}
                                                disabled={!isAdmin}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.settings.labels.providerName}</label>
                                                <input
                                                    disabled={!isAdmin}
                                                    value={provider.name || ''}
                                                    onChange={(e) => {
                                                        hasEditedRef.current = true;
                                                        const newProviders = localProviders.map(p => p.id === provider.id ? { ...p, name: e.target.value } : p);
                                                        setLocalProviders(newProviders);
                                                    }}
                                                    className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 disabled:opacity-50"
                                                    placeholder="e.g. GPT-4"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.settings.labels.category}</label>
                                                <select
                                                    disabled={!isAdmin}
                                                    value={provider.category || 'chat'}
                                                    onChange={(e) => {
                                                        hasEditedRef.current = true;
                                                        const newCategory = e.target.value as any;
                                                        const newProviders = localProviders.map(p => p.id === provider.id ? { ...p, category: newCategory } : p);
                                                        setLocalProviders(newProviders);
                                                    }}
                                                    className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 disabled:opacity-50"
                                                >
                                                    <option value="chat">{t.settings.labels.categoryChat}</option>
                                                    <option value="embedding">{t.settings.labels.categoryEmbedding}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.settings.labels.provider}</label>
                                                <select
                                                    disabled={!isAdmin}
                                                    value={provider.type}
                                                    onChange={(e) => {
                                                        hasEditedRef.current = true;
                                                        const newType = e.target.value as any;
                                                        const updates: any = { type: newType };
                                                        if (newType === 'ollama') updates.baseUrl = 'http://ollama:11434';
                                                        else if (newType === 'openai') updates.baseUrl = 'https://api.openai.com/v1';

                                                        const newProviders = localProviders.map(p => p.id === provider.id ? { ...p, ...updates } : p);
                                                        setLocalProviders(newProviders);
                                                    }}
                                                    className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 disabled:opacity-50"
                                                >
                                                    <option value="openai">OpenAI</option>
                                                    <option value="ollama">Ollama</option>
                                                    <option value="custom">{t.settings.labels.typeCustom}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.settings.labels.model}</label>
                                                <input
                                                    disabled={!isAdmin}
                                                    value={provider.model}
                                                    onChange={(e) => {
                                                        hasEditedRef.current = true;
                                                        const newProviders = localProviders.map(p => p.id === provider.id ? { ...p, model: e.target.value } : p);
                                                        setLocalProviders(newProviders);
                                                    }}
                                                    className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 disabled:opacity-50"
                                                    placeholder={t.settings.placeholders.modelExample}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.settings.labels.privacyMode}</label>
                                                <select
                                                    disabled={!isAdmin}
                                                    value={provider.privacy || 'external'}
                                                    onChange={(e) => {
                                                        hasEditedRef.current = true;
                                                        const newProviders = localProviders.map(p => p.id === provider.id ? { ...p, privacy: e.target.value as any } : p);
                                                        setLocalProviders(newProviders);
                                                    }}
                                                    className={`w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-sm disabled:opacity-50 ${provider.privacy === 'local' ? 'text-green-600 dark:text-green-400 font-medium' : 'text-orange-600 dark:text-orange-400 font-medium'}`}
                                                >
                                                    <option value="local">🏠 {t.settings.labels.privacyLocal}</option>
                                                    <option value="external">🌐 {t.settings.labels.privacyExternal}</option>
                                                </select>
                                            </div>

                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.settings.labels.baseUrl}</label>
                                                <input
                                                    disabled={!isAdmin}
                                                    value={provider.baseUrl || ''}
                                                    onChange={(e) => {
                                                        hasEditedRef.current = true;
                                                        const newProviders = localProviders.map(p => p.id === provider.id ? { ...p, baseUrl: e.target.value } : p);
                                                        setLocalProviders(newProviders);
                                                    }}
                                                    className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 disabled:opacity-50"
                                                    placeholder={t.settings.placeholders.baseUrlExample}
                                                />
                                            </div>
                                            {provider.type !== 'ollama' && (
                                                <div className="col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.settings.labels.apiKey}</label>
                                                    <input
                                                        disabled={!isAdmin}
                                                        type="password"
                                                        value={provider.apiKey || ''}
                                                        onChange={(e) => {
                                                            hasEditedRef.current = true;
                                                            const newProviders = localProviders.map(p => p.id === provider.id ? { ...p, apiKey: e.target.value } : p);
                                                            setLocalProviders(newProviders);
                                                        }}
                                                        className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 disabled:opacity-50"
                                                        placeholder={t.settings.placeholders.apiKeyExample}
                                                    />
                                                </div>
                                            )}
                                            {/* SearXNG URL removed from here - now global */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'embeddings' && (
                        <div className="space-y-6">
                            {!isAdmin && (
                                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                                    <Shield size={16} />
                                    {t.settings.embeddings.adminManaged}
                                </div>
                            )}

                            <div className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 mb-6">
                                <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                    <Database size={20} /> {t.settings.embeddings.title}
                                </h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.settings.embeddings.providerLabel}</label>
                                    <p className="text-sm text-gray-500 mb-2">{t.settings.embeddings.providerHelp}</p>
                                    <select
                                        disabled={!isAdmin}
                                        value={settings.embeddingProviderId || settings.activeProviderId}
                                        onChange={(e) => {
                                            if (isAdmin) {
                                                hasEditedRef.current = true;
                                                useStore.setState(state => ({
                                                    settings: { ...state.settings, embeddingProviderId: e.target.value }
                                                }));
                                            }
                                        }}
                                        className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 disabled:opacity-50"
                                    >
                                        <option value="">{t.settings.embeddings.selectModelPlaceholder}</option>
                                        {localProviders.filter(p => p.category === 'embedding').map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} ({p.type})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Embedding Models Section */}
                            <div>
                                <h4 className="font-bold text-md mb-2 text-gray-800 dark:text-gray-200 border-b dark:border-gray-700 pb-1">{t.settings.embeddings.modelsTitle}</h4>
                                <button
                                    onClick={() => {
                                        const newId = `custom-embed-${Date.now()}`;
                                        const newProvider: LLMProvider = {
                                            id: newId,
                                            name: `Embedding Model ${localProviders.filter(p => p.category === 'embedding').length + 1}`,
                                            type: 'transformers',
                                            baseUrl: 'http://embeddings:8080',
                                            apiKey: '',
                                            model: '',
                                            privacy: 'local',
                                            category: 'embedding'
                                        };
                                        const newProviders = [...localProviders, newProvider];
                                        setLocalProviders(newProviders);
                                        hasEditedRef.current = true;
                                    }}
                                    className="mb-4 flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
                                >
                                    <Plus size={16} /> {t.settings.embeddings.addModel}
                                </button>

                                {localProviders.filter(p => p.category === 'embedding').map((provider) => (
                                    <div key={provider.id} className="border dark:border-gray-700 rounded-lg p-4 space-y-4 relative mb-4">
                                        <div className="absolute top-4 right-4">
                                            <button
                                                onClick={() => {
                                                    if (confirm(t.settings.labels.deleteProvider + '?')) {
                                                        const newProviders = localProviders.filter(p => p.id !== provider.id);
                                                        setLocalProviders(newProviders);
                                                        hasEditedRef.current = true;
                                                    }
                                                }}
                                                className="text-red-500 hover:text-red-700 p-1"
                                                title={t.settings.labels.deleteProvider}
                                                disabled={!isAdmin}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.settings.labels.providerName}</label>
                                                <input
                                                    disabled={!isAdmin}
                                                    value={provider.name || ''}
                                                    onChange={(e) => {
                                                        hasEditedRef.current = true;
                                                        const newProviders = localProviders.map(p => p.id === provider.id ? { ...p, name: e.target.value } : p);
                                                        setLocalProviders(newProviders);
                                                    }}
                                                    className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 disabled:opacity-50"
                                                    placeholder={t.settings.placeholders.embeddingProviderExample}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.settings.labels.category}</label>
                                                <select
                                                    disabled={!isAdmin}
                                                    value={provider.category || 'chat'}
                                                    onChange={(e) => {
                                                        hasEditedRef.current = true;
                                                        const newCategory = e.target.value as any;
                                                        const newProviders = localProviders.map(p => p.id === provider.id ? { ...p, category: newCategory } : p);
                                                        setLocalProviders(newProviders);
                                                    }}
                                                    className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 disabled:opacity-50"
                                                >
                                                    <option value="chat">{t.settings.labels.categoryChat}</option>
                                                    <option value="embedding">{t.settings.labels.categoryEmbedding}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.settings.labels.provider}</label>
                                                <select
                                                    disabled={!isAdmin}
                                                    value={provider.type}
                                                    onChange={(e) => {
                                                        hasEditedRef.current = true;
                                                        const newType = e.target.value as any;
                                                        const updates: any = { type: newType };
                                                        if (newType === 'transformers') updates.baseUrl = 'http://embeddings:8080';
                                                        else if (newType === 'openai') updates.baseUrl = 'https://api.openai.com/v1';

                                                        const newProviders = localProviders.map(p => p.id === provider.id ? { ...p, ...updates } : p);
                                                        setLocalProviders(newProviders);
                                                    }}
                                                    className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 disabled:opacity-50"
                                                >
                                                    <option value="transformers">{t.settings.labels.typeTransformers}</option>
                                                    <option value="openai">OpenAI</option>
                                                    <option value="ollama">Ollama</option>
                                                    <option value="custom">{t.settings.labels.typeCustom}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.settings.labels.model}</label>
                                                <input
                                                    disabled={!isAdmin}
                                                    value={provider.model}
                                                    onChange={(e) => {
                                                        hasEditedRef.current = true;
                                                        const newProviders = localProviders.map(p => p.id === provider.id ? { ...p, model: e.target.value } : p);
                                                        setLocalProviders(newProviders);
                                                    }}
                                                    className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 disabled:opacity-50"
                                                    placeholder={t.settings.placeholders.embeddingModelExample}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.settings.labels.privacyMode}</label>
                                                <select
                                                    disabled={!isAdmin}
                                                    value={provider.privacy || 'external'}
                                                    onChange={(e) => {
                                                        hasEditedRef.current = true;
                                                        const newProviders = localProviders.map(p => p.id === provider.id ? { ...p, privacy: e.target.value as any } : p);
                                                        setLocalProviders(newProviders);
                                                    }}
                                                    className={`w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-sm disabled:opacity-50 ${provider.privacy === 'local' ? 'text-green-600 dark:text-green-400 font-medium' : 'text-orange-600 dark:text-orange-400 font-medium'}`}
                                                >
                                                    <option value="local">🏠 {t.settings.labels.privacyLocal}</option>
                                                    <option value="external">🌐 {t.settings.labels.privacyExternal}</option>
                                                </select>
                                            </div>

                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.settings.labels.baseUrl}</label>
                                                <input
                                                    disabled={!isAdmin}
                                                    value={provider.baseUrl || ''}
                                                    onChange={(e) => {
                                                        hasEditedRef.current = true;
                                                        const newProviders = localProviders.map(p => p.id === provider.id ? { ...p, baseUrl: e.target.value } : p);
                                                        setLocalProviders(newProviders);
                                                    }}
                                                    className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 disabled:opacity-50"
                                                    placeholder={t.settings.placeholders.embeddingUrlExample}
                                                />
                                            </div>
                                            {provider.type !== 'transformers' && provider.type !== 'ollama' && (
                                                <div className="col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.settings.labels.apiKey}</label>
                                                    <input
                                                        disabled={!isAdmin}
                                                        type="password"
                                                        value={provider.apiKey || ''}
                                                        onChange={(e) => {
                                                            hasEditedRef.current = true;
                                                            const newProviders = localProviders.map(p => p.id === provider.id ? { ...p, apiKey: e.target.value } : p);
                                                            setLocalProviders(newProviders);
                                                        }}
                                                        className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 disabled:opacity-50"
                                                        placeholder="sk-..."
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'tools' && (
                        <div className="space-y-6">
                            <div className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">{t.settings.tools.title}</h3>

                                <div className="mb-6">
                                    <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2 border-b dark:border-gray-700 pb-1">{t.settings.tools.drawio.title}</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.settings.tools.drawio.provider}</label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="drawioProvider"
                                                        value="cloud"
                                                        checked={drawioSettings.provider === 'cloud'}
                                                        onChange={() => setDrawioSettings({ ...drawioSettings, provider: 'cloud' })}
                                                        className="text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">{t.settings.tools.drawio.cloud}</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="drawioProvider"
                                                        value="local"
                                                        checked={drawioSettings.provider === 'local'}
                                                        onChange={() => setDrawioSettings({ ...drawioSettings, provider: 'local' })}
                                                        className="text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">{t.settings.tools.drawio.local}</span>
                                                </label>
                                            </div>
                                        </div>
                                        {drawioSettings.provider === 'local' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.settings.tools.drawio.localUrl}</label>
                                                <input
                                                    type="text"
                                                    value={drawioSettings.localUrl}
                                                    onChange={(e) => setDrawioSettings({ ...drawioSettings, localUrl: e.target.value })}
                                                    className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                                                    placeholder={t.settings.placeholders.drawioUrlExample}
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {t.settings.tools.drawio.localUrlHelp}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2 border-b dark:border-gray-700 pb-1">{t.settings.tools.searxng.title}</h4>
                                    {!isAdmin && (
                                        <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded text-xs text-blue-800 dark:text-blue-200 flex items-center gap-2 mb-2">
                                            <Shield size={14} />
                                            {t.settings.tools.searxng.adminManaged}
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.settings.labels.searxng}</label>
                                        <input
                                            disabled={!isAdmin}
                                            value={localSearxngUrl}
                                            onChange={(e) => {
                                                hasEditedRef.current = true;
                                                setLocalSearxngUrl(e.target.value);
                                            }}
                                            className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 disabled:opacity-50"
                                            placeholder={t.settings.placeholders.searxngUrlExample}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">{t.settings.labels.searxngHelp}</p>
                                    </div>
                                </div>
                            </div>


                            {/* Audio Settings Section */}
                            <div className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                    <Mic size={20} /> {t.settings.tools.audio?.title || 'Audio Transcription'}
                                </h3>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.settings.tools.audio?.providerLabel || 'Provider'}</label>
                                    <p className="text-sm text-gray-500 mb-2">{t.settings.tools.audio?.providerHelp || 'Select provider (Default: Local Whisper)'}</p>
                                    <select
                                        disabled={!isAdmin}
                                        value={settings.audioProviderId || 'default-whisper'}
                                        onChange={(e) => {
                                            if (isAdmin) {
                                                hasEditedRef.current = true;
                                                useStore.setState(state => ({
                                                    settings: { ...state.settings, audioProviderId: e.target.value }
                                                }));
                                            }
                                        }}
                                        className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 disabled:opacity-50"
                                    >
                                        {localProviders.filter(p => p.category === 'audio').map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} ({p.type})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Audio Models Management */}
                                <div>
                                    <h4 className="font-bold text-md mb-2 text-gray-800 dark:text-gray-200 border-b dark:border-gray-700 pb-1">{t.settings.tools.audio?.modelsTitle || 'Models'}</h4>
                                    <button
                                        onClick={() => {
                                            const newId = `custom-audio-${Date.now()}`;
                                            const newProvider: LLMProvider = {
                                                id: newId,
                                                name: `Audio Model ${localProviders.filter(p => p.category === 'audio').length + 1}`,
                                                // Default to custom OpenAI-compatible audio endpoint
                                                type: 'custom',
                                                baseUrl: 'https://api.openai.com/v1/audio/transcriptions',
                                                apiKey: '',
                                                model: 'whisper-1',
                                                privacy: 'external',
                                                category: 'audio'
                                            };
                                            const newProviders = [...localProviders, newProvider];
                                            setLocalProviders(newProviders);
                                            hasEditedRef.current = true;
                                        }}
                                        className="mb-4 flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                                    >
                                        <Plus size={16} /> {t.settings.tools.audio?.addProvider || 'Add Provider'}
                                    </button>

                                    {localProviders.filter(p => p.category === 'audio').map((provider) => (
                                        <div key={provider.id} className="border dark:border-gray-700 rounded-lg p-4 space-y-4 relative mb-4">
                                            <div className="absolute top-4 right-4">
                                                <button
                                                    onClick={() => {
                                                        if (confirm(t.settings.labels.deleteProvider + '?')) {
                                                            const newProviders = localProviders.filter(p => p.id !== provider.id);
                                                            setLocalProviders(newProviders);
                                                            hasEditedRef.current = true;
                                                        }
                                                    }}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                    title={t.settings.labels.deleteProvider}
                                                    disabled={!isAdmin || provider.id === 'default-whisper'} // Prevent deleting default
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.settings.labels.providerName}</label>
                                                    <input
                                                        disabled={!isAdmin}
                                                        value={provider.name || ''}
                                                        onChange={(e) => {
                                                            hasEditedRef.current = true;
                                                            const newProviders = localProviders.map(p => p.id === provider.id ? { ...p, name: e.target.value } : p);
                                                            setLocalProviders(newProviders);
                                                        }}
                                                        className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 disabled:opacity-50"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.settings.labels.provider}</label>
                                                    <select
                                                        disabled={!isAdmin}
                                                        value={provider.type}
                                                        onChange={(e) => {
                                                            hasEditedRef.current = true;
                                                            const newType = e.target.value as any;
                                                            const updates: any = { type: newType };

                                                            // Auto-configure URLs for known types
                                                            if (newType === 'openai') {
                                                                updates.baseUrl = 'https://api.openai.com/v1/audio/transcriptions';
                                                                updates.model = 'whisper-1';
                                                            } else if (newType === 'custom' && provider.id === 'default-whisper') {
                                                                updates.baseUrl = 'http://whisper:8000/v1/audio/transcriptions';
                                                            }

                                                            const newProviders = localProviders.map(p => p.id === provider.id ? { ...p, ...updates } : p);
                                                            setLocalProviders(newProviders);
                                                        }}
                                                        className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 disabled:opacity-50"
                                                    >
                                                        <option value="custom">{t.settings.labels.typeCustom}</option>
                                                        <option value="openai">OpenAI (Audio)</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.settings.labels.model}</label>
                                                    <input
                                                        disabled={!isAdmin}
                                                        value={provider.model}
                                                        onChange={(e) => {
                                                            hasEditedRef.current = true;
                                                            const newProviders = localProviders.map(p => p.id === provider.id ? { ...p, model: e.target.value } : p);
                                                            setLocalProviders(newProviders);
                                                        }}
                                                        className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 disabled:opacity-50"
                                                        placeholder="e.g. whisper-1"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.settings.labels.privacyMode}</label>
                                                    <select
                                                        disabled={!isAdmin}
                                                        value={provider.privacy || 'external'}
                                                        onChange={(e) => {
                                                            hasEditedRef.current = true;
                                                            const newProviders = localProviders.map(p => p.id === provider.id ? { ...p, privacy: e.target.value as any } : p);
                                                            setLocalProviders(newProviders);
                                                        }}
                                                        className={`w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-sm disabled:opacity-50 ${provider.privacy === 'local' ? 'text-green-600 dark:text-green-400 font-medium' : 'text-orange-600 dark:text-orange-400 font-medium'}`}
                                                    >
                                                        <option value="local">🏠 {t.settings.labels.privacyLocal}</option>
                                                        <option value="external">🌐 {t.settings.labels.privacyExternal}</option>
                                                    </select>
                                                </div>


                                                <div className="col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.settings.labels.baseUrl}</label>
                                                    <input
                                                        disabled={!isAdmin}
                                                        value={provider.baseUrl || ''}
                                                        onChange={(e) => {
                                                            hasEditedRef.current = true;
                                                            const newProviders = localProviders.map(p => p.id === provider.id ? { ...p, baseUrl: e.target.value } : p);
                                                            setLocalProviders(newProviders);
                                                        }}
                                                        className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 disabled:opacity-50"
                                                        placeholder="http://..."
                                                    />
                                                </div>

                                                {provider.type !== 'ollama' && provider.id !== 'default-whisper' && (
                                                    <div className="col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.settings.labels.apiKey}</label>
                                                        <input
                                                            disabled={!isAdmin}
                                                            type="password"
                                                            value={provider.apiKey || ''}
                                                            onChange={(e) => {
                                                                hasEditedRef.current = true;
                                                                const newProviders = localProviders.map(p => p.id === provider.id ? { ...p, apiKey: e.target.value } : p);
                                                                setLocalProviders(newProviders);
                                                            }}
                                                            className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 disabled:opacity-50"
                                                            placeholder="sk-..."
                                                        />
                                                    </div>
                                                )}

                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>


                        </div>
                    )}



                    {activeTab === 'users' && isAdmin && (
                        <UserManagement />
                    )}

                    {activeTab === 'info' && (
                        <div className="space-y-6">
                            {/* Application Info */}
                            <div className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{t.settings.info.appInfo}</h3>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">{t.settings.info.appName}:</div>
                                        <div className="col-span-2 text-sm font-medium text-gray-800 dark:text-gray-200">Licium</div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">{t.settings.info.license}:</div>
                                        <div className="col-span-2 text-sm font-medium text-gray-800 dark:text-gray-200">Apache 2.0</div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">{t.settings.info.copyright}:</div>
                                        <div className="col-span-2 text-sm font-medium text-gray-800 dark:text-gray-200">© 2025 Natorus87</div>
                                    </div>
                                </div>
                            </div>

                            {/* Version Info */}
                            <div className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{t.settings.info.versions}</h3>
                                {systemInfoLoading ? (
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{t.settings.info.loading}</div>
                                ) : systemInfo ? (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="text-sm text-gray-600 dark:text-gray-400">{t.settings.info.frontendVersion}:</div>
                                            <div className="col-span-2 text-sm font-medium text-gray-800 dark:text-gray-200">{packageJson.version}</div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="text-sm text-gray-600 dark:text-gray-400">{t.settings.info.backendVersion}:</div>
                                            <div className="col-span-2 text-sm font-medium text-gray-800 dark:text-gray-200">{systemInfo.backend.version}</div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="text-sm text-gray-600 dark:text-gray-400">{t.settings.info.buildDate}:</div>
                                            <div className="col-span-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                                                {systemInfo.backend.buildDate !== 'Development'
                                                    ? new Date(systemInfo.backend.buildDate).toLocaleString(language)
                                                    : systemInfo.backend.buildDate
                                                }
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-red-600 dark:text-red-400">{t.settings.info.error}</div>
                                )}
                            </div>

                            {/* System Info */}
                            {systemInfo && (
                                <div className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{t.settings.info.systemInfo}</h3>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="text-sm text-gray-600 dark:text-gray-400">{t.settings.info.nodeVersion}:</div>
                                            <div className="col-span-2 text-sm font-medium text-gray-800 dark:text-gray-200">{systemInfo.backend.nodeVersion}</div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="text-sm text-gray-600 dark:text-gray-400">{t.settings.info.databaseStatus}:</div>
                                            <div className="col-span-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                                                <span className={systemInfo.database.status === 'connected' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                    {systemInfo.database.status === 'connected' ? t.settings.info.connected : t.settings.info.disconnected}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="text-sm text-gray-600 dark:text-gray-400">{t.settings.info.serverUptime}:</div>
                                            <div className="col-span-2 text-sm font-medium text-gray-800 dark:text-gray-200">{systemInfo.backend.uptime}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Links */}
                            <div className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{t.settings.info.links}</h3>
                                <div className="space-y-2">
                                    <a
                                        href="https://github.com/natorus87/licium"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline block"
                                    >
                                        {t.settings.info.repository}
                                    </a>
                                    <a
                                        href="https://github.com/natorus87/licium/blob/main/README.md"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline block"
                                    >
                                        {t.settings.info.documentation}
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-2 bg-gray-50 dark:bg-gray-800 items-center">
                    {saveStatus && (
                        <span className={`text-sm mr-4 ${saveStatus.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {saveStatus.message}
                        </span>
                    )}
                    <button
                        onClick={toggleSettings}
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                        {t.general.close}
                    </button>
                    {(activeTab === 'llm' || activeTab === 'embeddings' || activeTab === 'tools') && isAdmin && (
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded"
                        >
                            <Save size={18} /> {t.settings.labels.saveGlobal}
                        </button>
                    )}
                </div>
            </div >
        </div>
    );
};
