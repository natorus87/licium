import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import '@licium/editor/dist/toastui-editor.css';
import '@licium/editor/dist/theme/toastui-editor-dark.css';
import '@licium/editor/dist/i18n/de-de';
import { Editor as ToastEditor } from '@licium/react-editor';
import { useStore } from '../store';
import { translations } from '../i18n/translations';
import { UploadCloud, Download, Clock, RotateCcw, Mic, Workflow, Save, MoreVertical } from 'lucide-react';
import { AudioRecorder } from './AudioRecorder';
// Syntax Highlighting
import codeSyntaxHighlight from '@licium/editor-plugin-code-syntax-highlight';
import '@licium/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css';
import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';

// Prism Languages
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-docker';

// Additional Plugins
import chart from '@licium/editor-plugin-chart';
import uml from '@licium/editor-plugin-uml';
import tableMergedCell from '@licium/editor-plugin-table-merged-cell';
import colorSyntax from '@licium/editor-plugin-color-syntax';
import details from '@licium/editor-plugin-details';
import textAlignSimpel from '@licium/editor-plugin-text-align-simpel';
import emoji from '@licium/editor-plugin-emoji';
import highlight from '@licium/editor-plugin-highlight/dist/toastui-editor-plugin-highlight.js';

import 'tui-color-picker/dist/tui-color-picker.css';
import '@licium/editor-plugin-color-syntax/dist/toastui-editor-plugin-color-syntax.css';
import '@licium/editor-plugin-text-align-simpel/dist/toastui-editor-plugin-text-align-simpel.css';
import '@licium/editor-plugin-emoji/dist/toastui-editor-plugin-emoji.css';
import '@licium/editor-plugin-details/dist/toastui-editor-plugin-details.css';
import '@licium/editor-plugin-table-merged-cell/dist/toastui-editor-plugin-table-merged-cell.css';
import '@licium/editor-plugin-highlight/dist/toastui-editor-plugin-highlight.css';


