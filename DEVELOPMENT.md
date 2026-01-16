# Licium - Development & Deployment Guide

This document serves as a "memory" for the AI agent (and developers) regarding the build, deployment, and operation of the **Licium** application.

## 1. Architecture Overview
- **Frontend**: React (Vite) + Toast UI Editor (WYSIWYG Markdown)
- **Backend**: Node.js (Express) + PostgreSQL
- **Database**: PostgreSQL (StatefulSet in K8s / container in Compose)
- **Security**: 
    - **Containers**: Non-root execution (`node` and `nginx` users).
    - **Frontend**: Nginx on port 8080 (rootless).
    - **Backend**: Helmet & Rate Limiting enabled.
- **Infrastructure Options**:
    - **Docker Compose** (Local recommended)
    - **Kubernetes** (Production, Manifests or Helm)
- **Integrations**:
    - **Search**: SearXNG (Metasearch, JSON output)
    - **Diagrams**: Draw.io (Self-hosted or Cloud)
    - **Embeddings**: Local TEI (Hugging Face Text Embeddings Inference)
    - **Scraping**: Cheerio (HTML Parsing for Web RAG)

### 1.1 Branding & Identity
- **Name**: Licium
- **Assets**:
    - **Logo**: `/logo_new.jpg` (Used in Login and Branding).
    - **Favicon**: `/icon_32x32.png` (Browser Tab).
    - **App Icon**: `/icon_32x32@2x.png` (Header Icon).
    - **Theme**: **Steel Blue** (`#4580a5`) primary color with secondary Cyan/Teal accents.
        - *Note*: Tailwind configuration overrides the default `blue` palette with this brand color.
    - **Dark Mode**: Fully supported (Slate/Gray palette).

### 1.2 Mobile Architecture
- **Responsive Strategy**:
    - **Desktop**: Split-Pane Layout (Resizable) using `react-resizable-panels`.
    - **Mobile (<768px)**: Full-Screen Overlay Layout.
        - Explorer and Chat open as absolute positioned layers over the Editor.
        - Exclusive toggling (opening one closes the other) to save space.
- **Viewport Management**:
    - Uses `position: fixed; inset: 0` to robustly handle mobile browser URL bars (Safari iOS).
    - Meta Viewport set to `viewport-fit=cover` and `user-scalable=no` for app-like feel.
    - **Navigation**: Tapping the "Licium" logo in the header closes any open sidebars (Explorer/Chat) to return focus to the Editor.

### 1.3 UI Layout & Toolbar Heights
- **Unified Toolbar Heights**: All horizontal toolbars use consistent `46px` height for visual harmony.
    - **Explorer**: Header (46px) + Search Row (46px)
    - **Editor**: Status Bar with save controls (46px) + Toast UI Toolbar (46px, CSS override)
    - **AI Assistant**: Header with model selector (46px) + Privacy Notice (46px)
- **Consistent Coloring**: All primary actions (Save, Insert Diagram, Mic, etc.) use the **Corporate Blue** (`text-blue-600`) to match the Note symbols in the Explorer, creating a visual link between "Note Management" and "Editing Tools".
- **CSS Variable**: `--toolbar-height: 46px` defined in `:root` for consistency.
- **Toast UI Override**: Custom CSS in `index.css` forces Toast UI toolbar to 46px height.


## 2. Docker Registry
- **Registry Host**: Docker Hub (`natorus87`)
- **Images**:
    - Server: `natorus87/licium-server`
    - Client: `natorus87/licium-client`
- **Auth**: Standard Docker Hub authentication.

## 3. Build & Push Commands

### Server
```bash
# Multi-Arch Build & Push (AMD64 + ARM64)
sg docker -c "docker buildx build --platform linux/amd64,linux/arm64 -t natorus87/licium-server:latest --push ./server"
```

### Client (Frontend)
```bash
# Multi-Arch Build & Push (AMD64 + ARM64)
# Note: --no-cache is often recommended for frontend to ensure clear asset hashing
sg docker -c "docker buildx build --no-cache --platform linux/amd64,linux/arm64 -t natorus87/licium-client:latest --push ./client"
```

## 4. Deployment Options

### Option A: Docker Compose (Local Dev/Usage)
The easiest way to run the full stack including Draw.io and SearXNG.
```bash
docker-compose up -d
```
- **Frontend**: http://localhost:8080
- **Backend**: http://localhost:3001
- **Draw.io**: http://localhost/drawio
- **SearXNG**: http://localhost/search

### Option B: Kubernetes (Helm Chart)
For advanced deployments.
```bash
helm install licium ./charts/licium
```
See `charts/licium/values.yaml` for configuration.

### Option C: Kubernetes (Raw Manifests)
Manual application of resources.
```bash
kubectl apply -f k8s-conbro/
```
*Note*: `k8s-conbro/ingress.yaml` is provided as a template. You must configure your own Ingress Controller.

