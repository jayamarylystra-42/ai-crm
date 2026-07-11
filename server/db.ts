import fs from "fs";
import path from "path";
import { 
  Company, Campaign, Email, AIAnalysis, Notification, ChatMessage, User, OAuthStatus, DashboardStats,
  CampaignRecipient, EmailHistory, EmailTemplate, GmailToken, Draft 
} from "../src/types.js";

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

interface DBStructure {
  users: User[];
  companies: Company[];
  campaigns: Campaign[];
  emails: Email[];
  aiAnalyses: AIAnalysis[];
  notifications: Notification[];
  chatMessages: ChatMessage[];
  oauthStatus: OAuthStatus;
  campaignRecipients: CampaignRecipient[];
  emailHistories: EmailHistory[];
  emailTemplates: EmailTemplate[];
  gmailTokens: GmailToken[];
  drafts: Draft[];
}

const DEFAULT_USERS: User[] = [
  {
    id: "user-1",
    name: "John Admin",
    email: "admin@recruitment.com",
    role: "Super Admin",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    phone: "+1 (555) 019-2834",
    company: "Apex Staffing Solutions",
    status: "Active",
    lastLogin: "2026-07-11T09:30:00Z",
    createdAt: "2026-06-01T08:00:00Z"
  },
  {
    id: "user-2",
    name: "Sarah Consultant",
    email: "consultant@recruitment.com",
    role: "HR Consultant",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    phone: "+1 (555) 014-9922",
    company: "Apex Staffing Solutions",
    status: "Active",
    lastLogin: "2026-07-11T10:15:00Z",
    createdAt: "2026-06-10T09:00:00Z"
  },
  {
    id: "user-3",
    name: "Robert Manager",
    email: "manager@recruitment.com",
    role: "Recruitment Manager",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    phone: "+1 (555) 017-8833",
    company: "Apex Staffing Solutions",
    status: "Active",
    lastLogin: "2026-07-10T15:45:00Z",
    createdAt: "2026-06-05T10:30:00Z"
  },
  {
    id: "user-4",
    name: "Alice Viewer",
    email: "viewer@recruitment.com",
    role: "Viewer",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    phone: "+1 (555) 012-7744",
    company: "Apex Staffing Solutions",
    status: "Active",
    lastLogin: "2026-07-11T11:00:00Z",
    createdAt: "2026-06-15T14:00:00Z"
  }
];

