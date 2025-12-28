import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import type { NoteNode } from '../types';
import { Folder, FileText, ChevronRight, ChevronDown, Plus, Trash2, Edit2, Copy, Search } from 'lucide-react';

import { translations } from '../i18n/translations';




interface TreeNodeProps {
    node: NoteNode;
    level: number;
    onNodeSelect?: () => void;
    onContextMenu: (e: React.MouseEvent, node: NoteNode) => void;
    isMobile?: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, level, onNodeSelect, onContextMenu, isMobile }) => {
    const { selectNote, selectedNoteId, createNode, deleteNode, duplicateNode, renameNode, moveNode, openModal, language, expandedNodeIds, toggleNodeExpansion, setNodeExpansion, fetchTree } = useStore();
    const t = translations[language];
    const [isDragOver, setIsDragOver] = useState(false);

    // Derived state from store
    const isOpen = expandedNodeIds.includes(node.id);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleNodeExpansion(node.id);
        // Refresh tree when interacting with folders to show new content
        fetchTree();
    };

    const handleClick = () => {
        selectNote(node);
        if (node.type === 'note' && onNodeSelect) {
            onNodeSelect();
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(e, node);
    };

    const handleCreate = async (e: React.MouseEvent, type: 'folder' | 'note') => {
        e.stopPropagation();
        openModal({
            type: 'prompt',
            title: type === 'folder' ? t.sidebar.newFolder : t.sidebar.newNote,
            message: `Name:`,
            onConfirm: async (val) => {
                if (typeof val !== 'string' || !val) return;
                const title = val;
                if (title) {
                    await createNode(node.id, type, title);
                    setNodeExpansion(node.id, true); // Ensure expanded
                }
            }
        });
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        openModal({
            type: 'confirm',
            title: t.general.delete,
            message: `Sind Sie sicher, dass Sie "${node.title}" löschen möchten?`,
            onConfirm: async () => {
                await deleteNode(node.id);
            }
        });
    };

    const handleRename = async (e: React.MouseEvent) => {
        e.stopPropagation();
        openModal({
            type: 'prompt',
            title: t.sidebar.rename,
            message: 'Name:',
            inputValue: node.title,
            onConfirm: async (val) => {
                if (typeof val !== 'string' || !val) return;
                const newTitle = val;
                if (newTitle) {
                    await renameNode(node.id, newTitle);
                }
            }
        });
    };

    const handleDuplicate = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await duplicateNode(node.id);
    };

    // Drag & Drop Handlers
    const handleDragStart = (e: React.DragEvent) => {
        e.stopPropagation();
        e.dataTransfer.setData('application/json', JSON.stringify({ id: node.id, type: node.type }));
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (node.type === 'folder') {
            setIsDragOver(true);
            e.dataTransfer.dropEffect = 'move';
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (node.type !== 'folder') return;

        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            const draggedId = data.id;

            if (draggedId === node.id) return; // Cannot drop on itself

            await moveNode(draggedId, node.id);
            setNodeExpansion(node.id, true); // Open folder to show dropped item
        } catch (error) {
            console.error('Drop failed:', error);
        }
    };

    const isSelected = selectedNoteId === node.id;

    // Responsive styles
    const itemPadding = isMobile ? 'p-3 my-1' : 'p-1';
    const textSize = isMobile ? 'text-base' : 'text-sm';
    const iconSize = isMobile ? 20 : 16;
    const actionIconSize = isMobile ? 16 : 12;

    return (
        <div style={{ paddingLeft: `${level * 12}px` }}>
            <div
                className={`flex items-center ${itemPadding} hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded ${isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''} ${isDragOver ? 'bg-blue-200 dark:bg-blue-800 ring-2 ring-blue-500' : ''}`}
                onClick={handleClick}
                onContextMenu={handleContextMenu}
                draggable
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <span onClick={handleToggle} className="mr-1 p-1">
                    {node.type === 'folder' && (
                        isOpen ? <ChevronDown size={iconSize} /> : <ChevronRight size={iconSize} />
                    )}
                    {node.type === 'note' && <span className="w-4" />}
                </span>

                {node.type === 'folder' ? <Folder size={iconSize} className="text-yellow-500 mr-2" /> : <FileText size={iconSize} className="text-blue-500 mr-2" />}

                <span className={`flex-1 truncate ${textSize} select-none`}>{node.title}</span>

                <div className={`flex gap-2 ${isSelected ? 'opacity-100' : 'opacity-0 hover:opacity-100 group-hover:opacity-100'}`}>
                    {node.type === 'folder' && (
                        <>
                            <button onClick={(e) => handleCreate(e, 'note')} title={t.sidebar.newNote}><Plus size={actionIconSize} /></button>
                            <button onClick={(e) => handleCreate(e, 'folder')} title={t.sidebar.newFolder}><Folder size={actionIconSize} /></button>
                        </>
                    )}
                    {node.type === 'note' && (
                        <button onClick={handleDuplicate} title={t.sidebar.duplicate}><Copy size={actionIconSize} /></button>
                    )}
                    <button onClick={handleRename} title={t.sidebar.rename}><Edit2 size={actionIconSize} /></button>
                    <button onClick={handleDelete} title={t.sidebar.delete}><Trash2 size={actionIconSize} className="text-red-500" /></button>
                </div>
            </div>

            {isOpen && node.children && (
                <div>
                    {node.children.map(child => (
                        <TreeNode key={child.id} node={child} level={level + 1} onNodeSelect={onNodeSelect} onContextMenu={onContextMenu} isMobile={isMobile} />
                    ))}
                </div>
            )}
        </div>
    );
};

