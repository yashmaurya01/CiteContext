# CiteContext

> 🚧 **UNDER CONSTRUCTION** 🚧  
> This project is currently in active development.

CiteContext is a Chrome extension that enhances the reading experience of academic papers by providing contextual information about referenced papers.

## Problem

When reading a research paper, understanding the relevance and relationship between cited papers and the current paper can be challenging and time-consuming. With an average paper citing over 20 other papers, it's difficult to grasp the full context without diving deep into each referenced paper.

## Solution

CiteContext allows readers to:

- Hover over citations to see basic information about the referenced paper
- Click on citations to get a detailed view with contextual relevance
- Understand how the referenced paper relates to the specific section of the current paper

## Features

- **Automatic Citation Detection**: Identifies citations in various formats (numeric, author-date)
- **Contextual Relevance**: Analyzes the surrounding text to explain the citation's relevance using LLMs
- **High Quality Analysis**: Uses OpenAI's GPT models to generate accurate and insightful context
- **Fast Performance**: Caches results for quick access to previously processed citations
- **Simplified Setup**: Works directly in the browser with a simple API key configuration

## Installation

### From Chrome Web Store (coming soon)

1. Visit the Chrome Web Store page (link TBD)
2. Click "Add to Chrome"
3. Confirm the installation

### Developer Installation

1. Clone this repository
   ```
   git clone https://github.com/yashmaurya01/CiteContext.git
   ```

2. Open Chrome and go to `chrome://extensions`

3. Enable "Developer mode" (toggle in top right)

4. Click "Load unpacked" and select the CiteContext directory

## Usage

1. Navigate to a research paper online (PDF or HTML)
2. Citations will be automatically highlighted
3. Hover over a citation to see basic information
4. Click on a citation to see detailed information including contextual relevance

## Setup

1. After installing the extension, click on the CiteContext icon in your Chrome toolbar
2. Enter your OpenAI API key in the settings
3. Choose your preferred model (GPT-3.5 Turbo or GPT-4o)
4. Click "Save Settings"

Your API key is stored locally in your browser and is only used to process citations.

## Technical Architecture

CiteContext has a streamlined architecture:

1. **Content Script**:
   - Identifies citations in academic papers
   - Displays tooltips and modals with citation information

2. **Background Script**:
   - Manages API calls to OpenAI for context generation
   - Fetches paper information from Semantic Scholar API
   - Handles caching of results for better performance

3. **Popup UI**:
   - Provides settings for API key and model selection
   - Displays usage statistics

## Extension Structure
- `manifest.json`: Extension configuration
- `contentScript.js`: Detects and processes citations on the page
- `background.js`: Handles API calls and citation processing
- `popup.html/js`: User interface for the extension

## Requirements
- Chrome browser
- OpenAI API key

## Privacy Considerations

- Your API key is stored securely in Chrome's local storage
- Paper contexts are processed through OpenAI's API
- All processing happens directly in your browser without an intermediate server
- Only the citation context (surrounding paragraph) is sent to OpenAI, never the entire paper

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all the researchers who make their work accessible
- Thanks to the OpenAI API for providing high-quality language capabilities