import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { X } from 'lucide-react';

import { translations } from '../i18n/translations';

export const ModalManager: React.FC = () => {
    const { modal, closeModal, language } = useStore();
    const t = translations[language];
    const [inputValue, setInputValue] = useState('');
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (modal.isOpen) {
            setInputValue(modal.inputValue || '');
            if (modal.fields) {
                const initialValues: Record<string, string> = {};
                modal.fields.forEach(f => {
                    initialValues[f.name] = f.value || '';
                });
                setFieldValues(initialValues);
            }
            // Focus input if prompt
            if (modal.type === 'prompt') {
                setTimeout(() => inputRef.current?.focus(), 100);
            }
        }
    }, [modal.isOpen, modal.inputValue, modal.type, modal.fields]);

    if (!modal.isOpen) return null;

    const handleConfirm = () => {
        if (modal.type === 'prompt') {
            if (modal.fields) {
                modal.onConfirm(fieldValues);
            } else {
                modal.onConfirm(inputValue);
            }
        } else {
            modal.onConfirm();
        }
        closeModal();
    };

    const handleCancel = () => {
        modal.onCancel();
        closeModal();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            // Only confirm on Enter if it's not a textarea
            const isTextarea = (e.target as HTMLElement).tagName === 'TEXTAREA';
            if (!isTextarea) {
                handleConfirm();
            }
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className={`bg-white dark:bg-[#151a24] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full ${modal.fields ? 'max-w-xl' : 'max-w-md'} overflow-hidden animate-in fade-in zoom-in duration-200`}>
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-[#1e2430]/50 backdrop-blur-sm">
                    <h3 className="font-display font-bold text-lg text-gray-900 dark:text-gray-100 tracking-tight">{modal.title}</h3>
                    <button onClick={handleCancel} className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-800 rounded-xl transition-all press-effect">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {modal.message && (
                        <p className="text-gray-600 dark:text-gray-300 mb-6 font-medium leading-relaxed">{modal.message}</p>
                    )}

                    {modal.type === 'prompt' && !modal.fields && (
                        <input
                            ref={inputRef}
                            type="text"
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white dark:bg-[#1e2430] text-gray-900 dark:text-gray-100 placeholder-gray-400 shadow-sm transition-all outline-none"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    )}

                    {modal.type === 'prompt' && modal.fields && (
                        <div className="space-y-5">
                            {modal.fields.map((field, idx) => (
                                <div key={field.name}>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                                        {field.label}
                                    </label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            ref={idx === 0 ? (inputRef as any) : null}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white dark:bg-[#1e2430] text-gray-900 dark:text-gray-100 placeholder-gray-400 shadow-sm transition-all outline-none min-h-[120px] resize-y"
                                            placeholder={field.placeholder}
                                            value={fieldValues[field.name] || ''}
                                            onChange={(e) => setFieldValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                                            onKeyDown={handleKeyDown}
                                        />
                                    ) : (
                                        <input
                                            ref={idx === 0 ? inputRef : null}
                                            type="text"
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white dark:bg-[#1e2430] text-gray-900 dark:text-gray-100 placeholder-gray-400 shadow-sm transition-all outline-none"
                                            placeholder={field.placeholder}
                                            value={fieldValues[field.name] || ''}
                                            onChange={(e) => setFieldValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                                            onKeyDown={handleKeyDown}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-[#1e2430]/50 items-center backdrop-blur-sm">
                    {modal.type !== 'alert' && (
                        <button
                            onClick={handleCancel}
                            className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-[#151a24] hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl transition-all shadow-sm"
                        >
                            {t.general.cancel}
                        </button>
                    )}
                    <button
                        onClick={handleConfirm}
                        className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all press-effect min-w-[100px]"
                    >
                        {modal.type === 'alert' ? 'OK' : t.general.confirm}
                    </button>
                </div>
            </div>
        </div>
    );
};