const DEFAULT_COMPANIES: Company[] = [
  {
    id: "comp-1",
    companyName: "TechNovus Solutions",
    industry: "Software & Technology",
    website: "https://technovus.example.com",
    linkedin: "https://linkedin.com/company/technovus",
    email: "hr@technovus.example.com",
    phone: "+1 (555) 123-4567",
    city: "San Francisco",
    country: "United States",
    employees: 120,
    hiringStatus: "Mass Hiring",
    recruitmentIntensity: "High",
    leadScore: 94,
    priority: "High",
    status: "New",
    notes: "Rapidly expanding their backend team. Looking for senior cloud engineers and React specialists.",
    tags: ["SaaS", "Cloud Computing", "AI Research"],
    createdAt: "2026-07-01T10:00:00Z",
    updatedAt: "2026-07-11T02:00:00Z"
  },
  {
    id: "comp-2",
    companyName: "Scribe Health AI",
    industry: "Healthcare Tech",
    website: "https://scribehealth.example.com",
    linkedin: "https://linkedin.com/company/scribehealth",
    email: "careers@scribehealth.example.com",
    phone: "+1 (555) 987-6543",
    city: "Boston",
    country: "United States",
    employees: 45,
    hiringStatus: "Hiring Soon",
    recruitmentIntensity: "Medium",
    leadScore: 82,
    priority: "High",
    status: "In Progress",
    notes: "Just secured Series A funding. Planning to double their engineering team over the next quarter.",
    tags: ["HealthTech", "Machine Learning", "HIPAA"],
    createdAt: "2026-07-03T11:30:00Z",
    updatedAt: "2026-07-10T14:22:00Z"
  },
  {
    id: "comp-3",
    companyName: "AeroJet Logistics",
    industry: "Logistics & Supply Chain",
    website: "https://aerojet.example.com",
    linkedin: "https://linkedin.com/company/aerojet-logistics",
    email: "talent@aerojet.example.com",
    phone: "+1 (555) 443-8899",
    city: "Chicago",
    country: "United States",
    employees: 350,
    hiringStatus: "Expansion Hiring",
    recruitmentIntensity: "High",
    leadScore: 78,
    priority: "Medium",
    status: "Contacted",
    notes: "Opening a new distribution center in Texas. High volume warehouse manager and logistics analyst positions open.",
    tags: ["Logistics", "IoT", "Automation"],
    createdAt: "2026-07-05T09:15:00Z",
    updatedAt: "2026-07-09T16:45:00Z"
  },
  {
    id: "comp-4",
    companyName: "Apex Retail Group",
    industry: "E-Commerce",
    website: "https://apexretail.example.com",
    linkedin: "https://linkedin.com/company/apex-retail",
    email: "hiring@apexretail.example.com",
    phone: "+1 (555) 887-1122",
    city: "New York",
    country: "United States",
    employees: 500,
    hiringStatus: "Campus Hiring",
    recruitmentIntensity: "Low",
    leadScore: 55,
    priority: "Low",
    status: "Nurturing",
    notes: "Steady retail staffing needs, but minimal professional tech positions at the moment.",
    tags: ["B2C", "Shopify", "Marketing"],
    createdAt: "2026-07-06T14:00:00Z",
    updatedAt: "2026-07-08T11:30:00Z"
  },
  {
    id: "comp-5",
    companyName: "Quantum Fintech",
    industry: "Finance & Banking",
    website: "https://quantumfin.example.com",
    linkedin: "https://linkedin.com/company/quantumfin",
    email: "recruiting@quantumfin.example.com",
    phone: "+1 (555) 303-4040",
    city: "London",
    country: "United Kingdom",
    employees: 80,
    hiringStatus: "Not Hiring",
    recruitmentIntensity: "Low",
    leadScore: 38,
    priority: "Low",
    status: "Lost",
    notes: "Recently completed major layoffs and restructuring. Not using agencies.",
    tags: ["Blockchain", "Trading", "Security"],
    createdAt: "2026-07-07T16:30:00Z",
    updatedAt: "2026-07-08T09:10:00Z"
  }
];

const DEFAULT_CAMPAIGNS: Campaign[] = [
  {
    id: "camp-1",
    campaignName: "Q3 High-Growth Tech Outreach",
    description: "Outreach targeting software and technology companies in Mass Hiring mode to pitch specialized senior developers.",
    status: "Running",
    startDate: "2026-07-01",
    emailsSent: 45,
    emailsFailed: 2,
    opened: 36,
    clicked: 18,
    replied: 8,
    createdBy: "Sarah Consultant",
    createdAt: "2026-07-01T09:00:00Z",
    companies: ["comp-1", "comp-2"],
    aiTone: "Professional",
    subjectTemplate: "Specialized Tech Talent Recruiting for {{CompanyName}}",
    bodyTemplate: "Hi {{ContactName}},\n\nI noticed that {{CompanyName}} is expanding its team in {{City}} and actively hiring in {{Industry}}. At Apex Staffing, we specialize in high-caliber talent acquisition. Our AI CRM matches verified candidates to your unique stack.\n\nWould you be open to a brief call this week to review top profiles for your open roles?\n\nBest regards,\nSarah Consultant"
  },
  {
    id: "camp-2",
    campaignName: "Mid-Market Logistics Partnership",
    description: "Campaign focusing on transport, operations, and logistics leaders regarding volume hire proposals.",
    status: "Draft",
    startDate: "2026-07-15",
    emailsSent: 0,
    emailsFailed: 0,
    opened: 0,
    clicked: 0,
    replied: 0,
    createdBy: "Sarah Consultant",
    createdAt: "2026-07-08T10:15:00Z",
    companies: ["comp-3"],
    aiTone: "Executive",
    subjectTemplate: "Optimizing High-Volume Staffing for {{CompanyName}}",
    bodyTemplate: "Dear Operations Team at {{CompanyName}},\n\nWith {{CompanyName}} in expansion mode, securing high-performing team leads and coordinators is key. Apex Staffing offers a streamlined screening protocol to fill critical logistics roles 40% faster than standard averages.\n\nLet's schedule a 10-minute briefing on your Texas expansion needs.\n\nSincerely,\nSarah Consultant"
  }
];

