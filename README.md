# NotebookLM Citation Extension

This repository provides a single Chrome extension that automatically maps citation numbers in Google NotebookLM to their corresponding source files.

## Features
- Expands hidden citation groups to reveal every reference on the page.
- Parses `aria-label` spans to map citation numbers to PDF titles.
- Displays a draggable, minimizable legend with a one-click copy button.

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/nicremo/notebookLM-citation.git
   ```
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" (top right).
4. Click "Load unpacked" and select the `notebooklmExtension` folder.

## Usage

- Navigate to [notebooklm.google.com](https://notebooklm.google.com) with the extension loaded.
- The citation legend will appear automatically and update as citations change.

## Contributing

Issues and pull requests are welcome. Enhancements that improve mapping accuracy or usability are appreciated.
