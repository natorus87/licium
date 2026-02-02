# Licium – Getting Started Guide

> **From Chaos to Order: Transform Your Notes with AI**

This comprehensive guide will help you install, configure, and master Licium – an intelligent knowledge management system that uses artificial intelligence to structure and enhance your thinking.

---

## Table of Contents

- [What is Licium?](#what-is-licium)
- [System Requirements](#system-requirements)
- [Installation](#installation)
  - [Quick Start with Docker Compose](#quick-start-with-docker-compose)
  - [Production Deployment with Kubernetes](#production-deployment-with-kubernetes)
- [First Steps](#first-steps)
  - [Creating Your Admin Account](#creating-your-admin-account)
  - [Configuring AI Providers](#configuring-ai-providers)
  - [Setting Up Voice Transcription](#setting-up-voice-transcription)
- [Working with the Interface](#working-with-the-interface)
  - [The Explorer Panel](#the-explorer-panel)
  - [The Rich Text Editor](#the-rich-text-editor)
  - [Managing Files and Folders](#managing-files-and-folders)
- [AI-Powered Features](#ai-powered-features)
  - [The AI Assistant](#the-ai-assistant)
  - [Voice Recording and Transcription](#voice-recording-and-transcription)
  - [RAG: Chat with Your Notes](#rag-chat-with-your-notes)
- [Advanced Topics](#advanced-topics)
  - [Plugins and Extensions](#plugins-and-extensions)
  - [Keyboard Shortcuts](#keyboard-shortcuts)
  - [Mobile Experience](#mobile-experience)
- [Troubleshooting](#troubleshooting)
- [Getting Help](#getting-help)

---

## What is Licium?

Licium is more than a note-taking application. It's a **second brain** that actively helps you organize, structure, and retrieve your knowledge.

**Core Philosophy:**
- **Capture fast, structure later** – Dump your thoughts freely; let AI help organize them.
- **Privacy first** – Run everything locally. Your data never leaves your infrastructure.
- **Intelligence built-in** – Chat with your notes, search semantically, transcribe voice memos.

**Key Features at a Glance:**

| Feature | Description |
|---------|-------------|
| **WYSIWYG Editor** | Rich text editing with full Markdown support |
| **Hierarchical Organization** | Unlimited folders and notes with drag-and-drop |
| **AI Chat** | Context-aware conversations powered by your choice of LLM |
| **RAG Search** | Ask questions and get answers based on your notes |
| **Voice Transcription** | Local speech-to-text using Whisper |
| **Diagrams** | Integrated Draw.io and Mermaid support |
| **Multi-language** | Available in German, English, French, Italian, Spanish, Dutch |

---

## System Requirements

### Minimum Requirements

| Component | Requirement |
|-----------|-------------|
| **RAM** | 4 GB (8 GB recommended with Whisper) |
| **Storage** | 10 GB free space |
| **Docker** | Docker 20.10+ with Compose v2 |
| **Browser** | Chrome, Firefox, Safari, or Edge (latest) |

### For Production (Kubernetes)

- Kubernetes 1.24+
- 2+ CPU cores per service
- Ingress controller (Traefik or Nginx)
- Persistent Volume provisioner

---

## Installation

### Quick Start with Docker Compose

This is the fastest way to get Licium running on your local machine or home server.

**Step 1: Clone the Repository**

```bash
git clone https://github.com/natorus87/licium.git
cd licium
```

**Step 2: Start the Application**

```bash
docker-compose up -d
```

**Step 3: Open in Browser**

Navigate to: **http://localhost:8080**

> **What gets deployed?**
> - `licium-client` – The web interface
> - `licium-server` – The API backend
> - `db` – PostgreSQL database with vector support
> - `whisper` – Speech-to-text service
> - `searxng` – Privacy-focused web search
> - `drawio` – Diagramming tool

**Step 4: Verify All Services**

Check that all containers are running:

```bash
docker-compose ps
```

All services should show status `Up` or `running`.

---

### Production Deployment with Kubernetes

For enterprise deployments requiring high availability and security.

**Prerequisites:**
- A running Kubernetes cluster
- `kubectl` configured for your cluster
- An Ingress controller (Traefik recommended)

**Step 1: Create Namespace**

```bash
kubectl create namespace licium
```

**Step 2: Configure Secrets**

Edit `k8s/secrets.yaml` and set secure values for:

| Secret | Description |
|--------|-------------|
| `POSTGRES_PASSWORD` | Database password |
| `JWT_SECRET` | Session signing key |
| `IB_API_TOKEN` | Internal service authentication |

```bash
kubectl apply -f k8s/secrets.yaml
```

**Step 3: Deploy All Resources**

```bash
kubectl apply -f k8s/
```

**Step 4: Configure Ingress**

Edit `k8s/frontend-ingress.yaml` to set your domain:

```yaml
spec:
  rules:
    - host: licium.yourdomain.com
```

Apply the changes:

```bash
kubectl apply -f k8s/frontend-ingress.yaml
```

---

## First Steps

### Creating Your Admin Account

When you first access Licium, you'll see the login screen.

1. Click **Register** to create a new account.
2. Enter your username and password.
3. Click **Create Account**.

> **Important:** The first user to register automatically becomes the **Administrator** with full system access.

**As an Administrator, you can:**
- Manage all user accounts
- Reset user passwords
- Configure AI providers
- Enable or disable public registration

---

### Configuring AI Providers

To unlock Licium's AI features, you need to connect at least one language model provider.

**Navigate to:** Settings (⚙️) → **AI Connections**

#### Option A: Local AI with Ollama (Recommended for Privacy)

If you have [Ollama](https://ollama.ai) installed:

1. Click **Add Provider**
2. Select **Ollama**
3. Enter the Base URL:
   - Same machine: `http://localhost:11434`
   - Docker: `http://host.docker.internal:11434`
   - Network: `http://your-server-ip:11434`
4. Click **Test Connection**
5. Select your preferred model from the dropdown

> **Tip:** For best results, use models like `llama3`, `mistral`, or `mixtral`.

#### Option B: Cloud AI with OpenAI

1. Click **Add Provider**
2. Select **OpenAI**
3. Enter your API Key (`sk-...`)
4. Select your preferred model (e.g., `gpt-4o`)
5. Click **Save**

#### Setting a Default Model

After adding providers, select your **Standard Model**. This model will be used automatically for all new conversations.

---

### Setting Up Voice Transcription

Licium uses a local Whisper server for speech-to-text conversion.

**Check Status:**
1. Go to Settings → **System Status**
2. Look for "Whisper Service"
3. Status should show: ✅ **Ready**

> **Note:** The first transcription may take 30-60 seconds while the model loads into memory.

**Supported Languages:**
German, English, French, Spanish, Italian, Dutch, and many more.

---

## Working with the Interface

### The Explorer Panel

The left sidebar is your note organization hub.

| Element | Function |
|---------|----------|
| **📁 New Folder** | Create a folder for organizing notes |
| **📄 New Note** | Create a new note in the current location |
| **⚡ Quick Note** | Instantly create a timestamped note |
| **🗑️ Trash** | View and restore deleted items |

**Quick Note Feature:**
Press the ⚡ lightning bolt to instantly create a note named with the current date and time (e.g., `2024-03-15_14-30`). Perfect for meeting notes or quick captures.

---

### The Rich Text Editor

Licium's editor combines the simplicity of visual editing with the power of Markdown.

**Two Editing Modes:**

| Mode | Description |
|------|-------------|
| **WYSIWYG** | Visual editing with toolbar buttons |
| **Markdown** | Direct Markdown syntax editing |

**Quick Insert Menu:**
Type `/` at the beginning of any line to open the quick insert menu:

- `/heading` – Insert headings (H1-H3)
- `/list` – Bullet or numbered lists
- `/task` – Checkbox task list
- `/table` – Insert a table
- `/code` – Code block with syntax highlighting
- `/image` – Insert an image
- `/quote` – Block quote
- `/details` – Collapsible section

**Working with Images:**
- **Paste:** Press `Ctrl+V` to paste images from clipboard
- **Drag:** Drag image files directly into the editor
- **Resize:** Right-click an image to access size options

---

### Managing Files and Folders

**Drag and Drop:**
- Drag notes between folders to move them
- Drag notes onto other notes to nest them
- Drag to reorder within a folder

**Context Menu (Right-Click):**
| Action | Description |
|--------|-------------|
| **Rename** | Change the note or folder name |
| **Duplicate** | Create a copy of the note |
| **Move to...** | Move to a different folder |
| **Delete** | Move to Trash |

**Trash and Recovery:**
- Deleted items go to Trash (not permanently deleted)
- Items in Trash are automatically removed after **30 days**
- Right-click items in Trash to **Restore** or **Delete Permanently**

---

## AI-Powered Features

### The AI Assistant

Access the AI Assistant by clicking the ✨ sparkle icon in the header.

**Chat Modes:**

| Mode | What it does |
|------|--------------|
| **Standard** | General conversation with the AI |
| **With Notes** | AI searches your notes for context before answering |
| **With Web** | AI can browse the web for current information |

**Quick Actions:**
Click the action buttons to quickly process your note content:

| Action | Result |
|--------|--------|
| **Summarize** | Create a concise summary |
| **Structure** | Organize unstructured text |
| **Key Points** | Extract main ideas as bullet points |
| **To-Dos** | Generate action items from text |
| **Rewrite** | Improve clarity and tone |
| **ELI5** | Explain in simple terms |

---

### Voice Recording and Transcription

Record voice memos and have them automatically transcribed to text.

**How to Record:**

1. Click the 🎤 microphone icon in the editor toolbar
2. Allow microphone access if prompted
3. Speak your note
4. Click **Stop** when finished
5. Wait for transcription to complete
6. Text appears automatically in your note

**Best Practices:**
- Speak clearly and at a normal pace
- Minimize background noise
- For long recordings (10+ minutes), expect 1-2 minutes processing time

> **Privacy Note:** All audio processing happens on your local server. No data is sent to external services.

---

### RAG: Chat with Your Notes

RAG (Retrieval-Augmented Generation) lets you ask questions and get answers based on your own notes.

**How It Works:**

1. When you save a note, Licium creates a semantic "fingerprint" (embedding)
2. When you ask a question with "Use Notes" enabled:
   - The system finds notes semantically related to your question
   - These notes are provided as context to the AI
   - You receive an answer grounded in your knowledge base

**Example Questions:**
- "What did I write about project deadlines?"
- "Summarize my notes on machine learning"
- "What were the key points from last week's meetings?"

**Tips for Better Results:**
- Write notes with clear, descriptive content
- Use specific terms consistently across related notes
- Keep individual notes focused on single topics

---

## Advanced Topics

### Plugins and Extensions

Licium includes several powerful plugins:

| Plugin | Description |
|--------|-------------|
| **Draw.io** | Create and edit professional diagrams |
| **Mermaid** | Text-based diagrams (flowcharts, sequence diagrams) |
| **Code Highlighting** | Syntax highlighting for 100+ languages |
| **Tables** | Advanced table editing with merged cells |
| **Details** | Collapsible `<details>` sections |
| **Emoji** | Emoji picker for quick insertion |

**Creating a Diagram:**
1. Click the diagram icon in the toolbar
2. Draw.io opens in a modal window
3. Create your diagram
4. Click **Save**
5. The diagram is embedded in your note (and remains editable)

---

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Force save |
| `Ctrl/Cmd + B` | Bold |
| `Ctrl/Cmd + I` | Italic |
| `Ctrl/Cmd + K` | Insert link |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `/` | Open quick insert menu |
| `Shift + Enter` | New line (in chat) |
| `Enter` | Send message (in chat) |

---

### Mobile Experience

Licium is fully responsive and works on smartphones and tablets.

**Mobile-Specific Features:**
- **Swipe Navigation:** Swipe to switch between Explorer and Editor
- **Quick Note:** One-tap note creation with automatic editor focus
- **Screen Wake Lock:** Screen stays on while editing or recording

**Touch Gestures:**
- Tap note to open
- Long-press for context menu
- Drag to reorder (touch and hold, then drag)

---

## Troubleshooting

### Common Issues and Solutions

**Problem:** AI doesn't know information that's in my notes

**Solutions:**
1. Ensure "Use Notes" is toggled **ON** in the chat
2. Wait a few seconds after saving for embeddings to update
3. Try rephrasing your question
4. Use a larger or more capable AI model

---

**Problem:** Voice transcription is not working

**Solutions:**
1. Check Settings → System Status → Whisper Service
2. Verify your microphone permissions in the browser
3. Check Docker logs: `docker logs whisper`
4. Ensure you have sufficient RAM (4GB+ recommended)

---

**Problem:** Editor styles look incorrect

**Solutions:**
1. Hard refresh the page: `Ctrl/Cmd + Shift + R`
2. Clear browser cache
3. Check if running the latest version

---

**Problem:** Notes not saving

**Solutions:**
1. Check your internet/network connection
2. Look for error messages in the browser console (F12)
3. Verify the backend is running: `docker logs licium-server`

---

## Getting Help

**Resources:**
- **GitHub Repository:** [github.com/natorus87/licium](https://github.com/natorus87/licium)
- **Issues & Bugs:** Create an issue on GitHub
- **Documentation:** See `DEVELOPMENT.md` for technical details
- **Changelog:** See `CHANGELOG.md` for version history

**Community:**
We welcome contributions! Check out the repository for contributing guidelines.

---

*Welcome to Licium. Start capturing your thoughts, and let AI help you make sense of them.*