## 5. Updates & Redeployment
When working with Kubernetes (Option B or C), simply restarting a Pod is not enough to apply code changes because the deployment pulls from a container registry.

**Workflow for Code Updates:**
1.  **Build & Push (Multi-Arch)**:
    ```bash
    sg docker -c "docker buildx build --no-cache --platform linux/amd64,linux/arm64 -t natorus87/licium-client:latest --push ./client"
    ```
3.  **Restart** the deployment (pulls new image):
    ```bash
    kubectl rollout restart deployment frontend
    ```
    *(Ensure `imagePullPolicy: Always` is set in your manifest. **IMPORTANT**: The image tag must ALWAYS be `latest`. Do not use versioned tags for deployment metadata to simplify the CD pipeline.)*

## 6. Important File Locations
- **Backend Routes**: `server/src/routes.ts`
- **Database Schema**: `server/src/db.ts`
- **Frontend Editor**: `client/src/components/Editor.tsx`
- **Helm Chart**: `charts/licium/`
- **K8s Configs**: `k8s-conbro/*.yaml`
- **Compose Config**: `docker-compose.yml` & `docker-compose-nginx.conf`

## 7. Domains & Networking
The application is designed to be domain-agnostic but defaults to `licium.local` for Kubernetes examples.

- **Draw.io Integration**:
    - Expects `DRAWIO_BASE_URL=/drawio`
    - In K8s/Compose, proxied via Nginx/Ingress to `/drawio`.
    - **External Access**: Routed via `/draw` path prefix (rewritten to `/` for the container).
    - **CSP**: Requires `connect-src 'self' data: blob:` to allow saving diagrams.
- **SearXNG Integration**:
    - Expects `SEARXNG_BASE_URL` to match the external URL (e.g., `http://localhost/search` or `http://licium.local/search`).
    - API usage requires `&format=json`.

### 7.1 Ingress Configuration (Traefik)
- **TLS Termination**: Handled by external Load Balancer (Relianoid).
- **EntryPoints**: Traefik listens on `web` (HTTP) port `8000`.
- **IngressRoute**: Defines routing rules.
    - Path `/draw`: Route to Draw.io service (requires `PathPrefix`).
    - Path `/`: Route to Frontend service.

## 8. Features & Implementation Status
- **Chat Modes**: Summary, Rewrite, Structure, ELI5, etc.
- **Prompt Localization**: The backend automatically localizes system prompts and mode instructions (Summarize, Rewrite, Structure) based on the user's interface language (supporting DE, EN, FR, IT, ES, NL).
- **Audio Transcription**: 
    -   Uses **Whisper** (faster-whisper-server) for local Speech-to-Text.
    -   **Model**: `deepdml/faster-whisper-large-v3-turbo-ct2` (int8 quantization).
    -   **Performance**: Supports long audio files via SSE (Server-Sent Events) progress tracking and optimized timeouts (30m).
- **Search**: Uses SearXNG for "Web Search" capability.
- **Providers (Multi-LLM)**:
    - **OpenAI**: Requires API Key, defaults to `gpt-4o`.
    - **Ollama**: Local AI (Privacy-focused), defaults to `llama3`.
    - **Custom**: Support for generic OpenAI-compatible endpoints.
    - **Default Selection**: Users can explicitly set a "Standard" (Default) provider in Settings. This selection (`localActiveProviderId`) is persisted in `global_settings` and overrides the default "first-in-list" behavior.
- **Privacy Mode**: Explicit visibility into data flow (Local vs. External) with UI warnings.
- **UI Enhancements**:
    - **Smart Labels**: Chat history displays concise labels (e.g., "Summarize") instead of full prompt text. Full text available via tooltip.
    - **Payload Sanitization**: Client automatically strips UI-only fields (like `label`) before sending requests to backend to prevent `422` validation errors from strict LLM providers.
    - **Settings Refactor**:
        - **Global Tools Tab**: Consolidated "Draw.io" and "Web Search" into a unified "Tools" (Werkzeuge) tab.
        - **Global Search Config**: Moved SearXNG URL to global scope, removing redundant per-provider fields.
        - **Mobile Optimized**: Settings tabs are scrollable on mobile devices (`overflow-x-auto`) to ensure accessibility of all sections.

### Editor
- **Toast UI**: v3.2.3 with Plugins (Chart, UML, Merged Cell, Color Syntax).
- **Images**: Drag & drop support with custom resizing logic (`|s`, `|m`, `|l` suffix).
- **Video**: YouTube auto-embed widget with alignment support (`|left`, `|center`, `|right`).
- **Import/Export**: Supports Markdown (`.md`), Text (`.txt`), and PDF (Clean Print View).
- **Printing**: Uses robust Iframe Isolation to ensure clean PDF generation without UI artifacts.
-   **Version History**: Automatic tracking of last 10 versions with custom restore modal.
-   **Toolbar**: Reordered buttons for better logical grouping (History moved to end).
-   **Stats**: Real-time Word and Character counter (multilingual, strips Markdown/HTML for accuracy).
-   **Responsive**:
    -   Mobile (< 768px): Collapses generic tools (Diagram, Import/Export, History) into a "Menu" dropdown to save space.
    -   Word counter overlay positioning adapted for mobile.

