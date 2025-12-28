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
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full ${modal.fields ? 'max-w-xl' : 'max-w-md'} overflow-hidden animate-in fade-in zoom-in duration-200`}>
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{modal.title}</h3>
                    <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4">
                    {modal.message && (
                        <p className="text-gray-600 dark:text-gray-300 mb-4">{modal.message}</p>
                    )}

                    {modal.type === 'prompt' && !modal.fields && (
                        <input
                            ref={inputRef}
                            type="text"
                            className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    )}

                    {modal.type === 'prompt' && modal.fields && (
                        <div className="space-y-4">
                            {modal.fields.map((field, idx) => (
                                <div key={field.name}>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {field.label}
                                    </label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            ref={idx === 0 ? (inputRef as any) : null}
                                            className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                            placeholder={field.placeholder}
                                            value={fieldValues[field.name] || ''}
                                            onChange={(e) => setFieldValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                                            onKeyDown={handleKeyDown}
                                        />
                                    ) : (
                                        <input
                                            ref={idx === 0 ? inputRef : null}
                                            type="text"
                                            className="w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-2 bg-gray-50 dark:bg-gray-800/50">
                    {modal.type !== 'alert' && (
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                            {t.general.cancel}
                        </button>
                    )}
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded"
                    >
                        {modal.type === 'alert' ? 'OK' : t.general.confirm}
                    </button>
                </div>
            </div>
        </div>
    );
};
