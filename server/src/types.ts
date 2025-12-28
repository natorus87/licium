export type NodeType = 'folder' | 'note';

export interface NoteNode {
    id: string;
    parentId: string | null;
    type: NodeType;
    title: string;
    contentMarkdown?: string; // Only for notes
    children?: NoteNode[]; // For tree structure (optional, or we can store flat and build tree)
    createdAt: string;
    updatedAt: string;
}

export interface AppData {
    root: NoteNode[];
}
