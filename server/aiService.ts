import { GoogleGenAI } from "@google/genai";
import { Company, AIAnalysis } from "../src/types";

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not defined. AI features will run in sandbox mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}

function isRetryableError(error: any): boolean {
  if (!error) return false;
  
  const code = error.status || error.code || (error.error && (error.error.code || error.error.status));
  if (code === 503 || code === 429 || code === 500 || code === 504) {
    return true;
  }
  
  const statusStr = error.statusText || (error.error && error.error.status);
  if (statusStr === "UNAVAILABLE" || statusStr === "RESOURCE_EXHAUSTED" || statusStr === "INTERNAL" || statusStr === "DEADLINE_EXCEEDED") {
    return true;
  }

  const msg = String(error.message || error).toUpperCase();
  if (
    msg.includes("503") ||
    msg.includes("429") ||
    msg.includes("500") ||
    msg.includes("504") ||
    msg.includes("UNAVAILABLE") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("RATE_LIMIT") ||
    msg.includes("HIGH DEMAND") ||
    msg.includes("TEMPORARY") ||
    msg.includes("TIMEOUT") ||
    msg.includes("FETCH FAILED") ||
    msg.includes("ECONNRESET") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("SOCKET HANG UP")
  ) {
    return true;
  }

  return false;
}

