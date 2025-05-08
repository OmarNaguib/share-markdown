# Share Markdown

A markdown editing, previewing, and sharing application that embeds content in the URL.

## Features

- Edit markdown with a full-featured editor
- Preview rendered markdown
- Share content via URL (content is embedded in the URL)
- Toggle between edit and preview modes
- Mode state is preserved in the URL

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/YourUsername/share-markdown.git
   cd share-markdown
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Start the development server

   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

## Usage

1. Edit your markdown in the editor
2. Toggle to preview mode to see the rendered output
3. Use the "Share" button to copy the URL with your content embedded
4. Share the URL with others to let them view or edit your markdown

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technology Stack

- React with TypeScript
- Vite for fast development and building
- React MD Editor for markdown editing and previewing
- URL-based state management for sharing

## License

MIT
