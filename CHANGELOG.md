# Changelog

All notable changes to this project will be documented in this file.

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