### AI Assistant (Chat)
-   **Quick Prompts**:
    -   **Refactor**: Replaced "Task" action with "Spelling" (Rechtschreibung) for better utility.
    -   **Custom Prompts**: Fully editable (Label & Prompt text).
    -   **Mobile Layout**: Pagination adjusts to screen size (4 items/page on mobile, 6 on desktop).
-   **Cloud Sync**:
    -   **Feature**: Custom prompts are synchronized across devices via the backend (`user_settings` table).
    -   **Migration**: LocalStorage prompts are automatically uploaded to the server on first login.

### File Management
- **Explorer**: Tree view with Drag & Drop (Optimized Stacked Layout).
- **Context Menu**: Right-click actions for New Note/Folder, Rename, Duplicate, and Delete.
- **Search**: Global content search with integrated UI.

### Internationalization (i18n)
- **Languages**: Full support for **6 Languages**:
    -   English (`en`)
    -   German (`de`)
    -   French (`fr`)
    -   Italian (`it`)
    -   Spanish (`es`)
    -   Dutch (`nl`)
- **Scope**: All UI elements, including complex settings (LLM, Embeddings, Tools, Account, **User Management**) and dynamic labels (including **input placeholders**) are fully translated.
- **Auto-detection**: Defaults to browser language or user preference.

### Audio Transcription
- **Engine**: Local Whisper (via `fedirz/faster-whisper-server`).
- **Integration**:
    - **Frontend**: `AudioRecorder` component with visual feedback (waveform/status).
    - **Backend**: `/api/transcribe` endpoint proxies audio to Whisper service.
    - **Status Check**: `/api/status/whisper` endpoint ensures model is ready (loaded in VRAM) before recording starts.
- **Features**:
    - **Language Awareness**: automatically passes the active UI language to Whisper.
    - **Multilingual Support**: Fully localized recording interface (DE, EN, FR, IT, ES, NL) that adapts to user preference.
    - **Dynamic Configuration**: Removed hardcoded `WHISPER_LANGUAGE` env var in K8s to allow per-request language switching.
    - **Model**: Defaults to `small` (INT8 quantized) for balance of speed/quality.
    - **Limits**: Increased backend upload size to **100MB** and processing timeout to **30 Minutes** to support long lectures/meetings.
    - **UI**: Dedicated microphone button in the **Editor** toolbar and **Chat** input area. Supports "Loading" state for cold starts.

