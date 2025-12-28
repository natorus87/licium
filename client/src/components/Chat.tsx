import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Send, Trash2, Mic, RefreshCw, Database, Globe, FileText, Plus, ShieldAlert, Shield, Sparkles, List, CheckSquare, Baby, Book, Table, Edit2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { translations } from '../i18n/translations';
import { AudioRecorder } from './AudioRecorder';

export const Chat: React.FC = () => {
    const { chatMessages, sendChatMessage, isLoadingChat, selectedNoteContent, updateNoteContent, openModal, language, customPrompts, addCustomPrompt, updateCustomPrompt, removeCustomPrompt, settings, setActiveProvider } = useStore();
    const t = translations[language];

    const [input, setInput] = useState('');
    const [useSearch, setUseSearch] = useState(false);
    const [useContext, setUseContext] = useState(false);
    const [includeNoteContent, setIncludeNoteContent] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState(0);
    const [showRecorder, setShowRecorder] = useState(false);

    // Pagination State (Responsive)
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth < 768 ? 4 : 6;
        }
        return 6;
    });

    useEffect(() => {
        const handleResize = () => {
            setItemsPerPage(window.innerWidth < 768 ? 4 : 6);
        };
        handleResize(); // Ensure correct state on mount (though lazy init handles most)
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const activeProvider = settings.providers.find(p => p.id === settings.activeProviderId);
    const isLocalPrivacy = activeProvider?.privacy === 'local';
    const showPrivacyWarning = useSearch || !isLocalPrivacy;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const msg = input;
        setInput('');
        await sendChatMessage(msg, 'chat', useSearch, useContext, includeNoteContent);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleAction = async (mode: string, promptText: string, label?: string) => {
        await sendChatMessage(promptText, mode as any, false, false, includeNoteContent, label);
    };

    const handleApplyContent = (content: string) => {
        openModal({
            type: 'confirm',
            title: 'Notizinhalt ersetzen',
            message: 'Sind Sie sicher, dass Sie den aktuellen Notizinhalt durch diesen Text ersetzen möchten?',
            onConfirm: () => {
                updateNoteContent(content);
            }
        });
    };

    const handleAppendContent = (content: string) => {
        const currentContent = selectedNoteContent || '';
        const separator = currentContent.trim() ? '\n\n' : '';
        updateNoteContent(currentContent + separator + content);
    };

    const handleAddPrompt = () => {
        openModal({
            type: 'prompt',
            title: t.chat.customPrompts.modalTitle,
            message: t.chat.customPrompts.modalMessage,
            fields: [
                { name: 'label', label: 'Label', placeholder: 'z.B. Übersetzen', value: '' },
                { name: 'prompt', label: 'Prompt', placeholder: 'z.B. Übersetze dies ins Englische:', value: '', type: 'textarea' }
            ],
            onConfirm: (val) => {
                if (!val || typeof val === 'string') return;
                const { label, prompt } = val;
                if (!label || !prompt) return;
                addCustomPrompt(label, prompt);
            }
        });
    };

    const handleEditPrompt = (index: number, currentLabel: string, currentPrompt: string) => {
        openModal({
            type: 'prompt',
            title: t.chat.customPrompts.modalTitleEdit,
            message: t.chat.customPrompts.modalMessage,
            fields: [
                { name: 'label', label: 'Label', placeholder: 'Label', value: currentLabel },
                { name: 'prompt', label: 'Prompt', placeholder: 'Prompt', value: currentPrompt, type: 'textarea' }
            ],
            onConfirm: (val) => {
                if (!val || typeof val === 'string') return;
                const { label, prompt } = val;
                if (!label || !prompt) return;
                updateCustomPrompt(index, label, prompt);
            }
        });
    };

    const handleClearChat = () => {
        openModal({
            type: 'confirm',
            title: t.chat.clearHistory,
            message: t.chat.clearHistory + '? ' + (t.chat.confirmClearMessage || 'Sind Sie sicher, dass Sie den gesamten Verlauf löschen möchten?'),
            onConfirm: () => {
                useStore.getState().clearChat();
            }
        });
    };

    const defaultActions = [
        { id: 'summarize', label: t.chat.actions.summarize.label, prompt: t.chat.actions.summarize.prompt, icon: FileText },
        { id: 'rewrite', label: t.chat.actions.rewrite.label, prompt: t.chat.actions.rewrite.prompt, icon: RefreshCw },
        { id: 'structure', label: t.chat.actions.structure.label, prompt: t.chat.actions.structure.prompt, icon: List },
        { id: 'keyPoints', label: t.chat.actions.keyPoints.label, prompt: t.chat.actions.keyPoints.prompt, icon: List },
        { id: 'spelling', label: t.chat.actions.spelling.label, prompt: t.chat.actions.spelling.prompt, icon: CheckSquare },
        { id: 'eli5', label: t.chat.actions.eli5.label, prompt: t.chat.actions.eli5.prompt, icon: Baby },
        { id: 'glossary', label: t.chat.actions.glossary.label, prompt: t.chat.actions.glossary.prompt, icon: Book },
        { id: 'table', label: t.chat.actions.table.label, prompt: t.chat.actions.table.prompt, icon: Table },
    ];

    const allActions = [
        ...defaultActions,
        ...customPrompts.map((p, i) => ({ ...p, id: `custom-${i}`, icon: Sparkles, isCustom: true, index: i }))
    ];

    const totalItems = allActions.length + 1; // +1 for Add Button
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    useEffect(() => {
        if (page >= totalPages && totalPages > 0) setPage(totalPages - 1);
        else if (totalPages === 0 && page !== 0) setPage(0);
    }, [totalPages, page]);

    const startIndex = page * itemsPerPage;
    const currentActions = allActions.slice(startIndex, startIndex + itemsPerPage);

    const addButtonIndex = allActions.length;
    const showAddButton = addButtonIndex >= startIndex && addButtonIndex < startIndex + itemsPerPage;

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-l dark:border-gray-700">
            {showRecorder && (
                <AudioRecorder
                    language={language}
                    t={t.audio}
                    onTranscriptionComplete={(text) => setInput(prev => prev + (prev ? ' ' : '') + text)}
                    onClose={() => setShowRecorder(false)}
                />
            )}

            {/* Header Row */}
            <div className="h-[46px] px-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold text-gray-700 dark:text-gray-300 text-xs flex justify-between items-center group">
                <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
                    <span className="shrink-0">{t.chat.title}</span>
                    <div className="flex-1 max-w-[140px]">
                        <select
                            value={settings.activeProviderId}
                            onChange={(e) => setActiveProvider(e.target.value)}
                            className="w-full bg-transparent border-none text-xs font-normal focus:ring-0 truncate cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 rounded px-1 py-0"
                            title={t.settings.labels.selectModel}
                        >
                            {settings.providers.filter(p => !p.category || p.category === 'chat').map(p => (
                                <option key={p.id} value={p.id} className="text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800">
                                    {p.name || p.model || p.type}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setIncludeNoteContent(!includeNoteContent)}
                        className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${includeNoteContent ? 'text-blue-500' : 'text-gray-400 opacity-50'}`}
                        title={includeNoteContent ? "Kontext aktiv" : "Kontext inaktiv"}
                    >
                        <FileText size={18} />
                    </button>
                    <button
                        onClick={handleClearChat}
                        className="p-1 text-gray-500 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        title={t.chat.clearHistory}
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Privacy Box */}
            <div className={`h-[46px] px-2 border-b dark:border-gray-700 flex items-center gap-2 text-xs transition-colors ${showPrivacyWarning ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300' : 'bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400'}`}>
                {showPrivacyWarning ? <ShieldAlert size={14} className="shrink-0" /> : <Shield size={14} className="shrink-0" />}
                <div className="flex-1 overflow-hidden">
                    <span className="font-medium truncate block">
                        {useSearch ? (t.chat.privacyNotice?.searchActive || 'Web Search Active') :
                            !isLocalPrivacy ? (t.chat.privacyNotice?.privacyWarning || 'External AI Model') :
                                (t.chat.privacyNotice?.localMode || 'Local AI Mode')}
                    </span>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
                {chatMessages.length === 0 && (
                    <div className="text-center text-gray-400 dark:text-gray-500 mt-10 text-sm">
                        <Sparkles className="mx-auto mb-2" />
                        {t.chat.emptyState}
                    </div>
                )}
                {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div
                            className={`max-w-[90%] rounded-lg p-3 text-sm ${msg.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                                }`}
                            title={msg.role === 'user' && msg.label ? msg.content : undefined}
                        >
                            {msg.role === 'assistant' ? (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                </div>
                            ) : (
                                msg.label || msg.content
                            )}
                        </div>
                        {msg.role === 'assistant' && (
                            <div className="flex gap-3 mt-1 ml-1">
                                <button
                                    onClick={() => handleApplyContent(msg.content)}
                                    className="text-xs text-blue-500 hover:underline"
                                    title={t.chat.buttons.replace}
                                >
                                    {t.chat.buttons.replace}
                                </button>
                                <button
                                    onClick={() => handleAppendContent(msg.content)}
                                    className="text-xs text-green-600 hover:underline"
                                    title={t.chat.buttons.append}
                                >
                                    {t.chat.buttons.append}
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                {isLoadingChat && (
                    <div className="flex items-center gap-1 p-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot"></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="p-2 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="grid grid-cols-2 gap-2 mb-2">
                    {currentActions.map((action: any) => (
                        <div key={action.id} className="relative group">
                            <button
                                onClick={() => handleAction('chat', action.prompt, action.label)}
                                className="w-full flex items-center justify-center gap-1 text-xs bg-white dark:bg-gray-700 border dark:border-gray-600 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 h-8"
                                disabled={!selectedNoteContent}
                                title={action.prompt}
                            >
                                <action.icon size={12} /> <span className="truncate max-w-[100px]">{action.label}</span>
                            </button>
                            {action.isCustom && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm(t.chat.customPrompts.confirmDelete)) {
                                            removeCustomPrompt(action.index);
                                        }
                                    }}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
                                    title={t.chat.customPrompts.delete}
                                >
                                    &times;
                                </button>
                            )}
                            {action.isCustom && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditPrompt(action.index, action.label, action.prompt);
                                    }}
                                    className="absolute -top-1 right-4 bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
                                    title={t.chat.customPrompts.edit}
                                >
                                    <Edit2 size={8} />
                                </button>
                            )}
                        </div>
                    ))}

                    {showAddButton && (
                        <button
                            onClick={handleAddPrompt}
                            className="flex items-center justify-center gap-1 text-xs border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 h-8"
                            title={t.chat.customPrompts.modalTitle}
                        >
                            <Plus size={12} /> {t.chat.customPrompts.add}
                        </button>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full disabled:opacity-30 transition-colors"
                            aria-label="Previous Page"
                        >
                            &lt;
                        </button>
                        <span className="font-medium">{page + 1} / {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page === totalPages - 1}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full disabled:opacity-30 transition-colors"
                            aria-label="Next Page"
                        >
                            &gt;
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-2 pb-2 border-t flex gap-2 items-center bg-white dark:bg-gray-900">
                <button
                    onClick={() => setUseSearch(!useSearch)}
                    className={`p-2 rounded ${useSearch ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    title={useSearch ? "Websuche aktiv" : "Websuche aktivieren"}
                >
                    <Globe size={18} />
                </button>
                <button
                    onClick={() => setUseContext(!useContext)}
                    className={`p-2 rounded ${useContext ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    title={useContext ? "Kontext aus Notizen aktiv" : "Kontext aus Notizen aktivieren"}
                >
                    <Database size={18} />
                </button>
                <input
                    className="flex-1 border dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t.chat.placeholder}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoadingChat}
                />
                <button
                    onClick={() => setShowRecorder(true)}
                    className="bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                    title={t.audio?.title || 'Audio Recording'}
                >
                    <Mic size={18} />
                </button>
                <button
                    onClick={handleSend}
                    disabled={isLoadingChat || !input.trim()}
                    className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};
