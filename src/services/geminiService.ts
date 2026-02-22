import { GoogleGenAI, Type } from "@google/genai";

const MODEL_NAME = "gemini-3-flash-preview";

export interface SellerInfo {
  name: string;
  jobProfile: string;
  company: string;
  website: string;
  industry: string;
  linkedinUrl: string;
  productFocus: string;
  valueProp: string;
}

export interface BuyerInfo {
  name: string;
  jobTitle: string;
  company: string;
  industry: string;
  painPoints: string;
  linkedinUrl: string;
  website: string;
}

export const initialSeller: SellerInfo = {
  name: "",
  jobProfile: "",
  company: "",
  website: "",
  industry: "",
  linkedinUrl: "",
  productFocus: "",
  valueProp: "",
};

export const initialBuyer: BuyerInfo = {
  name: "",
  jobTitle: "",
  company: "",
  industry: "",
  painPoints: "",
  linkedinUrl: "",
  website: "",
};

export async function fetchAutofillData(urls: string[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  
  const prompt = `
    Analyze the following URLs and extract structured information for a sales intelligence tool.
    URLs: ${urls.join(", ")}
    
    Extract or infer:
    - For the Seller (if applicable): Name, Role, Company, Industry, ICP, Messaging, Product Positioning.
    - For the Buyer (if applicable): Name, Job Title, Company, Industry, Market Position, Strategic Initiatives.
    
    Return a JSON object with 'seller' and 'buyer' keys containing the extracted fields.
    If a field is inferred, mark it as such.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      tools: [{ urlContext: {} }],
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          seller: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              jobProfile: { type: Type.STRING },
              company: { type: Type.STRING },
              industry: { type: Type.STRING },
              website: { type: Type.STRING },
              productFocus: { type: Type.STRING },
              valueProp: { type: Type.STRING },
            }
          },
          buyer: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              jobTitle: { type: Type.STRING },
              company: { type: Type.STRING },
              industry: { type: Type.STRING },
              website: { type: Type.STRING },
              painPoints: { type: Type.STRING },
            }
          },
          confidence: { type: Type.NUMBER }
        }
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateDeepReport(seller: SellerInfo, buyer: BuyerInfo) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  
  const prompt = `
    Generate an ELITE FOUNDER-GRADE SALES INTELLIGENCE BRIEF.
    This is a high-stakes document designed for winning enterprise deals.
    
    SELLER CONTEXT:
    Name: ${seller.name} | Role: ${seller.jobProfile} | Company: ${seller.company}
    Product: ${seller.productFocus} | Value Prop: ${seller.valueProp}
    
    BUYER CONTEXT:
    Name: ${buyer.name} | Title: ${buyer.jobTitle} | Company: ${buyer.company}
    Industry: ${buyer.industry} | Stated Pain Points: ${buyer.painPoints}
    
    INTELLIGENCE STANDARDS:
    - Write like a fusion of a Top Strategy Consultant, Elite Enterprise Seller, and Behavioral Psychologist.
    - No generic fluff. High signal density.
    - Prefer inference over repetition. Use intelligent deduction.
    - Label inferred insights clearly (e.g., "Inference:", "Likely:").
    - Use Markdown for structure.
    - Use strategic callout boxes using blockquotes with specific prefixes:
      - > [!KEY_INSIGHT] for critical takeaways.
      - > [!HIDDEN_RISK] for non-obvious threats.
      - > [!TACTICAL_EDGE] for specific advantages.

    DOCUMENT STRUCTURE:

    SECTION 1 — BUYER SNAPSHOT
    - Leadership archetype, Decision identity, Core motivations, Strategic triggers, Recommended engagement posture. (Highly compressed).

    SECTION 2 — DEEP PSYCHOLOGICAL PROFILE
    - Archetype classification (Empire Builder, Systems Thinker, Visionary Operator, Institutional Guardian, Pragmatic Optimizer).
    - Identity drivers, Ego sensitivities, Cognitive biases, Emotional activation language, Messaging landmines.

    SECTION 3 — DECISION INTELLIGENCE
    - Risk tolerance profile, Evidence standards, Decision speed patterns, Objection psychology, Internal validation style.

    SECTION 4 — POWER & POLITICS MAP
    - Economic buyer, Political influencers, Technical gatekeepers, Silent blockers, Innovation champions.
    - Influence relationships, Alignment clusters, Friction zones, Access sequencing strategy.

    SECTION 5 — STRATEGIC POSITIONING
    - Category positioning angles, Narrative reframes, Differentiation strategy, Trust bridge construction.

    SECTION 6 — COMPETITIVE WARFARE ANALYSIS
    - Incumbent advantages vs. Hidden weaknesses, Overfit zones, Counter-positioning angles, Battlefield reframing.

    SECTION 7 — HIDDEN PAIN ANALYSIS
    - Explicit pains vs. Inferred organizational friction, Cognitive overload zones, Political risks, Transformation pressure.

    SECTION 8 — OBJECTION NEUROSCIENCE
    - Surface objection vs. Root fear/belief, Identity risk involved, Strategic response framework.

    SECTION 9 — DEAL EXECUTION BLUEPRINT
    - Entry strategy, Stakeholder sequencing, Credibility unlock moments, Proof strategy, Momentum tactics, Timing windows.

    SECTION 10 — NON-OBVIOUS STRATEGIC ANGLES
    - 5 unconventional insights that create asymmetric advantage and reframe the opportunity.

    SECTION 11 — WIN PROBABILITY MODEL
    - Win likelihood ranges, Key swing factors, Deal-killing risks, Success accelerators. (Use reasoning, not fake precision).

    SECTION 12 — PRECISION OUTREACH
    - Founder-grade email, High-signal LinkedIn message, 3 authority-creating discovery questions.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      tools: [{ urlContext: {} }]
    }
  });

  return response.text;
}
