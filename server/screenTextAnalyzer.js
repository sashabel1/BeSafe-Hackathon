import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
