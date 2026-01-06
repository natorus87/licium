# Changelog

All notable changes to this project will be documented in this file.

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
