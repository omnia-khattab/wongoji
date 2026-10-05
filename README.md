# Wongoji Writer

Wongoji Writer is a React + Vite application for building and validating Korean manuscript-grid text. The app lets users create a grid, fill each cell, check whether the layout follows Wongoji-style line and paragraph rules, and export the result in several formats.

## Current app behavior

The project is a client-side writing tool, not a full text editor. The core experience is:

- set custom row and column counts
- generate a manuscript grid
- type characters into individual cells
- validate paragraph flow and spacing in real time
- insert a new paragraph when needed
- export the final content as text, CSV, JSON, PDF, or PNG

## Features

- Adjustable manuscript grid dimensions
- Real-time validation for line and paragraph structure
- Empty-cell spacing checks and duplicate-gap prevention
- Mixed-content validation for Hangul, English, digits, and punctuation
- Paragraph start rules and row-flow enforcement
- Export helpers for text, CSV, JSON, PDF, and image files
- Tailwind-based styling with a compact, focused UI

## Getting started

### Prerequisites

- Node.js 18+
- npm

### Install and run

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open the app in a browser at:

```text
http://localhost:5173
```

### Production build

```bash
npm run build
```

### Preview build

```bash
npm run preview
```

## Available scripts

- `npm run dev` — start the Vite development server
- `npm run build` — create a production build
- `npm run preview` — preview the production build locally
- `npm run lint` — lint the JavaScript and JSX sources

## Project structure

```text
src/
├── App.jsx
├── main.jsx
├── index.css
├── components/
│   ├── ErrorPanel.jsx
│   ├── GridCell.jsx
│   ├── GridControls.jsx
│   ├── GridPage.jsx
│   ├── GridRow.jsx
│   └── WongojiGrid.jsx
├── services/
│   ├── exportService.js
│   └── grammarService.js
├── store/
│   └── gridReducer.js
├── utils/
│   ├── parser.js
│   └── rulesEngine.js
└── ...
```

## Rules engine overview

The validation logic currently lives in `src/utils/rulesEngine.js` and checks the manuscript flow used by the app. The current rules cover:

- paragraph start placement
- line continuity and no skipped rows
- no double empty cells between content
- no mixed Hangul/English content in one cell
- no digits mixed with letters in one cell
- punctuation rules and quote handling
- end-of-line punctuation behavior
- ellipsis support and row-level flow validation

This is the main rule source used by the UI, while the grammar service is kept as a separate optional integration.

## Export support

The export utilities in `src/services/exportService.js` support:

- text export
- CSV export
- JSON export
- PNG image export
- PDF export

## Notes on grammar integration

A LanguageTool-based grammar checker exists in `src/services/grammarService.js`. It is available as a separate utility, but the active app validation is centered on the custom Wongoji rules engine rather than general grammar checking.

## Tech stack

- React 18
- Vite
- Tailwind CSS
- HTML2Canvas
- jsPDF

## License

This project is for local development and personal use unless otherwise specified by the repository owner.