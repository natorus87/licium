import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Mic, Square, Loader, Hourglass } from 'lucide-react';
import axios from 'axios';
import type { Translations } from '../i18n/translations';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface AudioRecorderProps {
    onTranscriptionComplete: (text: string) => void;
    onClose: () => void;
    language: string;
    t: Translations['audio'];
}

export function AudioRecorder({ onTranscriptionComplete, onClose, language, t }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [modelStatus, setModelStatus] = useState<'loading' | 'ready' | 'error'>('loading');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        // Check Model Status being ready
        const checkStatus = async () => {
            try {
                const res = await axios.get(`${API_URL}/status/whisper`, { withCredentials: true });
                if (res.data.status === 'ready') {
                    setModelStatus('ready');
                } else {
                    // Retry after delay
                    setTimeout(checkStatus, 3000);
                }
            } catch (e) {
                console.error("Status check failed", e);
                // Also retry on error (service might be starting)
                setTimeout(checkStatus, 3000);
            }
        };

        checkStatus();
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                await transcribeAudio(audioBlob);

                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Could not access microphone');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsProcessing(true);
        }
    };

    const transcribeAudio = async (blob: Blob) => {
        try {
            const formData = new FormData();
            formData.append('file', blob, 'recording.webm');
            formData.append('language', language);

            const settings = useStore.getState().settings;
            const activeProvider = settings.providers.find(p => p.id === (settings.audioProviderId || 'default-whisper'));

            const response = await fetch(`${API_URL}/transcribe`, {
                method: 'POST',
                body: formData,
                headers: {
                    'x-audio-config': JSON.stringify(activeProvider || {})
                },
                credentials: 'include', // Ensure session cookies are sent
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error("No readable stream");

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // Append new chunk to buffer
                buffer += decoder.decode(value, { stream: true });

                // Process complete messages (delimited by \n\n)
                const parts = buffer.split('\n\n');
                // The last part might be incomplete, keep it in buffer
                buffer = parts.pop() || '';

                for (const part of parts) {
                    if (part.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(part.substring(6));
                            if (data.status === 'processing') {
                                console.log('Backend processing...');
                            } else if (data.status === 'complete') {
                                if (data.text) {
                                    onTranscriptionComplete(data.text);
                                }
                            } else if (data.status === 'error') {
                                throw new Error(data.error || 'Transcription failed');
                            }
                        } catch (e) {
                            console.warn('Failed to parse SSE message', e);
                        }
                    }
                }
            }

            // Flush any remaining buffer (though SSE usually ends with \n\n)
            if (buffer.startsWith('data: ')) {
                try {
                    const data = JSON.parse(buffer.substring(6));
                    if (data.status === 'complete' && data.text) {
                        onTranscriptionComplete(data.text);
                    }
                } catch (e) { }
            }

        } catch (error) {
            console.error('Transcription failed:', error);
            alert('Transcription failed');
        } finally {
            setIsProcessing(false);
            onClose();
        }
    };

    const handleToggle = () => {
        if (modelStatus !== 'ready') return;

        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="text-xl font-semibold text-gray-800 dark:text-white">
                    {modelStatus === 'loading' ? t.loading :
                        isProcessing ? t.processing :
                            isRecording ? t.recording :
                                t.clickToRecord}
                </div>

                <div className="relative">
                    <button
                        onClick={handleToggle}
                        disabled={isProcessing || modelStatus === 'loading'}
                        className={`
                            w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300
                            ${modelStatus === 'loading'
                                ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed opacity-75'
                                : isProcessing
                                    ? 'bg-gray-100 dark:bg-gray-700 cursor-wait'
                                    : isRecording
                                        ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse'
                                        : 'bg-blue-500 hover:bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.5)]'
                            }
                        `}
                    >
                        {modelStatus === 'loading' ? (
                            <Hourglass size={40} className="text-gray-500 dark:text-gray-400 animate-pulse" />
                        ) : isProcessing ? (
                            <Loader size={40} className="text-gray-500 dark:text-gray-400 animate-spin" />
                        ) : isRecording ? (
                            <Square size={40} className="text-white fill-current" />
                        ) : (
                            <Mic size={40} className="text-white" />
                        )}
                    </button>

                    {/* Status Indicator Dot */}
                    {modelStatus === 'loading' && (
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                    )}
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {modelStatus === 'loading'
                        ? t.loadingMessage
                        : isProcessing
                            ? t.sending
                            : isRecording
                                ? t.clickToStop
                                : t.tapToStart
                    }
                </p>

                {modelStatus === 'loading' && (
                    <div className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
                        {t.coldStart}
                    </div>
                )}
            </div>
        </div>
    );
}