const DEFAULT_EMAILS: Email[] = [
  {
    id: "email-1",
    companyId: "comp-1",
    campaignId: "camp-1",
    subject: "Specialized Tech Talent Recruiting for TechNovus Solutions",
    body: "Hi HR Team,\n\nI noticed that TechNovus Solutions is expanding its team in San Francisco and actively hiring in Software & Technology. At Apex Staffing, we specialize in high-caliber talent acquisition. Our AI CRM matches verified candidates to your unique stack.\n\nWould you be open to a brief call this week to review top profiles for your open roles?\n\nBest regards,\nSarah Consultant",
    status: "Opened",
    gmailMessageId: "msg_1234567890",
    gmailThreadId: "thread_1234567890",
    sentAt: "2026-07-02T10:00:00Z",
    openedAt: "2026-07-02T11:45:00Z",
    createdAt: "2026-07-02T09:55:00Z"
  },
  {
    id: "email-2",
    companyId: "comp-1",
    campaignId: "camp-1",
    subject: "RE: Specialized Tech Talent Recruiting for TechNovus Solutions",
    body: "Hi Sarah, thanks for reaching out. Yes, we are actively looking for Senior Cloud Engineers. Could you send over 2-3 resume summaries? We can chat on Thursday at 2 PM.",
    status: "Replied",
    gmailMessageId: "msg_1234567891",
    gmailThreadId: "thread_1234567890",
    sentAt: "2026-07-03T14:20:00Z",
    openedAt: "2026-07-02T11:45:00Z",
    repliedAt: "2026-07-03T14:20:00Z",
    createdAt: "2026-07-03T14:20:00Z"
  },
  {
    id: "email-3",
    companyId: "comp-2",
    campaignId: "camp-1",
    subject: "Specialized Tech Talent Recruiting for Scribe Health AI",
    body: "Hi HR Team,\n\nI noticed that Scribe Health AI is expanding its team in Boston and actively hiring in Healthcare Tech. At Apex Staffing, we specialize in high-caliber talent acquisition. Our AI CRM matches verified candidates to your unique stack.\n\nWould you be open to a brief call this week to review top profiles for your open roles?\n\nBest regards,\nSarah Consultant",
    status: "Sent",
    gmailMessageId: "msg_1234567892",
    gmailThreadId: "thread_1234567892",
    sentAt: "2026-07-04T09:15:00Z",
    createdAt: "2026-07-04T09:10:00Z"
  }
];

