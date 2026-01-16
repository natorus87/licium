# Changelog

All notable changes to this project will be documented in this file.

## [0.9.12] - 2026-01-16
### Fixed
- **Data Protection (Critical)**:
  - **Shutdown Race**: Fixed a race condition where the Editor could overwrite note content with empty data if autosave triggered before the note was fully loaded (Startup Bug).
  - **Folder Moves**: Implemented atomic ACID transactions and cycle detection in the backend to prevent data corruption during folder reordering.
  - **Save Safety**: Added strict null-checks to the save logic to abort any operation if the source content is not fully initialized.
- **Frontend**: Fixed a regression where `content` vs. `content_markdown` property mismatch caused notes to hang in "Loading..." state.
- **Infrastructure**: Verified and stabilized multi-arch builds (`amd64`/`arm64`) for seamless deployment on mixed clusters.

## [0.9.11] - 2026-01-14
### Added
- **Default LLM**: Added option in Settings to select a specific "Default" (Standard) LLM provider. This provider will be automatically selected when starting a new chat.
- **Font Unification**: Unified font sizes across the application (Editor 14px, Explorer 14px) for a more consistent look.

### Fixed
- **Settings Persistence**: Fixed an issue where the Default Ollama provider would reappear after deletion.
  - *Note*: The system now strictly respects user deletion of default providers (`default-ollama`, `default-openai`, `default-embeddings`).
- **Draw.io**:
  - Fixed 404/405 errors by correcting the proxy path rewriting.
  - Fixed CSP issues allowing `data:` and `blob:` schemes for saving diagrams.

## [0.9.10] - 2026-01-12
### Changed
- **Server**: Updated Note Tree sort order (`Position ASC` -> `Title ASC`) to prevent notes from jumping to the top of the folder when edited.
- **Client**: Bumped version to `0.9.10` to sync with server.

### Fixed
- **Draw.io Integration**: 
  - Fixed proxy routing configuration to handle external path prefix `/draw` correctly.
  - Resolved `404` errors by reverting IngressRoute to HTTP entrypoint behind external TLS load balancer.
  - Fixed "Refused to connect" errors by updating Content Security Policy (CSP) to allow `data:` and `blob:` sources.
- **Data Loss**: Fixed a critical race condition in the Editor where autosave could overwrite note content with empty data during drag-and-drop operations.

## [0.9.5] - 2026-01-11
### Changed
- **Editor**: Updated all `@licium` editor packages to version `3.2.14`.

## [0.9.4] - 2026-01-09
### Added
- **Text highlighting**: Added support for highlighting text in the editor (`@licium/editor-plugin-highlight`).

## [0.9.3] - 2026-01-08

### Added
- **Text Alignment**: Added `@licium/editor-plugin-text-align-simpel` for simple left/center/right text alignment.

### Changed
- **Dependencies**: Updated all `@licium` editor packages to version `3.2.11`.

### Fixed
- **Editor Toolbar**: Resolved an issue where the `details` plugin icon appeared twice in the toolbar.
## [0.9.2] - 2026-01-07

### Added
- **Drag & Drop Reordering**: Notes and folders can now be reordered via drag-and-drop in the sidebar.
  - Drag items to reorder within the same parent.
  - Drag into folders to nest items.
  - Drag to root level to un-nest.
  - Positions persist across sessions.
- **Auto-Sort**: New sort button in sidebar header sorts notes/folders automatically.
  - Items starting with numbers are sorted first (numerically).
  - Then alphabetical sorting (A-Z).

### Fixed
- **Microphone Permissions**: Fixed repeated permission prompts by keeping the MediaStream alive between recordings.

---

## [0.9.1] - 2026-01-06

### Changed
- **Editor Migration**: Replaced unmaintained `@toast-ui/react-editor` with `@licium/react-editor` (Fork).
  - Ensures long-term stability and compatibility with React 19+.
  - Fixes layout issues (dark mode toolbar contrast).
- **Plugins**: Updated and added new editor plugins:
  - Added `<details>` / `<summary>` support (`@licium/editor-plugin-details`).
  - Added Emoji picker support (`@licium/editor-plugin-emoji`).
  - Added Text Alignment support (`@licium/editor-plugin-text-align` placeholder).

### Fixed
- **Dark Mode**: Fixed TUI Editor toolbar background color not matching the application header in dark mode.

