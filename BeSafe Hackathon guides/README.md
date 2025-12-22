### Prerequisites
* Node.js installed
* OpenAI API Key

### Backend Setup
1. `cd server`
2. `npm install`
3. Add `.env` file and add `OPENAI_API_KEY=your_openai_api_key_here`
4. `node server.js`

### Chrome Extension Installation
1. Open Google Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top right corner)
3. Click **Load unpacked** and select the `extension` folder from this project

### How To Test
1. Open any website (If the site was already open, refresh the page to inject the scanner)
2. To simulate a harmful message:
   * Right-click any text on the page and select **Inspect**
   * Change the text to something harmful
   * Press **Enter**
3. Wait 3 seconds
4. A red notification alert should appear in the bottom-right corner of your screen

![Alert Example](assets/alert.png)