const DEFAULT_AI_ANALYSES: AIAnalysis[] = [
  {
    id: "ana-1",
    companyId: "comp-1",
    leadScore: 94,
    industryAnalysis: "TechNovus Solutions operates in SaaS, Cloud computing and Developer Tools, which are seeing a 14% year-over-year global market expansion. Enterprise cloud transformation demand remains highly robust, insulated from consumer-driven market dips.",
    growthAnalysis: "Strong. Estimated revenue run rate is $12M, up 45% compared to the prior fiscal year. Strong VC backing from elite tech funds. Employee count grew from 80 to 120 over 6 months.",
    hiringPrediction: "Mass Hiring. Deep engineering backlogs and product expansion require massive software headcount. High demand for senior systems programmers, typescript developers, and devops specialists.",
    technologyStack: ["React", "TypeScript", "AWS Cloud", "Kubernetes", "Node.js", "Docker", "PostgreSQL"],
    summary: "High-potential target. Strongly funded, experiencing massive technical backlogs, and actively recruiting. Demonstrates high agency willingness (budget authorized).",
    recommendation: "Immediate high-priority outreach. Pitch senior TypeScript / AWS professionals. Focus on reduced time-to-hire and verified vetting.",
    bestContactTime: "Tuesday, 10:15 AM",
    followUpRecommendation: "Follow up in 3 business days if no reply. Recommended subject line: 'Verified Node/AWS candidate slate for TechNovus'",
    createdAt: "2026-07-10T12:00:00Z"
  },
  {
    id: "ana-2",
    companyId: "comp-2",
    leadScore: 82,
    industryAnalysis: "Scribe Health AI operates in healthcare dictation and medical documentation AI, a hyper-growth intersection of ML and Digital Health. Extremely strong secular tailwinds.",
    growthAnalysis: "Series A funding ($8.5M). Product is in active beta with 40+ clinical sites. Core engineering scaling fast.",
    hiringPrediction: "Hiring Soon. Actively preparing for massive product launch. Recruiting 3-4 medical transcription ML experts and security compliance engineers.",
    technologyStack: ["Python", "PyTorch", "Next.js", "Tailwind CSS", "FastAPI", "PostgreSQL", "HIPAA Compliant Cloud"],
    summary: "Excellent warm lead. Well funded, highly specialized product, immediate need to meet security compliance and scaling goals.",
    recommendation: "Pitch specialized AI/ML engineers or Full-Stack devs with HIPAA experience. Emphasize compliance screening credentials.",
    bestContactTime: "Wednesday, 1:45 PM",
    followUpRecommendation: "Follow up in 4 business days. Pitch ML engineer resume highlights.",
    createdAt: "2026-07-10T13:00:00Z"
  }
];

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    title: "Lead Score Alert: TechNovus",
    message: "TechNovus Solutions score updated to 94 (Hot Lead) based on recent hiring announcements.",
    type: "AI",
    read: false,
    createdAt: "2026-07-11T01:30:00Z"
  },
  {
    id: "notif-2",
    title: "Campaign Response Received",
    message: "TechNovus Solutions (HR Team) replied to 'Q3 High-Growth Tech Outreach'. Schedule Thursday 2pm.",
    type: "Email",
    read: false,
    createdAt: "2026-07-11T02:15:00Z"
  },
  {
    id: "notif-3",
    title: "Weekly Analytics Generated",
    message: "The campaign intelligence report for July 2026 is ready to review and export.",
    type: "System",
    read: true,
    createdAt: "2026-07-10T08:00:00Z"
  }
];

const DEFAULT_CHAT: ChatMessage[] = [
  {
    id: "chat-1",
    sender: "bot",
    text: "Hello! I am your Recruitment CRM AI Companion. You can ask me to write a proposal, analyze any company, explain metrics, find specific leads, or give campaign optimization tips. How can I assist you today?",
    timestamp: "2026-07-11T02:00:00Z"
  }
];

const DEFAULT_OAUTH: OAuthStatus = {
  connected: true,
  email: "jayamarylystra@gmail.com",
  scope: [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/userinfo.email"
  ],
  expiry: "2026-07-11T12:00:00Z"
};

export class LocalDB {
  private data: DBStructure;

  constructor() {
    this.data = this.load();
  }

  private load(): DBStructure {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const initial: DBStructure = {
        users: DEFAULT_USERS,
        companies: DEFAULT_COMPANIES,
        campaigns: DEFAULT_CAMPAIGNS,
        emails: DEFAULT_EMAILS,
        aiAnalyses: DEFAULT_AI_ANALYSES,
        notifications: DEFAULT_NOTIFICATIONS,
        chatMessages: DEFAULT_CHAT,
        oauthStatus: DEFAULT_OAUTH,
        campaignRecipients: [],
        emailHistories: [],
        emailTemplates: [],
        gmailTokens: [],
        drafts: []
      };
      this.saveFile(initial);
      return initial;
    }

