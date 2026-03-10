import { GoogleGenAI } from "@google/genai";

export interface DoodleInfo {
  imageUrl: string;
  theme: string;
  description: string;
}

const MODEL_NAME = "gemini-2.5-flash-image";

// Design Rules & Constraints
const BRAND_CONSTRAINTS = `
1. CORE ICON: A bold white exclamation mark "!" inside a vibrant red square box (#dc2626).
2. TEXT: The word "SPIKED" in bold black serif font, followed by "AI" in bold red.
3. STYLE: Professional, clean, high-tech, yet creative (Google Doodle style).
4. PRESERVATION: The red square and "!" must remain the focal point.
5. THEME INTEGRATION: Elements of the event should wrap around, sit behind, or subtly modify the square without obscuring the "!".
`;

export async function getDynamicDoodle(location?: { lat: number; lng: number }): Promise<DoodleInfo | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  
  // 1. Determine the Event
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const cached = localStorage.getItem(`spiked_doodle_${dateStr}`);
  
  if (cached) {
    return JSON.parse(cached);
  }

  // 2. Detect Event Logic (Simplified for demo, could use a real API)
  let event = "Standard Professional";
  const month = now.getMonth() + 1;
  const day = now.getDate();

  if (month === 1 && day === 1) event = "New Year's Day Celebration";
  else if (month === 2 && day === 14) event = "Valentine's Day / Connection Intelligence";
  else if (month === 3 && day === 17) event = "St. Patrick's Day / Luck & Logic";
  else if (month === 4 && day === 22) event = "Earth Day / Sustainable AI";
  else if (month === 10 && day === 31) event = "Halloween / Ghost in the Machine";
  else if (month === 12 && day === 25) event = "Christmas / Festive Intelligence";
  else {
    // Seasonal fallbacks
    if (month >= 3 && month <= 5) event = "Spring Growth & Renewal";
    else if (month >= 6 && month <= 8) event = "Summer Energy & Heat";
    else if (month >= 9 && month <= 11) event = "Autumn Harvest & Data Collection";
    else event = "Winter Focus & Clarity";
  }

  // 3. Generate the Doodle
  try {
    const prompt = `
      Design a "Spiked AI" Doodle for today's theme: ${event}.
      
      BRAND RULES:
      ${BRAND_CONSTRAINTS}
      
      TASK:
      Create a high-quality, professional logo variation for "Spiked AI". 
      The core icon (Red square with white "!") should be themed with ${event} elements.
      For example, if it's Winter, add subtle frost or snow to the square. 
      If it's Spring, add small digital leaves or flowers.
      The text "SPIKED AI" should be integrated into the composition.
      
      Output should be a clean, modern digital illustration on a white background.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    let imageUrl = "";
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) return null;

    const doodle: DoodleInfo = {
      imageUrl,
      theme: event,
      description: `Today's SPIKED AI Doodle celebrates ${event}.`
    };

    localStorage.setItem(`spiked_doodle_${dateStr}`, JSON.stringify(doodle));
    return doodle;
  } catch (error) {
    console.error("Doodle generation failed:", error);
    return null;
  }
}