### RAG & Embeddings
- **Architecture**:
    - **Database**: `pgvector` extension enabled. Table `note_embeddings` stores vectors and content hashes.
    - **Model**: Local `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions).
    - **Service**: Hugging Face TEI (`ghcr.io/huggingface/text-embeddings-inference:cpu-1.8`) for optimized CPU inference.
    - **Chunking**: Server-side chunking (max 512 chars) to respect model token limits.
- **User Config**:
     - **Settings -> LLM**: Admin can define embedding providers (OpenAI, Ollama, or Local Transformers).
     - **RAG Toggle**: Users can enable/disable "Database Context" (Database Icon) to include snippets from *other* notes.
     - **Note Context Toggle**: Users can enable/disable sending the **current note's content** (Document Icon) for privacy control.
- **Indexing Strategy**:
    - Updates occur asynchronously on Note Save.
    - `content_hash` check prevents unnecessary re-embedding of unchanged notes.

### Web RAG (Search with Embeddings)
- **Goal**: Provide deep, grounded answers by reading actual web page content instead of just search snippets.
- **Pipeline**:
    1. **Search**: SearXNG retrieves top URL results.
    2. **Scrape**: Backend fetches top 3 URLs and parses HTML (via `cheerio`) to extract clean text.
    3. **Chunk & Embed**: Page text is split into chunks (512 chars) and vectorized.
    4. **Re-Ranking**: Chunks are compared (Cosine Similarity) against the user query.
    5. **Context**: Top 5 most relevant chunks are injected into the LLM system prompt.

### Info Tab
- **Location**: Settings → Info (last tab in Settings modal)
- **Purpose**: Display system information and version details
- **Content**:
    - **Application Info**: Name (Licium), License (Apache 2.0), Copyright (© 2025 Natorus87)
    - **Versions**: 
        - Frontend version (from `client/package.json`)
        - Backend version (from `server/package.json` via `/api/system/info`)
        - Build date (formatted per user language)
    - **System Info**:
        - Node.js version
        - Database connection status (color-coded: green=connected, red=disconnected)
        - Server uptime (formatted as "Xd Xh Xm")
    - **Links**: GitHub Repository, Documentation
- **Multilingual**: Fully localized in all 6 supported languages
- **API Endpoint**: `/api/system/info` (authenticated) returns backend metadata

### Version Management
- **Current Versions**: Frontend `0.9.10`, Backend `0.9.10`
- **Location**: Versions are stored in `package.json` files:
    - `client/package.json` → Frontend version
    - `server/package.json` → Backend version
- **Update Process**:
    1. **Manual**: Edit the `"version"` field in package.json (e.g., `"1.0.0"` → `"1.1.0"`)
    2. **With npm**: Run `npm version patch|minor|major` in the respective directory
    3. **Rebuild & Deploy**: After version change, rebuild Docker images and restart deployments
- **Semantic Versioning (SemVer)**: `MAJOR.MINOR.PATCH`
    - **MAJOR**: Breaking changes
    - **MINOR**: New features (backward compatible)
    - **PATCH**: Bug fixes
- **Display**: Versions are automatically shown in Settings → Info tab

### Licensing
- **Apache 2.0**: Source code is open, but **Trademarks ("Licium", "Natorus87")** are protected.

## 9. Known Issues & Troubleshooting

### iOS PWA Home Screen Icon (Apple Touch Icon)

**Problem**: When adding the web app to iOS home screen, Safari shows a generic letter ("L") instead of the icon.

**Status**: ✅ **Resolved** (as of 2025-12-21)

**Resolution**: The issue was resolved when the application received a proper SSL certificate and became accessible from the internet. Safari now correctly displays the apple-touch-icon.

**What was tried:**
1. Multiple icon sizes (180x180, 167x167, 152x152, 120x120) per Apple spec.
2. Standard filenames (`apple-touch-icon.png`) at root.
3. Versioned filenames (`-v2`, `-v3`, `-final`) for cache busting.
4. `apple-touch-icon-precomposed` tag (legacy).
5. `crossorigin="anonymous"` attribute.
6. Transparent PNG vs. opaque white background.
7. `include /etc/nginx/mime.types` in nginx config.
8. Explicit `location = /apple-touch-icon.png` block in nginx.
9. Caching headers (`Cache-Control: public, immutable`).
10. `vite-plugin-pwa` (failed due to Node version incompatibility).

**Current Configuration (v12):**
```html
<!-- index.html -->
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">
<link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167x167.png">
<link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">
<link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">
<meta name="apple-mobile-web-app-title" content="Licium">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

```nginx
# nginx.conf
location = /apple-touch-icon.png {
    alias /usr/share/nginx/html/apple-touch-icon.png;
    add_header Cache-Control "public, max-age=86400";
}
```

**Icon Generation Script**: `client/create_icon.cjs` (uses `jimp` to generate from `icon_512x512.png`).

**Debugging Steps:**
1. Test direct URL access: `https://licium.local/apple-touch-icon-180x180.png`
2. Check response headers: `curl -I https://licium.local/apple-touch-icon.png`
3. Verify `Content-Type: image/png` is returned.
4. Check Traefik/Ingress logs for redirects or auth challenges.

**Note**: `%PUBLIC_URL%` is a Create React App feature. This project uses **Vite**, which serves `public/` files at root directly.


### iOS PWA Status Bar & Layout

**Problem**: Achieving a native-like status bar that adapts to Dark Mode (dark background with light text) on iOS PWA without breaking the layout.

**Solution (Final Working Configuration):**

1.  **Status Bar Style**: Use `apple-mobile-web-app-status-bar-style` content="**black-translucent**".
    - This causes the webview to extend under the status bar, creating a seamless native-like appearance
    - The status bar automatically adapts: light text on dark background in dark mode, dark text on light background in light mode