    try {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(content) as DBStructure;
      // Merge with defaults in case of missing lists
      return {
        users: parsed.users || DEFAULT_USERS,
        companies: parsed.companies || DEFAULT_COMPANIES,
        campaigns: parsed.campaigns || DEFAULT_CAMPAIGNS,
        emails: parsed.emails || DEFAULT_EMAILS,
        aiAnalyses: parsed.aiAnalyses || DEFAULT_AI_ANALYSES,
        notifications: parsed.notifications || DEFAULT_NOTIFICATIONS,
        chatMessages: parsed.chatMessages || DEFAULT_CHAT,
        oauthStatus: parsed.oauthStatus || DEFAULT_OAUTH,
        campaignRecipients: parsed.campaignRecipients || [],
        emailHistories: parsed.emailHistories || [],
        emailTemplates: parsed.emailTemplates || [],
        gmailTokens: parsed.gmailTokens || [],
        drafts: parsed.drafts || []
      };
    } catch (e) {
      console.error("Failed to read DB file, fallback to defaults", e);
      return {
        users: DEFAULT_USERS,
        companies: DEFAULT_COMPANIES,
        campaigns: DEFAULT_CAMPAIGNS,
        emails: DEFAULT_EMAILS,
        aiAnalyses: DEFAULT_AI_ANALYSES,
        notifications: DEFAULT_NOTIFICATIONS,
        chatMessages: DEFAULT_CHAT,
        oauthStatus: DEFAULT_OAUTH,
        campaignRecipients: [],
        emailHistories: [],
        emailTemplates: [],
        gmailTokens: [],
        drafts: []
      };
    }
  }

  private saveFile(structure: DBStructure): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(structure, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to save DB file", e);
    }
  }

  private persist(): void {
    this.saveFile(this.data);
  }

  // Users
  getUsers() { return this.data.users; }
  addUser(user: User) { this.data.users.push(user); this.persist(); return user; }
  findUserByEmail(email: string) { return this.data.users.find(u => u.email === email); }

  // Companies
  getCompanies() { return this.data.companies; }
  getCompany(id: string) { return this.data.companies.find(c => c.id === id); }
  addCompany(company: Omit<Company, "id" | "createdAt" | "updatedAt">) {
    const newCompany: Company = {
      ...company,
      id: "comp-" + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.companies.unshift(newCompany);
    this.persist();
    return newCompany;
  }
  updateCompany(id: string, updates: Partial<Company>) {
    const idx = this.data.companies.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.data.companies[idx] = {
        ...this.data.companies[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.persist();
      return this.data.companies[idx];
    }
    return null;
  }
  deleteCompany(id: string) {
    const originalLength = this.data.companies.length;
    this.data.companies = this.data.companies.filter(c => c.id !== id);
    if (this.data.companies.length !== originalLength) {
      this.persist();
      return true;
    }
    return false;
  }

  // Campaigns
  getCampaigns() { return this.data.campaigns; }
  getCampaign(id: string) { return this.data.campaigns.find(c => c.id === id); }
  addCampaign(campaign: Omit<Campaign, "id" | "emailsSent" | "emailsFailed" | "opened" | "clicked" | "replied" | "createdAt">) {
    const newCampaign: Campaign = {
      ...campaign,
      id: "camp-" + Math.random().toString(36).substr(2, 9),
      emailsSent: 0,
      emailsFailed: 0,
      opened: 0,
      clicked: 0,
      replied: 0,
      createdAt: new Date().toISOString()
    };
    this.data.campaigns.unshift(newCampaign);
    this.persist();
    return newCampaign;
  }
  updateCampaign(id: string, updates: Partial<Campaign>) {
    const idx = this.data.campaigns.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.data.campaigns[idx] = { ...this.data.campaigns[idx], ...updates };
      this.persist();
      return this.data.campaigns[idx];
    }
    return null;
  }
  deleteCampaign(id: string) {
    this.data.campaigns = this.data.campaigns.filter(c => c.id !== id);
    this.persist();
  }

  // Emails
  getEmails() { return this.data.emails; }
  getEmailsForCompany(companyId: string) { return this.data.emails.filter(e => e.companyId === companyId); }
  addEmail(email: Omit<Email, "id" | "createdAt">) {
    const newEmail: Email = {
      ...email,
      id: "email-" + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    this.data.emails.unshift(newEmail);
    this.persist();
    return newEmail;
  }
  updateEmail(id: string, updates: Partial<Email>) {
    const idx = this.data.emails.findIndex(e => e.id === id);
    if (idx !== -1) {
      this.data.emails[idx] = { ...this.data.emails[idx], ...updates };
      this.persist();
      return this.data.emails[idx];
    }
    return null;
  }

  // AI Analysis
  getAnalyses() { return this.data.aiAnalyses; }
  getAnalysisForCompany(companyId: string) { return this.data.aiAnalyses.find(a => a.companyId === companyId); }
  saveAnalysis(analysis: Omit<AIAnalysis, "id" | "createdAt">) {
    const existingIdx = this.data.aiAnalyses.findIndex(a => a.companyId === analysis.companyId);
    const newAnalysis: AIAnalysis = {
      ...analysis,
      id: "ana-" + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    if (existingIdx !== -1) {
      this.data.aiAnalyses[existingIdx] = newAnalysis;
    } else {
      this.data.aiAnalyses.push(newAnalysis);
    }
    this.persist();
    return newAnalysis;
  }

  // Notifications
  getNotifications() { return this.data.notifications; }
  addNotification(notification: Omit<Notification, "id" | "createdAt">) {
    const newNotif: Notification = {
      ...notification,
      id: "notif-" + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    this.data.notifications.unshift(newNotif);
    this.persist();
    return newNotif;
  }
  markNotificationRead(id: string) {
    const idx = this.data.notifications.findIndex(n => n.id === id);
    if (idx !== -1) {
      this.data.notifications[idx].read = true;
      this.persist();
    }
  }
  markAllNotificationsRead() {
    this.data.notifications.forEach(n => n.read = true);
    this.persist();
  }

  // Chatbot Messages
  getChatMessages() { return this.data.chatMessages; }
  addChatMessage(msg: Omit<ChatMessage, "id" | "timestamp">) {
    const newMsg: ChatMessage = {
      ...msg,
      id: "chat-" + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    this.data.chatMessages.push(newMsg);
    this.persist();
    return newMsg;
  }
  clearChat() {
    this.data.chatMessages = [DEFAULT_CHAT[0]];
    this.persist();
  }

  // OAuthStatus
  getOAuthStatus() { return this.data.oauthStatus; }
  updateOAuthStatus(status: Partial<OAuthStatus>) {
    this.data.oauthStatus = { ...this.data.oauthStatus, ...status };
    this.persist();
    return this.data.oauthStatus;
  }

  // CampaignRecipients
  getCampaignRecipients() { return this.data.campaignRecipients || []; }
  addCampaignRecipient(cr: Omit<CampaignRecipient, "id">) {
    const newCr: CampaignRecipient = {
      ...cr,
      id: "cr-" + Math.random().toString(36).substr(2, 9)
    };
    if (!this.data.campaignRecipients) this.data.campaignRecipients = [];
    this.data.campaignRecipients.push(newCr);
    this.persist();
    return newCr;
  }
  updateCampaignRecipient(id: string, updates: Partial<CampaignRecipient>) {
    if (!this.data.campaignRecipients) this.data.campaignRecipients = [];
    const idx = this.data.campaignRecipients.findIndex(cr => cr.id === id);
    if (idx !== -1) {
      this.data.campaignRecipients[idx] = { ...this.data.campaignRecipients[idx], ...updates };
      this.persist();
      return this.data.campaignRecipients[idx];
    }
    return null;
  }

  // EmailHistories
  getEmailHistories() { return this.data.emailHistories || []; }
  addEmailHistory(eh: Omit<EmailHistory, "id">) {
    const newEh: EmailHistory = {
      ...eh,
      id: "eh-" + Math.random().toString(36).substr(2, 9)
    };
    if (!this.data.emailHistories) this.data.emailHistories = [];
    this.data.emailHistories.unshift(newEh);
    this.persist();
    return newEh;
  }
  updateEmailHistory(id: string, updates: Partial<EmailHistory>) {
    if (!this.data.emailHistories) this.data.emailHistories = [];
    const idx = this.data.emailHistories.findIndex(eh => eh.id === id);
    if (idx !== -1) {
      this.data.emailHistories[idx] = { ...this.data.emailHistories[idx], ...updates };
      this.persist();
      return this.data.emailHistories[idx];
    }
    return null;
  }

  // EmailTemplates
  getEmailTemplates() { return this.data.emailTemplates || []; }
  addEmailTemplate(et: Omit<EmailTemplate, "id" | "createdAt">) {
    const newEt: EmailTemplate = {
      ...et,
      id: "et-" + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    if (!this.data.emailTemplates) this.data.emailTemplates = [];
    this.data.emailTemplates.unshift(newEt);
    this.persist();
    return newEt;
  }

  // GmailTokens
  getGmailTokens() { return this.data.gmailTokens || []; }
  addGmailToken(gt: Omit<GmailToken, "id">) {
    const newGt: GmailToken = {
      ...gt,
      id: "gt-" + Math.random().toString(36).substr(2, 9)
    };
    if (!this.data.gmailTokens) this.data.gmailTokens = [];
    this.data.gmailTokens.push(newGt);
    this.persist();
    return newGt;
  }

  // Drafts
  getDrafts() { return this.data.drafts || []; }
  addDraft(d: Omit<Draft, "id" | "createdAt">) {
    const newD: Draft = {
      ...d,
      id: "dr-" + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    if (!this.data.drafts) this.data.drafts = [];
    this.data.drafts.unshift(newD);
    this.persist();
    return newD;
  }
  deleteDraft(id: string) {
    if (!this.data.drafts) this.data.drafts = [];
    this.data.drafts = this.data.drafts.filter(d => d.id !== id && d.gmailDraftId !== id);
    this.persist();
  }

  // Dashboard Metrics
  getStats(): DashboardStats {
    const companies = this.data.companies;
    const campaigns = this.data.campaigns;
    const emails = this.data.emails;
    const drafts = this.data.drafts || [];
    const emailHistories = this.data.emailHistories || [];

    const totalCompanies = companies.length;
    const activeCampaigns = campaigns.filter(c => c.status === "Running").length;
    const gmailConnected = this.data.oauthStatus.connected;

    // Filter sent today (last 24h)
    const today = new Date();
    today.setHours(today.getHours() - 24);
    
    // We can count sent and failed from emailHistories as well as emails
    const emailsSent = emailHistories.filter(e => e.status === "Sent").length || emails.filter(e => e.status === "Sent").length;
    const emailsFailed = emailHistories.filter(e => e.status === "Failed").length || emails.filter(e => e.status === "Failed").length;
    const repliesReceived = emailHistories.filter(e => e.status === "Replied").length || emails.filter(e => e.status === "Replied").length;
    
    const todayEmailsSent = emailHistories.filter(e => e.status === "Sent" && e.sentTime && new Date(e.sentTime) >= today).length ||
      emails.filter(e => e.status === "Sent" && e.sentAt && new Date(e.sentAt) >= today).length;

    const withScores = companies.filter(c => c.leadScore > 0);
    const avgLeadScore = withScores.length > 0
      ? Math.round(withScores.reduce((sum, c) => sum + c.leadScore, 0) / withScores.length)
      : 70;

    // Estimate based on employee count
    const openPositionsEstimate = companies.reduce((sum, c) => {
      if (c.hiringStatus === "Mass Hiring") return sum + 15;
      if (c.hiringStatus === "Expansion Hiring") return sum + 8;
      if (c.hiringStatus === "Hiring Soon") return sum + 3;
      if (c.hiringStatus === "Campus Hiring") return sum + 5;
      return sum;
    }, 0);

    return {
      totalCompanies,
      activeCampaigns,
      gmailConnected,
      todayEmailsSent,
      repliesReceived,
      avgLeadScore,
      monthlyGrowthRate: 14.5, // Seed constant growth
      openPositionsEstimate,
      emailsFailed,
      totalCampaigns: campaigns.length,
      totalDrafts: drafts.length
    };
  }
}

export const dbInstance = new LocalDB();