interface TreeViewProps {
    onNodeSelect?: () => void;
    isMobile?: boolean;
}

export const TreeView: React.FC<TreeViewProps> = ({ onNodeSelect, isMobile }) => {
    const { tree, createNode, openModal, moveNode, renameNode, deleteNode, duplicateNode, language, selectNote } = useStore();
    const t = translations[language];
    const [isDragOverRoot, setIsDragOverRoot] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Search Logic
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];

        const query = searchQuery.toLowerCase();
        const results: NoteNode[] = [];

        const searchNodes = (nodes: NoteNode[]) => {
            for (const node of nodes) {
                const titleMatch = node.title.toLowerCase().includes(query);
                const contentMatch = node.contentMarkdown?.toLowerCase().includes(query);

                if (titleMatch || contentMatch) {
                    results.push(node);
                }

                if (node.children) {
                    searchNodes(node.children);
                }
            }
        };

        searchNodes(tree);
        return results;
    }, [searchQuery, tree]);


    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; node: NoteNode | null }>({
        visible: false,
        x: 0,
        y: 0,
        node: null
    });

    React.useEffect(() => {
        const handleClick = () => setContextMenu(prev => ({ ...prev, visible: false }));
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    const handleNodeContextMenu = (e: React.MouseEvent, node: NoteNode) => {
        // Calculate safe position (keep menu within viewport)
        let x = e.clientX;
        let y = e.clientY;

        // Simple bound check (approximate menu size)
        if (window.innerWidth - x < 200) x = window.innerWidth - 200;
        if (window.innerHeight - y < 250) y = window.innerHeight - 250;

        setContextMenu({
            visible: true,
            x,
            y,
            node
        });
    };

    const handleMenuAction = async (action: 'newInfo' | 'newFolder' | 'rename' | 'duplicate' | 'delete') => {
        const node = contextMenu.node;
        if (!node) return;

        setContextMenu(prev => ({ ...prev, visible: false }));

        switch (action) {
            case 'newInfo': // Note
                openModal({
                    type: 'prompt',
                    title: t.sidebar.newNote,
                    message: 'Name:',
                    onConfirm: async (val) => {
                        if (val) await createNode(node.id, 'note', val as string);
                    }
                });
                break;
            case 'newFolder':
                openModal({
                    type: 'prompt',
                    title: t.sidebar.newFolder,
                    message: 'Name:',
                    onConfirm: async (val) => {
                        if (val) await createNode(node.id, 'folder', val as string);
                    }
                });
                break;
            case 'rename':
                openModal({
                    type: 'prompt',
                    title: t.sidebar.rename,
                    message: 'Name:',
                    inputValue: node.title,
                    onConfirm: async (val) => {
                        if (val) await renameNode(node.id, val as string);
                    }
                });
                break;
            case 'duplicate':
                await duplicateNode(node.id);
                break;
            case 'delete':
                openModal({
                    type: 'confirm',
                    title: t.general.delete,
                    message: `Sind Sie sicher, dass Sie "${node.title}" löschen möchten?`,
                    onConfirm: async () => {
                        await deleteNode(node.id);
                    }
                });
                break;
        }
    };

    const handleCreateRoot = async (type: 'folder' | 'note') => {
        openModal({
            type: 'prompt',
            title: `Neuen Stamm-${type === 'folder' ? 'Ordner' : 'Notiz'} erstellen`,
            message: 'Name:',
            onConfirm: async (val) => {
                if (typeof val !== 'string' || !val) return;
                const title = val;
                if (title) {
                    await createNode(null, type, title);
                }
            }
        });
    };

    // ... (Root drag handlers unchanged)

    const handleDragOverRoot = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOverRoot(true);
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragLeaveRoot = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOverRoot(false);
    };

    const handleDropRoot = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOverRoot(false);

        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            const draggedId = data.id;
            await moveNode(draggedId, null);
        } catch (error) {
            console.error('Drop to root failed:', error);
        }
    };

    return (
        <div
            className={`h-full flex flex-col ${isDragOverRoot ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
            onDragOver={handleDragOverRoot}
            onDragLeave={handleDragLeaveRoot}
            onDrop={handleDropRoot}
        >
            <div className={`bg-gray-50 dark:bg-gray-800 ${isMobile ? 'p-4 border-b dark:border-gray-700' : ''}`}>
                {/* Header Row - Matches Editor Status Bar (32px content + 1px border) */}
                <div className={`flex justify-between items-center px-2 border-b dark:border-gray-700 ${isMobile ? 'mb-2' : 'h-[46px]'}`}>
                    <span className={`font-bold text-gray-600 dark:text-gray-300 ${isMobile ? 'text-base' : 'text-xs'}`}>
                        {t.sidebar.explorer}
                    </span>
                    <div className="flex gap-1 text-gray-500 dark:text-gray-400">
                        <button
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            onClick={() => handleCreateRoot('note')}
                            title={t.sidebar.newNote}
                        >
                            <Plus size={isMobile ? 20 : 14} />
                        </button>
                        <button
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            onClick={() => handleCreateRoot('folder')}
                            title={t.sidebar.newFolder}
                        >
                            <Folder size={isMobile ? 20 : 14} />
                        </button>
                    </div>
                </div>

                {/* Search Row - Matches Enforced Toolbar Height (46px) */}
                <div className={`flex items-center ${isMobile ? '' : 'h-[46px] px-2'} border-b dark:border-gray-700`}>
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder={t.sidebar.searchPlaceholder || "Search..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-2 py-1.5 text-xs bg-white dark:bg-gray-700 border dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <Search size={12} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-2">
                {searchQuery.trim() ? (
                    // Search Results List
                    <div className="flex flex-col gap-1">
                        {searchResults.length === 0 ? (
                            <div className="text-gray-500 text-xs italic p-2 text-center">Keine Ergebnisse</div>
                        ) : (
                            searchResults.map(node => (
                                <div
                                    key={node.id}
                                    className="flex items-center p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded"
                                    onClick={() => {
                                        selectNote(node);
                                        if (onNodeSelect) onNodeSelect();
                                    }}
                                >
                                    {node.type === 'folder' ?
                                        <Folder size={16} className="text-yellow-500 mr-2 shrink-0" /> :
                                        <FileText size={16} className="text-blue-500 mr-2 shrink-0" />
                                    }
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-sm truncate font-medium">{node.title}</span>
                                        <span className="text-[10px] text-gray-500 truncate">
                                            {/* Show path or type or just 'Found in content' */}
                                            {node.contentMarkdown?.toLowerCase().includes(searchQuery.toLowerCase()) ? 'Treffer im Inhalt' : 'Treffer im Titel'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    // Standard Tree View
                    tree.map(node => (
                        <TreeNode key={node.id} node={node} level={0} onNodeSelect={onNodeSelect} onContextMenu={handleNodeContextMenu} isMobile={isMobile} />
                    ))
                )}
            </div>

            {/* Context Menu Overlay */}
            {contextMenu.visible && contextMenu.node && (
                <div
                    className="fixed z-50 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-xl rounded-lg py-1 w-48 text-sm"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-3 py-2 border-b dark:border-gray-700 font-semibold text-gray-500 dark:text-gray-400 text-xs truncate">
                        {contextMenu.node.title}
                    </div>

                    {contextMenu.node.type === 'folder' && (
                        <>
                            <button onClick={() => handleMenuAction('newInfo')} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                                <Plus size={14} className="text-gray-500" />
                                <span>{t.sidebar.newNote}</span>
                            </button>
                            <button onClick={() => handleMenuAction('newFolder')} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                                <Folder size={14} className="text-gray-500" />
                                <span>{t.sidebar.newFolder}</span>
                            </button>
                            <div className="border-t dark:border-gray-700 my-1"></div>
                        </>
                    )}

                    {contextMenu.node.type === 'note' && (
                        <button onClick={() => handleMenuAction('duplicate')} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                            <Copy size={14} className="text-gray-500" />
                            <span>{t.sidebar.duplicate}</span>
                        </button>
                    )}

                    <button onClick={() => handleMenuAction('rename')} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                        <Edit2 size={14} className="text-gray-500" />
                        <span>{t.sidebar.rename}</span>
                    </button>

                    <div className="border-t dark:border-gray-700 my-1"></div>

                    <button onClick={() => handleMenuAction('delete')} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400">
                        <Trash2 size={14} />
                        <span>{t.sidebar.delete}</span>
                    </button>
                </div>
            )}
        </div>
    );
};