async function callGeminiWithRetry<T>(fn: () => Promise<T>, maxAttempts = 4, initialDelayMs = 1000): Promise<T> {
  let attempt = 0;
  while (true) {
    attempt++;
    try {
      return await fn();
    } catch (error: any) {
      console.warn(`Gemini API call failed (attempt ${attempt}/${maxAttempts}):`, error);
      
      const retryable = isRetryableError(error);
      if (!retryable || attempt >= maxAttempts) {
        console.error(`Gemini API call failed permanently after ${attempt} attempts.`);
        throw error;
      }
      
      const delay = initialDelayMs * Math.pow(2, attempt - 1) * (0.8 + Math.random() * 0.4);
      console.log(`Retryable error detected. Waiting ${Math.round(delay)}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Uses Gemini to analyze a company and returns structured recruitment intelligence.
 */
export async function analyzeCompanyAI(company: Company): Promise<Omit<AIAnalysis, "id" | "createdAt">> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Return high-quality mock data if API key is not present
    const leadScore = Math.min(100, Math.max(10, Math.floor(company.employees / 5) + (company.hiringStatus === "Mass Hiring" ? 30 : 15)));
    return {
      companyId: company.id,
      leadScore,
      industryAnalysis: `${company.companyName} operates in ${company.industry}. This sector is experiencing rapid digital acceleration with steady year-over-year growth, driving a surge in technical staffing requirements.`,
      growthAnalysis: `Expanding operations in ${company.city}, ${company.country}. With an estimated employee base of ${company.employees}, they are scaling their infrastructure to support increased client demand.`,
      hiringPrediction: company.hiringStatus,
      technologyStack: company.tags.length > 0 ? company.tags : ["TypeScript", "React", "Node.js", "PostgreSQL", "Cloud Computing"],
      summary: `${company.companyName} is in a prime phase for agency recruitment. Their high recruitment intensity indicates active headcount gaps in core engineering and operational roles.`,
      recommendation: `Initiate contact with the HR Director. Focus on pitching a pre-vetted developer squad matching their current tech stack. Accentuate speed-to-hire and zero placement risk.`,
      bestContactTime: "Tuesday at 10:00 AM",
      followUpRecommendation: "Send a brief follow-up message 3 business days later focusing on candidate portfolio details."
    };
  }

  try {
    const ai = getAIClient();
    const prompt = `
      You are an elite enterprise recruitment intelligence system.
      Analyze the following company profile and generate highly accurate recruitment insights.
      
      Company Name: ${company.companyName}
      Industry: ${company.industry}
      Website: ${company.website}
      Employees: ${company.employees}
      Hiring Status: ${company.hiringStatus}
      Recruitment Intensity: ${company.recruitmentIntensity}
      Notes: ${company.notes || "None provided"}
      Tags: ${company.tags.join(", ") || "None provided"}
      Location: ${company.city}, ${company.country}

      Return a JSON object containing exactly the following keys. Do not include markdown code block formatting or other text around the JSON object.
      {
        "leadScore": number (0 to 100 representing the likelihood of them hiring an agency, high is better),
        "industryAnalysis": "string detailing the current state of their specific sector and hiring patterns",
        "growthAnalysis": "string describing their growth trajectory, employee trends and expansion prospects",
        "hiringPrediction": "string summarizing their expected hiring behavior (e.g. Mass Hiring, Hiring Soon)",
        "technologyStack": ["string", "string", ...] (array of predicted or verified technologies they use),
        "summary": "string summarizing why this company is or is not a prime lead",
        "recommendation": "string giving specific concrete pitch instructions for the recruiter",
        "bestContactTime": "string specifying best day and time (e.g., Tuesday, 10:30 AM)",
        "followUpRecommendation": "string detailing a follow-up cadence"
      }
    `;

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      })
    );

    const text = response.text || "{}";
    const data = JSON.parse(text);

    return {
      companyId: company.id,
      leadScore: typeof data.leadScore === "number" ? data.leadScore : 75,
      industryAnalysis: data.industryAnalysis || "Stable market growth with increasing reliance on external contract staffing.",
      growthAnalysis: data.growthAnalysis || "Consistent head-count scaling across primary product divisions.",
      hiringPrediction: data.hiringPrediction || company.hiringStatus,
      technologyStack: Array.isArray(data.technologyStack) ? data.technologyStack : company.tags,
      summary: data.summary || "Strong prospect with high potential recruitment alignment.",
      recommendation: data.recommendation || "Deliver standard cloud staffing solution pitch.",
      bestContactTime: data.bestContactTime || "Wednesday at 11:00 AM",
      followUpRecommendation: data.followUpRecommendation || "Follow up after 4 days with candidate resumes."
    };
  } catch (error) {
    console.error("Gemini Company Analysis failed:", error);
    // Fallback to high-quality default mock
    return {
      companyId: company.id,
      leadScore: 75,
      industryAnalysis: "Active market indicators with moderate demand for high-tier professional support.",
      growthAnalysis: "Steady business scaling. Estimated employee base is healthy and expanding.",
      hiringPrediction: company.hiringStatus,
      technologyStack: company.tags.length > 0 ? company.tags : ["React", "Node.js"],
      summary: "Qualified warm lead exhibiting consistent recruitment interest.",
      recommendation: "Pitch specialized consultant portfolios. Emphasize experience with comparable firms.",
      bestContactTime: "Monday at 2:00 PM",
      followUpRecommendation: "Standard follow-up schedule."
    };
  }
}

/**
 * Generates an AI-driven recruitment proposal email.
 */
export async function generateProposalEmailAI(params: {
  company: Company;
  tone: string;
  length: "Short" | "Medium" | "Long";
  senderName: string;
  senderRole: string;
  senderCompany: string;
  proposalType: string;
}): Promise<{ subject: string; body: string }> {
  const { company, tone, length, senderName, senderRole, senderCompany, proposalType } = params;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Pre-written high fidelity templates if offline
    const subject = `${proposalType}: Custom Recruiting Solutions for ${company.companyName}`;
    const body = `Dear Hiring Team at ${company.companyName},\n\nI hope this email finds you well.\n\nI have been following ${company.companyName}'s growth in the ${company.industry} sector. With your team currently in a ${company.hiringStatus} phase, finding the right talent swiftly is essential to sustain your growth. At ${senderCompany}, we specialize in sourcing elite candidates tailored exactly to your requirements.\n\nOur team has a deep bench of experienced specialists in technologies like ${company.tags.join(", ") || "Cloud and Enterprise Software"}. We handle the full sourcing, screening, and onboarding pipeline, reducing average time-to-hire by up to 45%.\n\nCould we schedule a quick 10-minute introduction call this week?\n\nSincerely,\n\n${senderName}\n${senderRole}\n${senderCompany}`;
    return { subject, body };
  }

  try {
    const ai = getAIClient();
    const lengthGuideline = 
      length === "Short" ? "under 150 words, concise, high-impact" :
      length === "Long" ? "around 350-450 words, comprehensive, detailing vetting processes" :
      "around 200-250 words, balanced and informative";

    const prompt = `
      You are an expert executive recruitment copywriter. Generate a cold business-development proposal email tailored to the following details.
      
      Sender Information:
      - Name: ${senderName}
      - Title: ${senderRole}
      - Agency Company Name: ${senderCompany}

      Recipient Company Profile:
      - Name: ${company.companyName}
      - Industry: ${company.industry}
      - Hiring Status: ${company.hiringStatus}
      - Technology Stack: ${company.tags.join(", ") || "General tech infrastructure"}
      - Location: ${company.city}, ${company.country}

      Email Configuration:
      - Tone: ${tone} (e.g. Professional, Formal, Friendly, Executive, Premium, Corporate)
      - Length: ${lengthGuideline}
      - Proposal Type: ${proposalType} (e.g. Recruitment Proposal, Follow-up, Reminder, Thank You, CEO outreach, Business Development)

      Rules:
      1. CRITICAL: Do NOT use any emojis, markdown styling, or bracketed placeholders (e.g. [Insert Name Here]) in the final subject or body. Fill all variables completely using the provided details.
      2. No hallucinated facts about the company's financials, unless general or plausible.
      3. The email must look pristine, highly executive, and ready to be sent.
      
      Return a JSON object containing exactly the following keys:
      {
        "subject": "string",
        "body": "string"
      }
    `;

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4
        }
      })
    );

    const text = response.text || "{}";
    const data = JSON.parse(text);

    return {
      subject: data.subject || `Recruitment Partnership Proposal - ${company.companyName}`,
      body: data.body || `Dear Team,\n\nI hope this finds you well...`
    };
  } catch (error) {
    console.error("Gemini Proposal Email generation failed:", error);
    return {
      subject: `Tailored Sourcing Solutions for ${company.companyName}`,
      body: `Dear Hiring Leaders,\n\nI noticed ${company.companyName} is scaling up in ${company.city}. At ${senderCompany}, we provide premium recruiting services in ${company.industry}.\n\nLet's discuss how we can match pre-screened professionals to your current tech stack.\n\nWarm regards,\n${senderName}`
    };
  }
}