export const Editor: React.FC = () => {
    const selectedNoteId = useStore(state => state.selectedNoteId);
    const selectedNoteContent = useStore(state => state.selectedNoteContent);
    const selectedNoteTitle = useStore(state => state.selectedNoteTitle);
    const saveNoteContent = useStore(state => state.saveNoteContent);
    const updateNoteContent = useStore(state => state.updateNoteContent);
    const isSaving = useStore(state => state.isSaving);
    const lastSaved = useStore(state => state.lastSaved);
    const saveError = useStore(state => state.saveError);
    const language = useStore(state => state.language);
    const darkMode = useStore(state => state.darkMode);
    const t = translations[language];

    const editorRef = useRef<ToastEditor>(null);
    const currentNoteIdRef = useRef<string | null>(null);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isInternalUpdate = useRef(false); // Recursion guard
    const drawioSettings = useStore(state => state.drawioSettings);

    // ... (rest of refs/state)

    const [isDrawioOpen, setIsDrawioOpen] = useState(false);
    const [currentDiagramXml, setCurrentDiagramXml] = useState<string | null>(null);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Stats State
    const [stats, setStats] = useState({ words: 0, chars: 0 });

    // Audio Recorder State
    const [showRecorder, setShowRecorder] = useState(false);
    const handleTranscription = (text: string) => {
        if (!text) return;

        // Clear any pending autosave to prevent race condition
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }

        const editorInstance = editorRef.current?.getInstance();
        if (editorInstance) {
            // Mark as internal update to prevent handleChange from triggering another save loop immediately
            isInternalUpdate.current = true;

            editorInstance.insertText('\n' + text);

            // Force immediate sync with store and backend
            const newContent = editorInstance.getMarkdown();

            // 1. Update global store state
            updateNoteContent(newContent);

            // 2. Persist to backend immediately
            saveNoteContent(undefined, newContent);
        }
    };


    // Close export menu on click outside
    useEffect(() => {
        const closeMenu = () => setIsExportMenuOpen(false);
        if (isExportMenuOpen) document.addEventListener('click', closeMenu);
        return () => document.removeEventListener('click', closeMenu);
    }, [isExportMenuOpen]);

    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historyVersions, setHistoryVersions] = useState<{ id: number; created_at: string }[]>([]);
    const fetchNoteVersions = useStore(state => state.fetchNoteVersions);
    const restoreNoteVersion = useStore(state => state.restoreNoteVersion);
    const openModal = useStore(state => state.openModal);

    const openHistoryModal = async () => {
        if (!selectedNoteId) return;
        const versions = await fetchNoteVersions(selectedNoteId);
        setHistoryVersions(versions);
        setIsHistoryModalOpen(true);
    };

    const handleRestore = (versionId: number) => {
        if (!selectedNoteId) return;

        openModal({
            type: 'confirm',
            title: t.editor.restore,
            message: t.editor.restoreConfirm,
            onConfirm: async () => {
                const success = await restoreNoteVersion(selectedNoteId, versionId);
                if (success) {
                    setIsHistoryModalOpen(false);
                } else {
                    // Optionally show error modal
                }
            }
        });
    };


    const handleExport = (type: 'md' | 'txt' | 'pdf') => {
        const editorInstance = editorRef.current?.getInstance();
        if (!editorInstance) return;
        const markdown = editorInstance.getMarkdown();

        if (type === 'pdf') {
            const html = editorInstance.getHTML();

            // Create a hidden iframe
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            document.body.appendChild(iframe);

            const doc = iframe.contentWindow?.document;
            if (!doc) return;

            // Basic HTML structure
            doc.open();
            const safeTitle = selectedNoteTitle || 'Print';
            doc.write('<!DOCTYPE html><html><head><title>' + safeTitle + '</title></head><body><div class="prose prose-sm max-w-none">' + html + '</div></body></html>');
            doc.close();

            // Copy styles from main document to iframe
            // This ensures Tailwind and other styles are available
            const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
            styles.forEach(style => {
                doc.head.appendChild(style.cloneNode(true));
            });

            // Wait for resources/styles to apply then print
            setTimeout(() => {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();

                // Remove iframe after printing (give it some time)
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 1000);
            }, 500);

        } else {
            const blob = new Blob([markdown], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `licium-note-${new Date().toISOString().slice(0, 10)}.${type}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };


    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, visible: boolean, target: HTMLElement | null, type: 'image' | 'youtube' | null }>({
        x: 0,
        y: 0,
        visible: false,
        target: null,
        type: null
    });

    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Check if Image and inside Editor
            if (target.tagName === 'IMG' && target.closest('.toastui-editor-defaultUI')) {
                e.preventDefault();
                setContextMenu({
                    x: e.clientX,
                    y: e.clientY,
                    visible: true,
                    target: target as HTMLImageElement,
                    type: 'image'
                });
            }
            // Check if YouTube Widget (click on the wrapper or overlay? iframe usually eats events)
            // ToastUI widgets are wrapped in div. 
            // If the user clicks on the padding/border of the widget div:
            else if (target.closest('.youtube-widget') && target.closest('.toastui-editor-defaultUI')) {
                e.preventDefault();
                const widgetFn = target.closest('.youtube-widget') as HTMLElement;
                setContextMenu({
                    x: e.clientX,
                    y: e.clientY,
                    visible: true,
                    target: widgetFn,
                    type: 'youtube'
                });
            }
            else {
                setContextMenu(prev => ({ ...prev, visible: false }));
            }
        };

        const handleClick = () => setContextMenu(prev => ({ ...prev, visible: false }));

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('click', handleClick);
        };
    }, []);


    // Alignment Plugin Definition
    // Alignment Plugin Definition




    const alignWidget = (alignment: 'left' | 'center' | 'right') => {
        if (!contextMenu.target || contextMenu.type !== 'youtube') return;
        const editorInstance = editorRef.current?.getInstance();
        if (!editorInstance) return;

        console.log(`[Editor] Aligning widget to ${alignment}`);

        // We need to find the markdown corresponding to this widget.
        // The widget is rendered from `[youtube](url)` or `[youtube|align](url)`.
        // Or via the raw URL rule.

        // Since we don't have a direct mapping from DOM node to Markdown position easily exposed,
        // we'll try to find the URL in the text.

        // Strategy:
        // 1. Get iframe src from the widget.
        // 2. Extract video ID.
        // 3. Regex match the markdown that contains this video ID.

        const iframe = contextMenu.target.querySelector('iframe');
        if (!iframe) return;
        const src = iframe.src;
        const idMatch = src.match(/\/embed\/([^?]+)/);
        if (!idMatch) return;
        const videoId = idMatch[1];

        const currentMarkdown = editorInstance.getMarkdown();

        // Regex to find the link.
        // We look for [youtube...](...videoId...) OR raw url containing videoId

        // Escape videoId just in case
        const safeId = videoId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Match existing markup: [youtube|?alignment?](...videoId...)
        const markupRegex = new RegExp(`\\[youtube(?:\\|(?:left|center|right))?\\]\\((https?:\\/\\/(?:www\\.)?(?:youtube\\.com|youtu\\.be)\\/[^)]*${safeId}[^)]*)\\)`, 'i');

        // Match raw URL: https://...videoId...
        const rawRegex = new RegExp(`(^|\\s)(https?:\\/\\/(?:www\\.)?(?:youtube\\.com\\/watch\\?v=|youtu\\.be\\/)${safeId}[^\\s]*)`, 'm');

        let newMarkdown = currentMarkdown;
        let matched = false;

        // Try replacing Markup first
        if (markupRegex.test(currentMarkdown)) {
            newMarkdown = currentMarkdown.replace(markupRegex, (_match: string, url: string) => {
                matched = true;
                return `[youtube|${alignment}](${url})`;
            });
        }
        // Try converting Raw URL if no markup found
        else if (rawRegex.test(currentMarkdown)) {
            newMarkdown = currentMarkdown.replace(rawRegex, (_match: string, prefix: string, url: string) => {
                matched = true;
                return `${prefix}[youtube|${alignment}](${url})`;
            });
        }

        if (matched && newMarkdown !== currentMarkdown) {
            // Guard against infinite loop if we were still using onChange, but we aren't for this triggered action.
            isInternalUpdate.current = true;
            editorInstance.setMarkdown(newMarkdown);
        }
    };

    const resizeImage = (size: 's' | 'm' | 'l' | 'original') => {
        if (!contextMenu.target) return;

        const editorInstance = editorRef.current?.getInstance();
        if (!editorInstance) return;

        console.log('[Editor] Resizing image via Markdown Replacement (Forced)');

        // Use Markdown Search & Replace exclusively
        // This is the most reliable way to ensure the alt text update persists and triggers the CSS.
        const currentMarkdown = editorInstance.getMarkdown();
        const targetSrc = contextMenu.target.getAttribute('src');
        const targetAlt = contextMenu.target.getAttribute('alt') || '';

        if (targetSrc) {
            try {
                // Strategy 1: strict match with decoded URI
                const decodedSrc = decodeURIComponent(targetSrc);

                // Helper to escape regex
                const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                // Different candidates for the src to search for
                // 1. The literal attribute value from DOM
                // 2. The decoded value
                // 3. Relative version (if absolute)
                // 4. Filename only (risky but fallback)

                const srcCandidates = [targetSrc, decodedSrc];

                try {
                    const urlObj = new URL(targetSrc, window.location.href);
                    // Add path only (e.g. /uploads/img.png)
                    srcCandidates.push(urlObj.pathname);
                    // Add relative path (e.g. uploads/img.png) - simplified
                    if (urlObj.pathname.startsWith('/')) {
                        srcCandidates.push(urlObj.pathname.substring(1));
                    }
                } catch (e) {
                    // Not a valid URL, maybe already relative
                }

                let regex: RegExp | null = null;
                let matchedSrc = '';

                // Try to find a match for any candidate
                for (const candidate of srcCandidates) {
                    // Try exact match with alt first: ![alt](candidate)
                    const escapedCandidate = escapeRegExp(candidate);
                    const escapedAlt = escapeRegExp(targetAlt);

                    let tryRegex = new RegExp(`!\\[${escapedAlt}\\]\\(${escapedCandidate}\\)`, 'g');
                    if (tryRegex.test(currentMarkdown)) {
                        regex = tryRegex;
                        matchedSrc = candidate;
                        break;
                    }

                    // Try loose match: ![.*?](candidate)
                    tryRegex = new RegExp(`!\\[.*?\\]\\(${escapedCandidate}\\)`, 'g');
                    if (tryRegex.test(currentMarkdown)) {
                        regex = tryRegex;
                        matchedSrc = candidate;
                        break;
                    }
                }

                // If still no match, try HTML tag style <img src="...">
                if (!regex) {
                    for (const candidate of srcCandidates) {
                        const escapedCandidate = escapeRegExp(candidate);
                        const htmlRegex = new RegExp(`<img[^>]*src=["']${escapedCandidate}["'][^>]*>`, 'i');
                        if (htmlRegex.test(currentMarkdown)) {
                            // We found an HTML tag. We can't easily resize this with our markdown suffix logic unless we parse aliases.
                            // But we can notify the user or try to inject style.
                            // For now, let's just log it.
                            console.log('[Editor] Found HTML image tag match, conversion not fully supported yet');
                        }
                    }
                }

                if (regex) {
                    let cleanAlt = targetAlt.replace(/\|[sml]/g, '').replace(/_[sml]/g, '').trim();
                    let newSuffix = '';
                    if (size === 's') newSuffix = '|s';
                    if (size === 'm') newSuffix = '|m';
                    if (size === 'l') newSuffix = '|l';

                    // Reconstruct using the matched src to preserve it
                    // matchedSrc has to be used in the replacement effectively
                    // But we need to use the regex to replace.

                    const newMarkdown = currentMarkdown.replace(regex, `![${cleanAlt}${newSuffix}](${matchedSrc})`);

                    if (newMarkdown !== currentMarkdown) {
                        editorInstance.setMarkdown(newMarkdown);
                        console.log('[Editor] Resize successful');
                    } else {
                        console.warn('[Editor] Markdown did not change (suffix might be same)');
                    }
                } else {
                    console.error('[Editor] Could not find image in Markdown source', { candidates: srcCandidates });
                    // Provide more helpful error
                    alert(`Could not locate image in document source.\nTarget: ${targetSrc}\n\nChecked candidates:\n${srcCandidates.join('\n')}`);
                }
            } catch (e) {
                console.error('[Editor] Resize error', e);
                alert('Internal error during resize: ' + e);
            }
        } else {
            console.error('[Editor] Image has no src attribute');
        }

        setContextMenu(prev => ({ ...prev, visible: false }));
    };

    const editDiagram = async () => {
        if (!contextMenu.target) return;
        const src = contextMenu.target.getAttribute('src');
        if (!src) return;

        try {
            // Fetch the image content
            const response = await fetch(src);
            const text = await response.text();

            // Extract XML from SVG
            // Draw.io embeds compressed XML in the 'content' attribute of the <svg> tag
            // or sometimes just as a raw XML string if we sent it that way?
            // Wait, we sent the XML provided by the 'save' event. 
            // The 'save' event from embed mode usually returns the XML of the graph.
            // But we uploaded a Blob of the SVG export.
            // Draw.io SVG export usually contains the source XML in the `content` attribute.

            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'image/svg+xml');
            const svg = doc.querySelector('svg');
            const content = svg?.getAttribute('content');

            if (content) {
                setCurrentDiagramXml(content); // Draw.io handles compressed content automatically if passed as xml? No, usually needs decompress.
                // Actually, if it's from the 'content' attribute, it's often the compressed data.
                // The embed protocol says: "xml: The XML of the graph to be loaded."
                // If it's compressed, we might need to handle that. 
                // However, our previous save logic: 
                // We received `msg.xml`. We sent `action: 'export', format: 'svg', xml: xml`.
                // The exported SVG from Draw.io includes the XML in the `content` attribute.
                setIsDrawioOpen(true);
            } else {
                // Fallback: Message might just be the XML itself if we saved it differently?
                // Try to match <mxfile> ... </mxfile> in text
                const match = text.match(/<mxfile[\s\S]*?<\/mxfile>/);
                if (match) {
                    setCurrentDiagramXml(match[0]);
                    setIsDrawioOpen(true);
                } else {
                    alert('Keine Diagrammdaten gefunden. (Ältere Diagramme können leider nicht bearbeitet werden.)');
                }
            }
        } catch (e) {
            console.error('Failed to load diagram for editing', e);
            alert('Fehler beim Laden des Diagramms.');
        }

        setContextMenu(prev => ({ ...prev, visible: false }));
    };

    // Update content when switching notes
    // Toast UI doesn't fully support controlled components pattern well for "value" prop updates 
    // after mount without using instance.setMarkdown().
    useEffect(() => {
        const editorInstance = editorRef.current?.getInstance();
        if (editorInstance) {
            // Check if we need to update content
            // 1. If Note ID changed -> Always update
            // 2. If Note ID is same BUT content in store is different from editor -> Update (External change like AI)
            // We need to be careful to avoid loop: Type -> onChange -> Store Update -> useEffect -> setMarkdown -> loop
            // But onChange updates store. So store matches editor.
            // If AI updates store: Store differs from editor. So we update editor.

            const currentEditorMarkdown = editorInstance.getMarkdown();
            const isDifferent = currentEditorMarkdown !== selectedNoteContent;

            if (selectedNoteId !== currentNoteIdRef.current || (isDifferent && selectedNoteContent !== undefined)) {
                // Optimization: Only set if actually different to preserve cursor if possible
                // (Though setMarkdown usually resets cursor)
                // For AI Append, we might want to try to preserve scroll, but setMarkdown is destructive.
                // We will just setMarkdown for now.

                if (currentEditorMarkdown !== selectedNoteContent) {
                    isInternalUpdate.current = true;
                    editorInstance.setMarkdown(selectedNoteContent || '');
                }

                currentNoteIdRef.current = selectedNoteId;

                // Update stats immediately on load
                const text = selectedNoteContent || '';
                // Strip Markdown/HTML for stats
                const cleanText = text
                    .replace(/!\[.*?\]\(.*?\)/g, '') // Images
                    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1') // Links (keep text)
                    .replace(/<[^>]*>/g, '') // HTML tags
                    .replace(/[*_~`#]/g, '') // Formatting chars
                    .trim();

                const words = cleanText === '' ? 0 : cleanText.split(/\s+/).length;
                const chars = cleanText.length;
                setStats({ words, chars });
            }
        }
    }, [selectedNoteId, selectedNoteContent]);

    const handleChange = () => {
        const editorInstance = editorRef.current?.getInstance();
        if (!editorInstance) return;

        // Recursion Guard: If this change was triggered by our own setMarkdown, ignore it.
        if (isInternalUpdate.current) {
            isInternalUpdate.current = false;
            return;
        }

        let value = editorInstance.getMarkdown();

        // ---------------------------------------------------------
        // Safe Auto-Conversion with Recursion Guard
        // ---------------------------------------------------------
        const youtubeRegex = /(?<!\[youtube\]\()(?<!src=["'])(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[^\s]+)(?=\s|$)/g;

        let hasChanged = false;
        const newValue = value.replace(youtubeRegex, (match: string) => {
            hasChanged = true;
            return `[youtube](${match})`;
        });

        if (hasChanged && newValue !== value) {
            console.log('[Editor] Auto-converted YouTube URL to widget syntax');
            // Set flag to ignore next onChange triggered by this setMarkdown
            isInternalUpdate.current = true;
            editorInstance.setMarkdown(newValue);
            value = newValue;
        }
        // ---------------------------------------------------------

        // Update stats
        // Strip Markdown/HTML for stats
        const cleanText = value
            .replace(/!\[.*?\]\(.*?\)/g, '') // Images
            .replace(/\[([^\]]+)\]\(.*?\)/g, '$1') // Links (keep text)
            .replace(/<[^>]*>/g, '') // HTML tags
            .replace(/[*_~`#]/g, '') // Formatting chars
            .trim();

        const words = cleanText === '' ? 0 : cleanText.split(/\s+/).length;
        const chars = cleanText.length;
        setStats({ words, chars });

        // Update global store
        updateNoteContent(value);

        // Debounce save
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            saveNoteContent();
        }, 1000);
    };

    // Save on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            if (currentNoteIdRef.current) {
                // Get latest content directly from editor if possible, or use store state
                // Since updateNoteContent is called on change, store state is roughly accurate.
                saveNoteContent();
            }
        };
    }, []);

    // Draw.io Communication
    useEffect(() => {
        const handleMessage = async (e: MessageEvent) => {
            if (!isDrawioOpen) return;
            if (e.data && typeof e.data === 'string') {
                try {
                    const msg = JSON.parse(e.data);

                    // Initial load configuration
                    if (msg.event === 'configure') {
                        const iframe = document.getElementById('drawio-iframe') as HTMLIFrameElement;
                        if (iframe && iframe.contentWindow) {
                            iframe.contentWindow.postMessage(JSON.stringify({
                                action: 'configure',
                                config: {
                                    compressXml: false,
                                    ui: 'min',
                                    dark: document.documentElement.className.includes('dark')
                                }
                            }), '*');
                        }
                    }

                    // Initial load request
                    else if (msg.event === 'init') {
                        const iframe = document.getElementById('drawio-iframe') as HTMLIFrameElement;
                        if (iframe && iframe.contentWindow) {
                            iframe.contentWindow.postMessage(JSON.stringify({
                                action: 'load',
                                autosave: 1,
                                xml: currentDiagramXml || ''
                            }), '*');
                        }
                    }

                    // Save / Autosave
                    else if (msg.event === 'save' || msg.event === 'autosave') {
                        const xml = msg.xml;
                        // We typically get XML. To display effectively, we need an image.
                        // Draw.io embed mode can return data.
                        // For now we will insert a special link or try to render.
                        // A simpler approach for embed: We export as SVG/PNG + XML embedded.

                        if (msg.event === 'save') {
                            const editorInstance = editorRef.current?.getInstance();
                            if (editorInstance) {
                                // Upload logic would act here to save the image to server
                                // For now, we will simulate by creating a placeholder or using data URI (limited size)
                                // Better: Send 'export' message to get SVG
                                const iframe = document.getElementById('drawio-iframe') as HTMLIFrameElement;
                                if (iframe && iframe.contentWindow) {
                                    iframe.contentWindow.postMessage(JSON.stringify({
                                        action: 'export',
                                        format: 'xmlsvg',
                                        xml: xml,
                                        spin: 'Updating...'
                                    }), '*');
                                }
                            }
                        }
                    }

                    // Export response
                    else if (msg.event === 'export') {
                        const editorInstance = editorRef.current?.getInstance();
                        if (editorInstance && msg.data) {
                            try {
                                // Convert data URI to Blob
                                const dataUri = msg.data;
                                const fetchRes = await fetch(dataUri);
                                const blob = await fetchRes.blob();

                                // Upload to backend
                                const formData = new FormData();
                                formData.append('image', blob, 'diagram.svg');

                                const uploadRes = await axios.post('/api/upload', formData, {
                                    withCredentials: true,
                                    headers: {
                                        'Content-Type': 'multipart/form-data'
                                    }
                                });

                                // Insert into editor with server URL
                                const imageUrl = uploadRes.data.url;
                                editorInstance.exec('addImage', {
                                    imageUrl: imageUrl,
                                    altText: 'Draw.io Diagram'
                                });

                                setIsDrawioOpen(false);
                            } catch (e) {
                                console.error('Failed to upload diagram', e);
                                alert('Diagramm konnte nicht gespeichert werden.');
                            }
                        }
                    }

                    else if (msg.event === 'exit') {
                        setIsDrawioOpen(false);
                    }
                } catch (err) {
                    // Ignore non-JSON messages
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [isDrawioOpen, currentDiagramXml]);

    const openDrawio = () => {
        setIsDrawioOpen(true);
        setCurrentDiagramXml(null); // Or load existing if selected
    };

    if (!selectedNoteId) {
        return (
            <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-900">
                {t.editor.emptyState || "Wählen Sie eine Notiz zum Bearbeiten aus"}
            </div>
        );
    }

    // Safety: If content is null (not loaded yet), show loading state to prevent "empty autosave" race condition.
    if (selectedNoteContent === null) {
        return (
            <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center gap-2">
                    <i className="fa fa-spinner fa-spin text-2xl"></i>
                    <span>Lade Notiz...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col relative">
            <div className="h-[46px] px-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    {saveError ? (
                        <span className="text-red-500 flex items-center gap-1">
                            <i className="fa fa-exclamation-circle"></i> {saveError}
                        </span>
                    ) : isSaving ? (
                        <span className="text-blue-500 flex items-center gap-1">
                            <i className="fa fa-spinner fa-spin"></i> {t.editor.saving}
                        </span>
                    ) : lastSaved ? (
                        <span className="text-green-600 flex items-center gap-1">
                            <i className="fa fa-check"></i> {t.editor.saved}: {lastSaved.toLocaleTimeString()}
                        </span>
                    ) : (
                        <span>{t.editor.autoSave}</span>
                    )}
                </div>

                <div className="flex gap-2 items-center">
                    <button
                        onClick={() => setShowRecorder(true)}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                        title={t.audio?.title || 'Audio'}
                    >
                        <Mic size={16} />
                    </button>
                    {/* Mobile Menu Button - Visible < md */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-1.5 md:hidden text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                    >
                        <MoreVertical size={16} />
                    </button>

                    {/* Mobile Menu Dropdown */}
                    {isMobileMenuOpen && (
                        <div className="absolute top-[46px] right-0 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-lg z-50 flex flex-col p-2 gap-2 md:hidden">
                            <button
                                onClick={() => { openDrawio(); setIsMobileMenuOpen(false); }}
                                className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-200"
                            >
                                <Workflow size={16} /> {t.editor.insertDiagram}
                            </button>
                            <button
                                onClick={() => { document.getElementById('import-file')?.click(); setIsMobileMenuOpen(false); }}
                                className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-200"
                            >
                                <UploadCloud size={16} /> Import
                            </button>
                            <div className="border-t dark:border-gray-700 my-1"></div>
                            {/* Export Actions in Mobile Menu */}
                            <button
                                onClick={() => { handleExport('md'); setIsMobileMenuOpen(false); }}
                                className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-200"
                            >
                                <Download size={16} /> Export Markdown
                            </button>
                            <button
                                onClick={() => { handleExport('txt'); setIsMobileMenuOpen(false); }}
                                className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-200"
                            >
                                <Download size={16} /> Export Text
                            </button>
                            <button
                                onClick={() => { handleExport('pdf'); setIsMobileMenuOpen(false); }}
                                className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm text-blue-600 dark:text-blue-400"
                            >
                                <Download size={16} /> Export PDF
                            </button>
                            <div className="border-t dark:border-gray-700 my-1"></div>
                            <button
                                onClick={() => { openHistoryModal(); setIsMobileMenuOpen(false); }}
                                className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-200"
                            >
                                <Clock size={16} /> {t.editor.history}
                            </button>
                            <button
                                onClick={() => { saveNoteContent(); setIsMobileMenuOpen(false); }}
                                disabled={isSaving}
                                className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-200"
                            >
                                {isSaving ? <i className="fa fa-spinner fa-spin"></i> : <Save size={16} />} {t.editor.saveNow}
                            </button>
                        </div>
                    )}

                    {/* Desktop Toolbar - Hidden < md */}
                    <div className="hidden md:flex items-center gap-2">
                        <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-600 mx-1"></div>
                        <button
                            onClick={openDrawio}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                            title={t.editor.insertDiagram}
                        >
                            <Workflow size={16} />
                        </button>
                        <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-600 mx-1"></div>

                        <input
                            type="file"
                            id="import-file"
                            className="hidden"
                            accept=".txt,.md"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                const reader = new FileReader();
                                reader.onload = (event) => {
                                    const content = event.target?.result as string;
                                    if (content) {
                                        const editorInstance = editorRef.current?.getInstance();
                                        if (editorInstance) {
                                            if (confirm("Möchten Sie den aktuellen Inhalt durch die Datei ersetzen?")) {
                                                editorInstance.setMarkdown(content);
                                            }
                                        }
                                    }
                                };
                                reader.readAsText(file);
                                e.target.value = '';
                            }}
                        />
                        <button
                            onClick={() => document.getElementById('import-file')?.click()}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                            title="Import Text/Markdown"
                        >
                            <UploadCloud size={16} />
                        </button>
                        <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-600 mx-1"></div>

                        {/* Export Menu */}
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setContextMenu(prev => ({ ...prev, visible: false }));
                                    setIsExportMenuOpen(!isExportMenuOpen);
                                }}
                                className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                                title="Export"
                            >
                                <Download size={16} />
                            </button>
                            {isExportMenuOpen && (
                                <div className="absolute top-full right-0 mt-1 w-40 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-lg z-50 flex flex-col py-1">
                                    <button
                                        className="px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                                        onClick={() => handleExport('md')}
                                    >
                                        Markdown (.md)
                                    </button>
                                    <button
                                        className="px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                                        onClick={() => handleExport('txt')}
                                    >
                                        Text (.txt)
                                    </button>
                                    <button
                                        className="px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm border-t dark:border-gray-700 text-blue-600 dark:text-blue-400"
                                        onClick={() => handleExport('pdf')}
                                    >
                                        PDF (Print)
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-600 mx-1"></div>
                        <button
                            onClick={openHistoryModal}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                            title={t.editor.history}
                        >
                            <Clock size={16} />
                        </button>
                        <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-600 mx-1"></div>
                        <button
                            onClick={() => saveNoteContent()}
                            disabled={isSaving}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                            title={isSaving ? t.editor.saving : t.editor.saveNow}
                        >
                            {isSaving ? <i className="fa fa-spinner fa-spin"></i> : <Save size={16} />}
                        </button>
                    </div>
                </div>
            </div >


            {/* Version History Modal */}
            {
                isHistoryModalOpen && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-96 max-h-[80vh] flex flex-col overflow-hidden border dark:border-gray-700">
                            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                                <h3 className="font-bold text-lg dark:text-gray-100">{t.editor.history}</h3>
                                <button onClick={() => setIsHistoryModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                    <i className="fa fa-times"></i>
                                </button>
                            </div>
                            <div className="overflow-y-auto flex-1 p-2">
                                {historyVersions.length === 0 ? (
                                    <div className="text-center text-gray-500 py-4 italic">{t.editor.noVersions}</div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {/* Current Version Indicator could go here, but usually users want to go BACK */}
                                        <div className="p-2 text-xs text-center text-gray-400 border-b dark:border-gray-700 mb-2">
                                            {t.editor.current}: {lastSaved?.toLocaleString()}
                                        </div>
                                        {historyVersions.map((v) => (
                                            <div key={v.id} className="p-3 border dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-750 flex justify-between items-center bg-white dark:bg-gray-800">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm dark:text-gray-200">{new Date(v.created_at).toLocaleString()}</span>
                                                    <span className="text-xs text-gray-500">ID: {v.id}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleRestore(v.id)}
                                                    className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-2 rounded"
                                                    title={t.editor.restore}
                                                >
                                                    <RotateCcw size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-right">
                                <button onClick={() => setIsHistoryModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600 dark:text-gray-200">
                                    {t.general.close}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                isDrawioOpen && (
                    <div className="absolute inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
                        <div className="p-2 border-b dark:border-gray-700 flex justify-between items-center bg-gray-100 dark:bg-gray-800">
                            <span className="font-bold">Draw.io Editor</span>
                            <button onClick={() => setIsDrawioOpen(false)} className="text-red-500 hover:text-red-700">Cancel</button>
                        </div>
                        <iframe
                            id="drawio-iframe"
                            src={`${drawioSettings.provider === 'local' ? drawioSettings.localUrl : 'https://embed.diagrams.net'}?embed=1&ui=min&spin=1&proto=json&configure=1`}
                            className="flex-1 w-full h-full border-0"
                        />
                    </div>
                )
            }
            <div id="printable-editor-area" className="flex-1 overflow-hidden flex flex-col relative dark:bg-gray-900">
                <ToastEditor
                    key={darkMode ? 'dark' : 'light'}
                    ref={editorRef}
                    initialValue={selectedNoteContent || ''}
                    previewStyle="vertical"
                    height="100%"
                    initialEditType="wysiwyg"
                    useCommandShortcut={true}
                    theme={darkMode ? 'dark' : ''}
                    language={language === 'de' ? 'de-DE' : 'en-US'}
                    onChange={handleChange}
                    usageStatistics={false}
                    toolbarItems={[
                        ['heading', 'bold', 'italic', 'strike'],
                        ['hr', 'quote'],
                        ['ul', 'ol', 'task'],
                        ['table', 'image', 'link'],
                        ['code', 'codeblock']
                    ]}
                    plugins={[
                        [codeSyntaxHighlight, { highlighter: Prism }],
                        colorSyntax,
                        chart,
                        uml,
                        tableMergedCell,
                        details,
                        textAlignSimpel,
                        emoji,
                        highlight
                    ]}
                    widgetRules={[
                        {
                            // Match [youtube](url) or [youtube|align](url)
                            rule: /\[youtube(?:\|(left|center|right))?\]\((https?:\/\/.*)\)/,
                            toDOM(text: string) {
                                const rule = /\[youtube(?:\|(left|center|right))?\]\((https?:\/\/.*)\)/;
                                const match = text.match(rule);
                                if (!match) return document.createElement('span');

                                // Ignore alignment group, force defaults
                                const url = match[2];
                                const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);

                                if (ytMatch && ytMatch[1]) {
                                    const videoId = ytMatch[1];

                                    // Outer Container (Force Alignment Context)
                                    const outerContainer = document.createElement('div');
                                    outerContainer.style.setProperty('display', 'block', 'important');
                                    outerContainer.style.setProperty('width', '100%', 'important');
                                    outerContainer.style.setProperty('text-align', 'left', 'important');
                                    outerContainer.style.setProperty('float', 'left', 'important');
                                    outerContainer.style.setProperty('clear', 'both', 'important');
                                    outerContainer.className = 'youtube-widget-outer my-4';

                                    const wrapper = document.createElement('div');
                                    wrapper.className = 'youtube-widget rounded overflow-hidden shadow-sm bg-black';

                                    // Use specific inline styles with !important
                                    wrapper.style.setProperty('display', 'block', 'important');
                                    wrapper.style.setProperty('margin-left', '0', 'important');
                                    wrapper.style.setProperty('margin-right', 'auto', 'important');
                                    wrapper.style.marginBottom = '1rem';
                                    wrapper.style.marginTop = '1rem';

                                    wrapper.style.width = '100%';
                                    wrapper.style.maxWidth = '500px';

                                    // Container for 16:9 aspect ratio
                                    const container = document.createElement('div');
                                    container.style.position = 'relative';
                                    container.style.width = '100%';
                                    container.style.paddingBottom = '56.25%'; // 16:9

                                    const iframe = document.createElement('iframe');
                                    iframe.src = `https://www.youtube.com/embed/${videoId}`;
                                    iframe.style.position = 'absolute';
                                    iframe.style.top = '0';
                                    iframe.style.left = '0';
                                    iframe.style.width = '100%';
                                    iframe.style.height = '100%';
                                    iframe.style.border = '0';
                                    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                                    iframe.allowFullscreen = true;

                                    container.appendChild(iframe);
                                    wrapper.appendChild(container);

                                    container.appendChild(iframe);
                                    wrapper.appendChild(container);

                                    outerContainer.appendChild(wrapper);
                                    return outerContainer;
                                }
                                return document.createElement('span');
                            },
                        },
                        // Simple auto-conversion from URL to [youtube](URL) format
                        {
                            rule: /(^|\s)(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s]+)/,
                            toDOM(text: string) {
                                const rule = /(^|\s)(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s]+)/;
                                const match = text.match(rule);
                                if (!match) return document.createElement('span');

                                const url = match[2];
                                const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);

                                if (ytMatch && ytMatch[1]) {
                                    const videoId = ytMatch[1];

                                    // Outer Container
                                    const outerContainer = document.createElement('div');
                                    outerContainer.style.setProperty('display', 'block', 'important');
                                    outerContainer.style.setProperty('width', '100%', 'important');
                                    outerContainer.style.setProperty('text-align', 'left', 'important');
                                    outerContainer.style.setProperty('float', 'left', 'important');
                                    outerContainer.style.setProperty('clear', 'both', 'important');
                                    outerContainer.className = 'youtube-widget-outer my-4';

                                    const wrapper = document.createElement('div');
                                    wrapper.className = 'youtube-widget rounded overflow-hidden shadow-sm bg-black';

                                    // Use specific inline styles
                                    wrapper.style.setProperty('display', 'block', 'important');
                                    wrapper.style.setProperty('margin-left', '0', 'important');
                                    wrapper.style.setProperty('margin-right', 'auto', 'important');
                                    wrapper.style.marginBottom = '1rem';
                                    wrapper.style.marginTop = '1rem';

                                    wrapper.style.width = '100%';
                                    wrapper.style.maxWidth = '500px';

                                    // Container for 16:9
                                    const container = document.createElement('div');
                                    container.style.position = 'relative';
                                    container.style.width = '100%';
                                    container.style.paddingBottom = '56.25%'; // 16:9

                                    const iframe = document.createElement('iframe');
                                    iframe.src = `https://www.youtube.com/embed/${videoId}`;
                                    iframe.style.position = 'absolute';
                                    iframe.style.top = '0';
                                    iframe.style.left = '0';
                                    iframe.style.width = '100%';
                                    iframe.style.height = '100%';
                                    iframe.style.border = '0';
                                    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                                    iframe.allowFullscreen = true;

                                    container.appendChild(iframe);
                                    wrapper.appendChild(container);

                                    container.appendChild(iframe);
                                    wrapper.appendChild(container);

                                    outerContainer.appendChild(wrapper);
                                    return outerContainer;
                                }
                                return document.createElement('span');
                            }
                        }
                    ]}
                    customHTMLRenderer={{
                        link(node: any, context: any) {
                            if (!node || !node.attrs) return context.origin();
                            const { href } = node.attrs;

                            // Check for YouTube link
                            const ytMatch = href && href.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);

                            if (ytMatch && ytMatch[1]) {
                                const videoId = ytMatch[1];
                                const iframeSrc = `https://www.youtube.com/embed/${videoId}`;
                                // Force Left via attributes style to ensure preview respects it

                                return {
                                    type: 'openTag',
                                    tagName: 'div',
                                    attributes: {
                                        style: 'display: flex !important; justify-content: flex-start !important; width: 100% !important; margin: 1rem 0 !important;'
                                    },
                                    children: [
                                        {
                                            type: 'openTag',
                                            tagName: 'div',
                                            classNames: ['youtube-preview', 'relative', 'overflow-hidden', 'rounded', 'shadow-sm', 'bg-black'],
                                            attributes: {
                                                style: 'flex: 0 0 auto !important; width: 100% !important; max-width: 500px !important;'
                                            },
                                            children: [
                                                // Iframe Container
                                                {
                                                    type: 'openTag',
                                                    tagName: 'div',
                                                    attributes: { style: 'position: relative; width: 100%; padding-bottom: 56.25%;' },
                                                    children: [
                                                        {
                                                            type: 'openTag',
                                                            tagName: 'iframe',
                                                            attributes: {
                                                                src: iframeSrc,
                                                                style: 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;',
                                                                allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
                                                                allowfullscreen: ''
                                                            }
                                                        },
                                                        { type: 'closeTag', tagName: 'iframe' }
                                                    ]
                                                },
                                                { type: 'closeTag', tagName: 'div' }
                                            ]
                                        },
                                        { type: 'closeTag', tagName: 'div' }
                                    ]
                                };
                            }
                            return context.origin();
                        },
                        htmlBlock: {
                            iframe(node: any) {
                                return [
                                    { type: 'openTag', tagName: 'iframe', outerNewLine: true, attributes: node.attrs },
                                    { type: 'html', content: node.childrenHTML },
                                    { type: 'closeTag', tagName: 'iframe', outerNewLine: true }
                                ];
                            }
                        }
                    }}
                />
            </div>

            {/* Word/Char Counter Overlay */}
            <div className="absolute bottom-0 left-0 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 px-3 py-1 border-t border-r rounded-tr dark:border-gray-700 z-10 font-mono">
                {stats.words} {t.editor.words} | {stats.chars} {t.editor.chars}
            </div>


            {/* Context Menu */}
            {
                contextMenu.visible && (
                    <div
                        className="fixed z-50 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-lg rounded py-1 min-w-[150px]"
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                    >
                        {contextMenu.type === 'youtube' ? (
                            <>
                                <div className="px-3 py-1 text-xs font-bold text-gray-500 uppercase tracking-wider">Ausrichtung</div>
                                <button
                                    onClick={() => alignWidget('left')}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center justify-between"
                                >
                                    <span>Links</span>
                                    <i className="fa fa-align-left text-gray-400"></i>
                                </button>
                                <button
                                    onClick={() => alignWidget('center')}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center justify-between"
                                >
                                    <span>Zentriert</span>
                                    <i className="fa fa-align-center text-gray-400"></i>
                                </button>
                                <button
                                    onClick={() => alignWidget('right')}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center justify-between"
                                >
                                    <span>Rechts</span>
                                    <i className="fa fa-align-right text-gray-400"></i>
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="px-3 py-1 text-xs font-bold text-gray-500 uppercase tracking-wider">Optionen</div>
                                <button
                                    onClick={editDiagram}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center gap-2 text-blue-600 dark:text-blue-400"
                                >
                                    <i className="fa fa-pencil"></i>
                                    <span>Diagramm bearbeiten</span>
                                </button>
                                <div className="border-t dark:border-gray-700 my-1"></div>
                                <div className="px-3 py-1 text-xs font-bold text-gray-500 uppercase tracking-wider">Bildgröße</div>
                                <button
                                    onClick={() => resizeImage('s')}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center justify-between"
                                >
                                    <span>Klein</span>
                                    <span className="text-gray-400 text-xs">(300px)</span>
                                </button>
                                <button
                                    onClick={() => resizeImage('m')}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center justify-between"
                                >
                                    <span>Mittel</span>
                                    <span className="text-gray-400 text-xs">(600px)</span>
                                </button>
                                <button
                                    onClick={() => resizeImage('l')}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center justify-between"
                                >
                                    <span>Groß</span>
                                    <span className="text-gray-400 text-xs">(100%)</span>
                                </button>
                                <div className="border-t dark:border-gray-700 my-1"></div>
                                <button
                                    onClick={() => resizeImage('original')}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-600 dark:text-gray-400"
                                >
                                    Original zurücksetzen
                                </button>
                            </>
                        )}
                    </div>
                )
            }

            <div style={{ display: showRecorder ? 'block' : 'none' }}>
                <AudioRecorder
                    onTranscriptionComplete={handleTranscription}
                    onClose={() => setShowRecorder(false)}
                    language={language}
                    t={t.audio}
                />
            </div>

            {isHistoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setIsHistoryModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full m-4 shadow-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">{t.editor.history}</h3>
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                            {historyVersions.map((version) => (
                                <div key={version.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600">
                                    <div className="flex items-center gap-3">
                                        <Clock size={16} className="text-gray-500 dark:text-gray-400" />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {(() => {
                                                try {
                                                    return new Date(version.created_at).toLocaleString();
                                                } catch (e) {
                                                    return 'Invalid Date';
                                                }
                                            })()}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleRestore(version.id)}
                                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                                        title={t.editor.restore}
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                </div>
                            ))}
                            {historyVersions.length === 0 && (
                                <div className="text-center text-gray-500 py-4">
                                    {t.editor.noVersions || "Keine Versionen verfügbar"}
                                </div>
                            )}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setIsHistoryModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                {t.general.close || "Schließen"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >

    );
};
