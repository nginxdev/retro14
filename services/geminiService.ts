import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are an expert Agile Coach and Scrum Master Assistant at Atlassian.
Your goal is to help the team analyze their Sprint Retrospective board.

The board has three columns:
1. **Went Well** (Successes)
2. **To Improve** (Challenges)
3. **Action Items** (Future steps)

When users ask questions:
- Analyze the sentiment of the cards on the board (if provided in context).
- Suggest constructive Action Items based on "To Improve" items.
- Encourage celebrating wins in "Went Well".
- Use Atlassian design philosophy: Be **Bold**, **Optimistic**, and **Practical**.
- Keep answers concise, actionable, and encouraging.

If the user asks about the UI:
- Explain that the **Green** column signifies growth/success.
- The **Red** column signals areas needing attention (alertness).
- The **Blue** column represents forward motion and productivity (Jira Blue).

Maintain a friendly, professional tone suitable for a software development team.
`;

export const sendMessageToGemini = async (
  history: { role: 'user' | 'model'; text: string }[],
  newMessage: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Error: API Key is missing. Please check your environment variables.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the Agile Coach service. Please try again.";
  }
};