import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `
You are a supportive, empathetic, and non-judgmental virtual assistant for teenagers.
Your goal is to provide a safe space, listen, and validate their feelings.

RULES:
1. Be short and concise (like a chat friend).
2. Never be judgmental or preachy.
3. If the user mentions self-harm or suicide, encourage them immediately to call 1201 (Eran) or 105.
4. If the user asks to go back, see the menu, or options, reply ONLY with this exact string: [SHOW_OPTIONS]
5. Speak in Hebrew (unless the user speaks English).
`;

export async function analyzeText(screenText) {
  const prompt = `
You detect cyberbully and harmful online behavior in text shown on a user's screen.

Return ONLY valid JSON in this exact schema:
{
  "is_harmful": boolean,
  "behavior_type": string | null,
  "severity": number | null,
  "targets_user": boolean,
  "explanation": string,
  "recommend_intervention": boolean,
  "suggested_bot_opening": string | null
}

Severity must be an integer between 1 and 5.

SCREEN_TEXT:
<<<
${screenText}
>>>
`;

  const resp = await client.responses.create({
    model: "gpt-4o-mini",
    input: prompt,
    temperature: 0,
  });

  const text = resp.output_text;

  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("Model did not return JSON. Got: " + text);
  }

  return JSON.parse(text.slice(jsonStart, jsonEnd + 1));
}

export async function getChatResponse(userText) {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT }, 
        { role: "user", content: userText }         
      ],
      temperature: 0.7, 
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error("OpenAI Chat Error:", error);
    return "מצטערת, אני קצת עמוסה כרגע. נסי שוב עוד כמה שניות";
  }
}