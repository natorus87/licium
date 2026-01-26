import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import type { NoteNode } from '../types';
import { Folder, FileText, ChevronRight, ChevronDown, Plus, Trash2, Edit2, Copy, Search, ArrowUpDown, Zap } from 'lucide-react';

import { translations } from '../i18n/translations';




interface TreeNodeProps {
    node: NoteNode;
    level: number;
    siblings: NoteNode[];
    index: number;
    onNodeSelect?: () => void;
    onContextMenu: (e: React.MouseEvent, node: NoteNode) => void;
    isMobile?: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, level, siblings, onNodeSelect, onContextMenu, isMobile }) => {
    const { selectNote, selectedNoteId, createNode, deleteNode, duplicateNode, renameNode, reorderNodes, openModal, language, expandedNodeIds, toggleNodeExpansion, setNodeExpansion, fetchTree } = useStore();
    const t = translations[language];

    // Drag State: 'top' | 'bottom' | 'inside' | null
    const [dragState, setDragState] = useState<'top' | 'bottom' | 'inside' | null>(null);

    const isOpen = expandedNodeIds.includes(node.id);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleNodeExpansion(node.id);
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
                    setNodeExpansion(node.id, true);
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

        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = rect.height;

        // Thresholds for drop zones
        // Top 25%: Insert Before
        // Bottom 25%: Insert After
        // Middle 50%: Insert Inside (if folder)

        let state: 'top' | 'bottom' | 'inside' | null = null;

        if (node.type === 'folder') {
            if (y < height * 0.25) state = 'top';
            else if (y > height * 0.75) state = 'bottom';
            else state = 'inside';
        } else {
            // Files can only be reordered, not contain items
            if (y < height * 0.5) state = 'top';
            else state = 'bottom';
        }

        if (state !== dragState) {
            setDragState(state);
        }

        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Prevent flickering: Only clear state if leaving the container, not entering a child
        if (e.currentTarget.contains(e.relatedTarget as Node)) {
            return;
        }
        setDragState(null);
    };

    const getDropZone = (e: React.DragEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = rect.height;

        if (node.type === 'folder') {
            if (y < height * 0.25) return 'top';
            if (y > height * 0.75) return 'bottom';
            return 'inside';
        }

        // Files
        return y < height * 0.5 ? 'top' : 'bottom';
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Calculate state explicitly at drop time to avoid state staleness
        const state = getDropZone(e);
        setDragState(null); // Clear visual feedback

        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            const draggedId = data.id;

            if (draggedId === node.id) return;

            // Cycle Detection: Check if we are dropping into a descendant
            // Traverse up from the target 'node' to see if 'draggedId' is one of its parents (or itself, checked above)
            // But wait, 'node' is the target. We need to check if 'node' is a child of 'draggedId'.
            // In the tree structure passed to this component, 'node' has children.
            // We need to check if 'node' is contained within the subtree of 'draggedId'.
            // Actually, visually on screen, a child is inside the parent.
            // If I drag 'A' (parent) into 'B' (child), I should stop it.
            // How do I know if B is a child of A without a full tree search? 
            // The `reorderNodes` backend call will now catch it, but UI feedback is better.

            // Simple heuristic: If the recursive React rendering structure works, 
            // the `node` prop contains the target. 
            // Does `node` have a path up to root? No. 
            // But we can check if `draggedId` is an ancestor of `node`.
            // Since we don't have parent pointers, we rely on the backend check mostly.
            // However, we can basic check:
            // If state === 'inside' and node.id === draggedId -> covered.

            // Let's rely on backend for robust check, but prevent obvious UI glitches.


            // Handle Nesting (Folder)
            if (state === 'inside' && node.type === 'folder') {
                const targetChildren = node.children || [];
                const lastChild = targetChildren[targetChildren.length - 1];
                const newPos = lastChild ? (lastChild.position || 0) + 65536 : 65536;

                await reorderNodes([{
                    id: draggedId,
                    parentId: node.id,
                    position: newPos
                }]);
                setNodeExpansion(node.id, true);
                return;
            }

            // Re-partitioning Logic
            const filteredSiblings = siblings.filter(n => n.id !== draggedId);
            const targetIndex = filteredSiblings.findIndex(n => n.id === node.id);

            if (targetIndex === -1) return;

            let insertIndex = targetIndex;
            if (state === 'bottom') {
                insertIndex = targetIndex + 1;
            }

            const newOrderIds = [
                ...filteredSiblings.slice(0, insertIndex).map(n => n.id),
                draggedId,
                ...filteredSiblings.slice(insertIndex).map(n => n.id)
            ];

            const updates = newOrderIds.map((id, idx) => ({
                id,
                parentId: node.parentId,
                position: (idx + 1) * 65536
            }));

            await reorderNodes(updates);

        } catch (error) {
            console.error('Drop failed:', error);
        }
    };

    const isSelected = selectedNoteId === node.id;
    const itemPadding = isMobile ? 'p-3 my-1' : 'p-1';
    const textSize = isMobile ? 'text-base' : 'text-sm';
    const iconSize = isMobile ? 20 : 16;
    const actionIconSize = isMobile ? 16 : 12;

    // Visual Indicators
    const dropIndicatorClass = dragState === 'top' ? 'border-t-2 border-blue-500' :
        dragState === 'bottom' ? 'border-b-2 border-blue-500' :
            dragState === 'inside' ? 'bg-blue-100 dark:bg-blue-900/50 ring-2 ring-blue-500 rounded' : '';

    return (
        <div style={{ paddingLeft: `${level * 12}px` }}>
            {/* Outer drop zone wrapper */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`${dropIndicatorClass}`}
            >
                {/* Inner draggable item */}
                <div
                    className={`flex items-center ${itemPadding} hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded transition-all duration-150 ${isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                    onClick={handleClick}
                    onContextMenu={handleContextMenu}
                    draggable
                    onDragStart={handleDragStart}
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
            </div>

            {isOpen && node.children && (
                <div>
                    {node.children.map((child, idx) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            siblings={node.children!}
                            index={idx}
                            level={level + 1}
                            onNodeSelect={onNodeSelect}
                            onContextMenu={onContextMenu}
                            isMobile={isMobile}
                        />
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
    const { tree, createNode, openModal, reorderNodes, sortNodes, renameNode, deleteNode, duplicateNode, language, selectNote } = useStore();
    const t = translations[language];
    const [isDragOverRoot, setIsDragOverRoot] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Search Logic ... (Unchanged)
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        const results: NoteNode[] = [];
        const searchNodes = (nodes: NoteNode[]) => {
            for (const node of nodes) {
                if (node.title.toLowerCase().includes(query) || node.contentMarkdown?.toLowerCase().includes(query)) {
                    results.push(node);
                }
                if (node.children) searchNodes(node.children);
            }
        };
        searchNodes(tree);
        return results;
    }, [searchQuery, tree]);

    // Context Menu State ... (Unchanged)
    const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; node: NoteNode | null }>({
        visible: false, x: 0, y: 0, node: null
    });

    React.useEffect(() => {
        const handleClick = () => setContextMenu(prev => ({ ...prev, visible: false }));
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    const handleNodeContextMenu = (e: React.MouseEvent, node: NoteNode) => {
        let x = e.clientX;
        let y = e.clientY;
        if (window.innerWidth - x < 200) x = window.innerWidth - 200;
        if (window.innerHeight - y < 250) y = window.innerHeight - 250;
        setContextMenu({ visible: true, x, y, node });
    };

    const handleMenuAction = async (action: 'newInfo' | 'newFolder' | 'rename' | 'duplicate' | 'delete') => {
        const node = contextMenu.node;
        if (!node) return;
        setContextMenu(prev => ({ ...prev, visible: false }));

        switch (action) {
            case 'newInfo':
                openModal({
                    type: 'prompt',
                    title: t.sidebar.newNote,
                    message: 'Name:',
                    onConfirm: async (val) => val && await createNode(node.id, 'note', val as string)
                });
                break;
            case 'newFolder':
                openModal({
                    type: 'prompt',
                    title: t.sidebar.newFolder,
                    message: 'Name:',
                    onConfirm: async (val) => val && await createNode(node.id, 'folder', val as string)
                });
                break;
            case 'rename':
                openModal({
                    type: 'prompt',
                    title: t.sidebar.rename,
                    message: 'Name:',
                    inputValue: node.title,
                    onConfirm: async (val) => val && await renameNode(node.id, val as string)
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
                    onConfirm: async () => await deleteNode(node.id)
                });
                break;
        }
    };

    const handleCreateRoot = async (type: 'folder' | 'note') => {
        openModal({
            type: 'prompt',
            title: `Neuen Stamm-${type === 'folder' ? 'Ordner' : 'Notiz'} erstellen`,
            message: 'Name:',
            onConfirm: async (val) => val && await createNode(null, type, val as string)
        });
    };

    const handleQuickNote = async () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');

        const timestamp = `${year}-${month}-${day}_${hour}:${minute}`;

        const newId = await createNode(null, 'note', timestamp);

        if (newId) {
            const findNodeById = (nodes: NoteNode[], id: string): NoteNode | null => {
                for (const node of nodes) {
                    if (node.id === id) return node;
                    if (node.children) {
                        const found = findNodeById(node.children, id);
                        if (found) return found;
                    }
                }
                return null;
            };

            const freshTree = useStore.getState().tree;
            const newNode = findNodeById(freshTree, newId);
            if (newNode) {
                selectNote(newNode);
                if (onNodeSelect) {
                    onNodeSelect();
                }
            }
        }
    };

    const handleDragOverRoot = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOverRoot(true);
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragLeaveRoot = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.contains(e.relatedTarget as Node)) {
            return;
        }
        setIsDragOverRoot(false);
    };

    const handleDropRoot = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOverRoot(false);
        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            const draggedId = data.id;

            // Re-partition root nodes
            const filteredRoot = tree.filter(n => n.id !== draggedId);
            const newOrderIds = [...filteredRoot.map(n => n.id), draggedId];

            const updates = newOrderIds.map((id, idx) => ({
                id,
                parentId: null,
                position: (idx + 1) * 65536
            }));

            await reorderNodes(updates);
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
                <div className={`flex justify-between items-center px-2 border-b dark:border-gray-700 ${isMobile ? 'mb-2' : 'h-[46px]'}`}>
                    <span className={`font-bold text-gray-600 dark:text-gray-300 ${isMobile ? 'text-base' : 'text-xs'}`}>
                        {t.sidebar.explorer}
                    </span>
                    <div className="flex gap-1 text-gray-500 dark:text-gray-400">
                        <button
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            onClick={handleQuickNote}
                            title={t.sidebar.quickNote}
                        >
                            <Zap size={isMobile ? 20 : 14} className="text-yellow-500 fill-yellow-500" />
                        </button>
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
                        <button
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            onClick={() => sortNodes(null)}
                            title="Sortieren (A-Z)"
                        >
                            <ArrowUpDown size={isMobile ? 20 : 14} />
                        </button>
                    </div>
                </div>

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
                                            {node.contentMarkdown?.toLowerCase().includes(searchQuery.toLowerCase()) ? 'Treffer im Inhalt' : 'Treffer im Titel'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    tree.map((node, i) => (
                        <TreeNode
                            key={node.id}
                            node={node}
                            siblings={tree}
                            index={i}
                            level={0}
                            onNodeSelect={onNodeSelect}
                            onContextMenu={handleNodeContextMenu}
                            isMobile={isMobile}
                        />
                    ))
                )}
            </div>

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
