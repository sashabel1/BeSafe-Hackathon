import express from 'express';
import cors from 'cors';
import "dotenv/config";
import { analyzeText , getChatResponse} from './screenTextAnalyzer.js';

const app = express();
app.use(cors()); 
app.use(express.json());

app.post('/analyze', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: "No text provided" });
        }

        const result = await analyzeText(text);
        res.json(result);

    } catch (error) {
        console.error("!!! Server Error !!!", error.message);
        
        res.status(500).json({ 
            is_harmful: false, 
            error: "Failed to process request",
            details: error.message 
        });
    }
});

app.post('/chat', async (req, res) => {
    try {
        const { text } = req.body;
        const botReply = await getChatResponse(text || "");
        res.json({ reply: botReply });

    } catch (error) {
        console.error("!!! Chat Error !!!", error.message);
        res.status(500).json({ reply: "server error" });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});