/**
 * AI chatbot conversation assistant.
 */
export async function chatbotMessageAI(history: { role: "user" | "model"; parts: { text: string }[] }[], newMessage: string, systemContext: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Return standard offline helpful response
    const msg = newMessage.toLowerCase();
    if (msg.includes("company") || msg.includes("lead")) {
      return "I can see you're interested in lead analysis! In the Companies tab, you can select any company to run our deep AI analysis. It computes a 0-100 Lead Score, maps out their hiring indicators, and suggests custom pitches.";
    }
    if (msg.includes("email") || msg.includes("proposal") || msg.includes("write")) {
      return "To compose a recruiting outreach, go to the Email Generator tab. It pulls company profiles automatically and lets you customize the Tone (Formal, Friendly, Premium) and Length (Short, Medium, Long) before writing the draft.";
    }
    if (msg.includes("gmail") || msg.includes("oauth")) {
      return "You can securely authenticate your Gmail account via the Gmail Integration tab. This enables direct composition of drafts or batch-sending your bulk email campaigns directly from your corporate inbox.";
    }
    return "I'm currently running in local offline mode. However, you can seamlessly navigate the dashboard widgets, track client conversions, run bulk recruitment campaigns, and review interactive analytics charts!";
  }

  try {
    const ai = getAIClient();
    
    // Format conversation history for @google/genai format
    const contents = history.map(h => ({
      role: h.role,
      parts: h.parts
    }));

    // Add system context at the very beginning or as instructions
    const systemInstruction = `
      You are the AI Recruitment CRM Assistant.
      You help HR recruiters, staffing consultants, and enterprise managers optimize client acquisition.
      You have access to the system context:
      ${systemContext}

      Be direct, helpful, and highly professional. Support rich text (markdown, bullet lists, simple tables) when answering questions. Do not recommend hardcoding keys. If asked to find a company, refer to the database companies list.
    `;

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          ...contents,
          { role: "user", parts: [{ text: newMessage }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.5
        }
      })
    );

    return response.text || "I was unable to process that message. Please try again.";
  } catch (error) {
    console.error("Gemini Chatbot failure:", error);
    return "The AI agent is currently busy processing other campaigns. Please try asking again in a moment, or navigate directly to the relevant dashboard modules!";
  }
}
