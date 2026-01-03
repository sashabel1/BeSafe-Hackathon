import { analyzeText, getChatResponse } from "../screenTextAnalyzer.js";
import { User } from "../models/UserModel.js";

export async function analyze(req, res) {
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
      details: error.message,
    });
  }
}

export async function chat(req, res) {
  try {
    const { text } = req.body;
    const botReply = await getChatResponse(text || "");
    res.json({ reply: botReply });

  } catch (error) {
    console.error("!!! Chat Error !!!", error.message);
    res.status(500).json({ reply: "server error" });
  }
}


export async function validateOutgoingMessage(req, res) {
  try {
    const { userId, text } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ 
        allowed: false, 
        error: "User is blocked due to previous violations." 
      });
    }

    const aiResult = await analyzeText(text);

    if (aiResult.is_harmful) {
      user.strikes += 1; 

      let message = "ההודעה זוהתה כפוגענית.";

      if (user.strikes >= 3) {
        user.isBlocked = true;
        message = "ההודעה פוגענית. צברת 3 פסילות ולכן חשבונך נחסם.";
      } else {
        message += ` יש לך ${user.strikes} פסילות מתוך 3.`;
      }

      await user.save(); 

      return res.json({
        allowed: false,
        isBlocked: user.isBlocked,
        strikes: user.strikes,
        reason: aiResult.explanation || message
      });
    }

    return res.json({ 
      allowed: true, 
      strikes: user.strikes 
    });

  } catch (error) {
    console.error("Validation Error:", error);
    res.status(500).json({ error: "Server error during validation" });
  }
}