2.  **Selective Safe-Area Padding**: Apply padding **only where needed**:
    - **Header** ([App.tsx:114](file:///home/sb/ai-notebook/ai-notebook/client/src/App.tsx#L114)): Uses `pt-[env(safe-area-inset-top)]`
      - Prevents header icons from being covered by the status bar
    - **Input Area** ([Chat.tsx:296](file:///home/sb/ai-notebook/ai-notebook/client/src/components/Chat.tsx#L296)): Uses standard `pb-2` padding
      - Allows input to sit at the bottom edge without excessive spacing
    - **Global #root** ([index.css:38](file:///home/sb/ai-notebook/ai-notebook/client/src/index.css#L38)): **NO** safe-area padding
      - Prevents global CSS from overriding component-level choices
      - Critical: Global padding was the initial cause of layout issues

3.  **Theme Color Meta Tags**: Two `theme-color` meta tags with media queries provide browser compatibility:
    ```html
    <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#1f2937" media="(prefers-color-scheme: dark)">
    ```

4.  **Dynamic Theme Override**: JavaScript in `App.tsx` monitors the in-app Theme Toggle and updates the `theme-color` meta tag, removing the `media` attribute to override system preferences.

5.  **Cache Busting**: Manifest link includes version query parameter: `<link rel="manifest" href="/manifest.json?v=2">`.

**Status**: ✅ **Working** (Adaptive Status Bar + Stable Layout).
- The status bar adapts to dark/light mode automatically
- Header content is fully visible (not covered by status bar)
- Input area sits at bottom edge without excessive spacing
- Layout is stable across all iOS devices with proper safe-area handling

**Key Insight**: The solution required removing global safe-area padding from `#root` while selectively applying it only to the header component. Bottom padding must remain minimal for the edge-to-edge native appearance.



### Editor Toolbar Overflow (Mobile/Responsive)

**Problem**: The editor toolbar's overflow button ("...") was missing on narrow screens, preventing access to hidden tools.
**Root Cause**: Forced `display: flex !important` in `index.css` overrode Toast UI Editor's internal overflow calculation logic.
**Solution**: Removed the forced Flexbox styles from `client/src/index.css`. The editor now correctly calculates available space and shows the overflow menu.

### Note Synchronization & Auto-Refresh

**Problem**: Notes content could become asynchronous (stale) when working across multiple devices or tabs. New notes created on one device were not appearing on others without a manual reload.
**Solution**:
1.  **Passive Refresh**: Implemented a global `visibilitychange` and `focus` listener in `App.tsx` that triggers a full file tree refresh (`fetchTree()`) whenever the app becomes visible or focused.
2.  **Aggressive Refresh**:
    -   **On Folder Open**: Expanding a folder in `TreeView.tsx` triggers `fetchTree()`.
    -   **On Note Select**: Clicking a note triggers both `fetchNoteContent(id)` (for fresh content) and `fetchTree()` (to ensure the list is current).
    -   This redundant approach ensures reliable updates even on platforms like iOS PWA where background event reliability can vary.

### Explorer State Persistence

**Problem**: The file explorer lost its expanded/collapsed state upon page refresh or when toggling the sidebar on mobile, forcing the user to re-navigate.
**Solution**:
-   Introduced `expandedNodeIds` state in `store.ts` backed by `localStorage` persistence.
-   Updated `TreeView.tsx` to use this global state instead of local component state.
-   Folders now remain open/closed exactly as left, preserving user context across sessions.

### Print & PDF Export Architecture

**Challenge**: Achieving professional PDF output from a web-app, including correct filenames and clean layout, while maintaining a static browser tab title ("Licium") during normal use.

**Solution Overview**:
1.  **Layout (`print.css`)**:
    -   A dedicated stylesheet uses `@media print` to hide UI elements (Sidebar, Header, Chat) via `print:hidden` utility classes.
    -   Forces `overflow: visible` and `height: auto` on the root container to enable correct multi-page pagination.

2.  **PDF Filenames & Title Sync**:
    -   **Problem**: Browsers use the `<title>` tag for the suggested filename. A static title ("Licium") results in generic filenames ("Licium.pdf").
    -   **Strategy**: Implemented event-driven synchronization in `App.tsx` using `beforeprint` and `afterprint`.
        -   **On Print Request**: The app detects the `beforeprint` event (triggered by Ctrl+P or menu print) and instantly swaps `document.title` to the **active Note's Title**.
        -   **After Print**: The `afterprint` event triggers immediately after the dialog closes (or generation starts), forcing the title back to "Licium".
    -   **Result**: The user sees a clean, static tab title, but gets correctly named PDF files.

3.  **Export Button Integration**:
    -   The "Export -> PDF" feature (using an iframe) injects the dynamic `${selectedNoteTitle}` directly into the hidden iframe's `<title>` tag, ensuring consistent behavior with standard browser printing.

### Mobile Swipe Navigation

**Feature**: Horizontal swipe gestures to navigate between main views on mobile devices (< 768px).
**Implementation**:
-   Used `react-swipeable` to detect gestures.
-   **Logic**:
    -   **Swipe Left**: Move Viewport Right (Explorer -> Editor -> Chat).
    -   **Swipe Right**: Move Viewport Left (Chat -> Editor -> Explorer).
-   **Context Awareness**: Gestures are disabled on desktop to prevent conflict with text selection or other interactions.

### Audio Transcription Timeouts

**Problem**: Long audio files (> 5 minutes) failed to transcribe with vague errors or stuck loading states.
**Root Cause**:
1.  **Ingress Body Size**: Default limit was too small.
2.  **Timeouts**: Default timeouts (60s) were shorter than Whisper CPU inference time.

**Solution (Traefik)**:
-   **Middleware**: Created `k8s-conbro/middleware-limits.yaml` with `maxRequestBodyBytes: 104857600` (100MB).
-   **IngressRoute**: Applied middleware to `/api` route in `k8s-conbro/ingress-route.yaml`.
-   **Backend**: 
    -   Increased Multer limit to 100MB.
    -   Removed `Content-Type` header in Axios (letting it handle boundary).
    -   **CRITICAL**: Set `server.setTimeout(1800000)` in `server/src/index.ts` because Node.js defaults to 2 minutes, killing the connection even if Axios waits longer.
-   **Traefik Timeouts**:
    -   Created `k8s-conbro/transport-timeout.yaml` (`ServersTransport`) to force 30m read timeouts.
    -   Annotated backend Service to use this transport to prevent 500/504 Gateway errors.
-   **External Load Balancer (Relianoid)**:
    -   Must increase `Backend response timeout` and `Client request timeout` to **1800s** (30m).
    -   Default of 45s causes connection drops even if the cluster is correctly configured.
-   **Keep-Alive (SSE)**:
    -   **Problem**: Even with long timeouts, silence on the wire can cause Load Balancers to drop the connection.
    -   **Solution**: Refactored `/api/transcribe` to use **Server-Sent Events** (`text/event-stream`).
        -   Sends `{"status": "processing"}` every 10 seconds (heartbeat).
        -   Sends `{"status": "complete", "text": "..."}` upon completion.
    -   **Frontend**: Switched from Axios to `fetch` + `ReadableStream` to consume these updates.
-   **Audio Format**:
    -   **Critical Fix**: Ensure the backend sends the file to Whisper as `recording.webm` (if the source is WebM).
    -   Sending `.wav` extension for WebM content caused ffmpeg/Whisper to miscalculate duration, cutting off transcription after a few seconds.
-   **Whisper Optimization**:
    -   Set `WHISPER_COMPUTE_TYPE` to `float32` (CPU-optimized, fixes int8 warnings).
    -   Added `k8s-conbro/whisper-pvc.yaml` to cache models (prevents re-download on pod restart).

**Status**: ✅ **Resolved** (Supports ~30+ min recordings with progress feedback).

### Toast UI Editor Theme Artifacts

**Problem**: When switching between Light and Dark mode, the Editor would sometimes retain styles from the previous theme (e.g., white toolbar in dark mode) until a page refresh.
**Root Cause**: The `ToastEditor` component does not natively support dynamic theme switching without re-initialization. Merely changing the `theme` prop wasn't sufficient to flush internal state/CSS classes.
**Solution**: 
1.  **State Centralization**: Moved `darkMode` state from local `App.tsx` state to global `store.ts` to ensure `Editor.tsx` has reactive access to the theme preference.
2.  **Forced Remount**: Added a `key={darkMode ? 'dark' : 'light'}` prop to the `ToastEditor` component. This forces React to unmount and remount the editor instance whenever the theme changes, ensuring a clean initialization with the correct style sheets.

**Note on Toolbar Styling**: Attempts to override the Toast UI toolbar background color (to match the exact `gray-800` of the application header) using `!important` CSS rules are **discouraged**. Such overrides inevitably break the contrast or visibility of internal popups (like the Table Creation Grid) which inherit these styles. The default Toast UI Dark Theme (`#2f3235`) is accepted as a compromise for stability.

### Editor Autosave Race Condition
**Problem**: Notes content could be overwritten with empty data during drag-and-drop operations in the Tree View.
**Root Cause**: The `Editor` component's `setMarkdown` method (used to sync local state with global store updates) triggered the `onChange` event listener. This listener then updated the store again, potentially triggering a debounced autosave with incomplete content if the editor was in the process of remounting or initializing.
**Solution**: Implemented a recursion guard (`isInternalUpdate` ref) in `Editor.tsx`.
-   When `setMarkdown` is called programmatically (to sync state), `isInternalUpdate` is set to `true`.
-   The `onChange` handler checks this flag and aborts immediately if true, preventing the autosave loop.

### Mobile Settings Tab Overflow

**Problem**: On mobile devices, the Settings tab bar was cut off, making "Users" and "Account" tabs inaccessible.
**Solution**:
-   Applied `overflow-x-auto` to the tab container (with `no-scrollbar` utility).
-   Added `shrink-0` and `whitespace-nowrap` to tab buttons to prevent collapsing.
**Status**: ✅ **Resolved**

### Registry Access Troubleshooting

**Problem**: The internal Docker registry (`10.43.x.x`) may occasionally be unreachable from the development environment (e.g., connection timed out or network unreachable), preventing image pushes.

**Workaround (TTL.sh)**:
If the primary registry is down, you can use `ttl.sh` (an ephemeral, anonymous, public registry) to unblock deployment.
1.  **Build & Push**:
    ```bash
    docker build -t natorus87/licium-client:latest
    docker push natorus87/licium-client:latest
    ```
2.  **Update Manifest**:
    -   Edit `k8s-conbro/frontend.yaml` to use the `ttl.sh/...` image.
3.  **Deploy**:
    ```bash
    kubectl apply -f k8s-conbro/frontend.yaml
    kubectl rollout restart deployment frontend
    ```
4.  **Revert**: Remember to switch back to the official registry once connectivity is restored.

### Kubernetes Deployment Not Updating
**Problem**: After pushing a new image to Docker Hub, the application (`kubectl rollout restart`) still serves old code.
**Root Cause**:
1.  **Image Tag**: Using `latest` without `imagePullPolicy: Always` causes Kubernetes to use the cached local image.
2.  **Manifest Drift**: The deployment manifest (`k8s-conbro/frontend.yaml`) might still be pointing to a temporary debug image (e.g., `ttl.sh/...`) instead of the official registry.
**Solution**:
-   Verify `k8s-conbro/frontend.yaml` `image` field is `natorus87/licium-client:latest`.
-   Ensure `imagePullPolicy: Always` is set.
-   Run `kubectl rollout restart deployment frontend -n licium`.

### Kubernetes Deployment Not Updating
**Problem**: After pushing a new image to Docker Hub, the application (`kubectl rollout restart`) still serves old code.
**Root Cause**:
1.  **Image Tag**: Using `latest` without `imagePullPolicy: Always` causes Kubernetes to use the cached local image.
2.  **Manifest Drift**: The deployment manifest (`k8s-conbro/frontend.yaml`) might still be pointing to a temporary debug image (e.g., `ttl.sh/...`) instead of the official registry.
**Solution**:
-   Verify `k8s-conbro/frontend.yaml` `image` field is `natorus87/licium-client:latest`.
-   Ensure `imagePullPolicy: Always` is set.
-   Run `kubectl rollout restart deployment frontend -n licium`.

### Default Settings & Persistence (Ollama Deletion)
**Problem**: Users deleted the default "Ollama" provider, but it reappeared after a page reload.
**Root Cause**: The `fetchGlobalSettings` logic in `store.ts` contained a safety fallback that aggressively restored *missing* default providers (`default-ollama`, `default-openai`, `default-embeddings`) if they weren't found in the response, assuming they were accidentally missing.
**Solution**: 
-   Updated `fetchGlobalSettings` to EXCLUDE these specific IDs from the restoration logic.
-   The only provider that is still auto-restored if missing is `default-whisper` (as it's critical for audio).
-   **Lesson**: Do not implement "safety nets" for user-deletable content without checking if the user *intentionally* deleted it (or just rely on the database state).

## 10. Infrastructure Security
The application relies on Kubernetes primitives for security rather than application-level user tokens.

### API Security (Bearer Token)
- **Goal**: Protect API endpoints from unauthorized automated access.
- **Mechanism**:
    - **Secret**: Stored in `k8s-conbro/secrets.yaml` (key: `api-token`).
    - **Backend**: Validates `Authorization: Bearer <TOKEN>` against `IB_API_TOKEN` environment variable for service-to-service calls.
    - **Features**:
        - **Session-Only Auth**: Client API access is strictly cookie-based (`connect.sid`).
        - **Helmet**: Adds security headers (HSTS, etc.).
        - **Rate Limiting**: 
            - Global: 100 requests per 15 minutes.
            - **Login**: Strict limit of 5 attempts per minute per IP to prevent credential stuffing.
        - **Non-Root**: Service runs as `node` user.

### Service Protection (Basic Auth)
- **Goal**: Protect external access to auxiliary tools (Draw.io, SearXNG).
- **Mechanism**: Traefik Middleware `drawio-basic-auth` (using `k8s-conbro/secrets.yaml`) enforces Basic Auth on `/drawio` and `/search` routes.
- **App Integration**:
    - **Draw.io**: The application uses a backend proxy (`/api/drawio`) to access the internal service (`http://drawio:8080`), bypassing Basic Auth for logged-in users.
    - **SearXNG**: The backend accesses the internal service (`http://searxng:8080`) directly for LLM searches. External access to the SearXNG UI remains protected by Basic Auth.

## 11. Audio Transcription Configuration

The application uses a local Whisper service (`faster-whisper-server`) for audio transcription. Correct configuration is critical for functionality.

### Critical Settings
These settings are auto-configured in `store.ts` via a hotfix but must be maintained in any manual configuration:

- **Provider**: Local Whisper
- **Base URL**: `http://whisper:8000/v1/audio/transcriptions`
  - **Important**: You MUST include the full path `/v1/audio/transcriptions`. Using just `http://whisper:8000` will result in `405 Method Not Allowed`.
- **Model**: `deepdml/faster-whisper-large-v3-turbo-ct2`
  - **Important**: You MUST include the `deepdml/` prefix. The server image (`fedirz/faster-whisper-server`) requires the full HuggingFace ID for this specific model. Using just `faster-whisper-large-v3-turbo-ct2` will result in `500 Internal Server Error` (Invalid model size).

### Docker Registry
The official Docker images are now hosted on Docker Hub under the `natorus87` namespace:
- Client: `natorus87/licium-client:latest`
- Server: `natorus87/licium-server:latest`

**Note**: `ttl.sh` is no longer the primary registry but remains a fallback option for ephemeral testing.

### TUI Editor Migration
The editor has been migrated from `@toast-ui` to `@licium` scoped packages to support custom plugins and fixes.

- **Package**: `@licium/react-editor`
- **Plugins**:
    - `chart`, `uml`, `code-syntax-highlight`, `color-syntax`, `table-merged-cell` (Ported)
    - `details` (New: `<details>` support)
    - `text-align` (New: Text alignment)
    - `emoji` (New: Emoji picker)

#### CSS Customization
For Dark Mode refinement, the editor toolbar consumes a CSS variable. To match the application header color (e.g., `#1f2937`), define:
```css
.dark .toastui-editor-defaultUI-toolbar {
  --toastui-editor-toolbar-bg: #1f2937;
}
```
Direct `background-color` overrides are supported as a fallback but the variable approach is preferred for `@licium` packages.

### Release Process
Releases are managed via GitHub CLI (`gh`).

**To create a new release:**
1. Update version in `client/package.json` and `server/package.json`.
2. Update `CHANGELOG.md` with new changes.
3. Commit and push:
   ```bash
   git add .
   git commit -m "chore: release vX.Y.Z"
   git push
   ```
4. Create the release on GitHub:
   ```bash
   gh release create vX.Y.Z --title "vX.Y.Z - <Title>" --notes-file CHANGELOG.md
   ```
   *Note: This will automatically create the tag and the release on GitHub.*

## 12. Tree View & Navigation
Features related to the Sidebar/Explorer file tree.

### Drag & Drop Reordering
**Problem**: Browsers often block `drop` events if the drop target is the same element as the draggable element.
**Solution**:
- **Structure**: Separated the node component into an **Outer Wrapper** (Drop Zone) and an **Inner Element** (Draggable).
- **Logic**:
  - **Stateless Calculation**: `onDrop` calculates drop position (Top/Inside/Bottom) based on mouse geometry relative to the target rect, independent of potentially stale state.
  - **API**: `PUT /notes/reorder` handles batch updates of `position` and `parent_id`.

### Auto-Sort
**Goal**: Allow users to automatically organize notes/folders without manual dragging.
**Endpoint**: `POST /notes/sort`
**Logic**:
1. **Numeric Prefix**: Items starting with numbers (e.g., "1. Intro", "10. Summary") are sorted numerically (1 < 2 < 10).
2. **Alphabetical**: Remaining items (or items with same number) are sorted alphabetically (A-Z, case-insensitive).
**UI**: Accessible via the "Sort" (ArrowUpDown) button in the Sidebar header.

### Editor Toolbar Responsiveness
**Problem**: On small screens, the fixed-width toolbar buttons provided by Toast UI Editor would get cut off.
**Solution**:
- **Native Overflow**: Reverted to fixed height but added `overflow: visible` to the toolbar container to allow the native "More" (⋮) menu to appear.
- **Button Sizing**: Applied `flex-shrink: 0` to toolbar groups to prevent buttons from being compressed before the overflow triggers.
- **Simplification**: Removed less commonly used buttons (`indent`, `outdent`) to save space.

## 13. Data Safety & Integrity (Critical)

### Folder Move Safety (Backend)
- **Problem**: Moving a folder into its own subdirectory creates an infinite loop (Cycle) in the tree structure.
- **Solution**:
  - **Cycle Detection**: The backend (`PUT /notes/reorder`) builds a temporary ancestor map of the move target. If the target's parent chain includes the node being moved, the operation is aborted.
  - **ACID Transactions**: All reordering operations are wrapped in `BEGIN ... COMMIT/ROLLBACK` blocks. If any part of the move fails (e.g., cycle detected), the database rolls back to its previous state, preventing partial updates and "orphaned" nodes.

### Startup Race Condition
- **Problem**: On slow connections, the Editor component might initialize and trigger an "Autosave" (sending an empty string) before the `fetchNoteContent` async call completes.
- **Solution**:
  - **Null State**: `selectedNoteContent` in `useStore` is now typed as `string | null` (previously just `string`).
    - `null` = Loading / Not yet known.
    - `""` = Explicitly empty note.
  - **Editor Guard**: The Editor component renders a loading spinner until `content !== null`.
  - **Save Guard**: `saveNoteContent` explicitly checks `if (targetContent === null) return;` to prevent overwriting server data with a client-side loading state.

### Frontend-Backend Property Sync
- **Caution**: The backend returns `content_markdown`. The frontend `store.ts` must map this correctly.
- **Regression**: A previous bug used `res.data.content` (undefined) which caused the app to hang in the loading state. Ensure strictly typed interfaces match the SQL query result columns.

