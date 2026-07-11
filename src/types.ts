export type UserRole = "Super Admin" | "Admin" | "HR Consultant" | "Recruitment Manager" | "Viewer";
export type LeadPriority = "Low" | "Medium" | "High";
export type LeadStatus = "New" | "Contacted" | "In Progress" | "Converted" | "Nurturing" | "Lost";
export type CampaignStatus = "Draft" | "Running" | "Paused" | "Completed" | "Cancelled";
export type EmailStatus = "Draft" | "Pending" | "Sent" | "Failed" | "Opened" | "Replied";
export type NotificationType = "Campaign" | "Email" | "AI" | "System" | "Security";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  company?: string;
  status: "Active" | "Inactive";
  lastLogin?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  companyName: string;
  industry: string;
  website: string;
  linkedin?: string;
  email: string;
  phone?: string;
  city: string;
  country: string;
  employees: number;
  hiringStatus: "Hiring Soon" | "Not Hiring" | "Mass Hiring" | "Campus Hiring" | "Expansion Hiring";
  recruitmentIntensity: "Low" | "Medium" | "High";
  leadScore: number; // 0-100
  priority: LeadPriority;
  status: LeadStatus;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  campaignName: string;
  description: string;
  status: CampaignStatus;
  startDate?: string;
  endDate?: string;
  emailsSent: number;
  emailsFailed: number;
  opened: number;
  clicked: number;
  replied: number;
  createdBy: string;
  createdAt: string;
  companies: string[]; // Company IDs
  aiTone: string;
  subjectTemplate: string;
  bodyTemplate: string;
}

export interface Email {
  id: string;
  companyId: string;
  campaignId?: string;
  subject: string;
  body: string;
  status: EmailStatus;
  gmailMessageId?: string;
  gmailThreadId?: string;
  sentAt?: string;
  openedAt?: string;
  repliedAt?: string;
  createdAt: string;
}

export interface AIAnalysis {
  id: string;
  companyId: string;
  leadScore: number;
  industryAnalysis: string;
  growthAnalysis: string;
  hiringPrediction: string;
  technologyStack: string[];
  summary: string;
  recommendation: string;
  bestContactTime: string;
  followUpRecommendation: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  userId?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export interface OAuthStatus {
  connected: boolean;
  email?: string;
  scope?: string[];
  expiry?: string;
}

export interface DashboardStats {
  totalCompanies: number;
  activeCampaigns: number;
  gmailConnected: boolean;
  todayEmailsSent: number;
  repliesReceived: number;
  avgLeadScore: number;
  monthlyGrowthRate: number;
  openPositionsEstimate: number;
  emailsFailed?: number;
  totalCampaigns?: number;
  totalDrafts?: number;
}

export interface CampaignRecipient {
  id: string;
  campaignId: string;
  companyId: string;
  status: "Pending" | "Sent" | "Failed";
  gmailMessageId?: string;
  gmailThreadId?: string;
  sentAt?: string;
  error?: string;
}

export interface EmailHistory {
  id: string;
  gmailMessageId?: string;
  gmailThreadId?: string;
  sentTime?: string;
  status: EmailStatus;
  campaignId?: string;
  companyId: string;
  userId: string;
  subject: string;
  body: string;
  error?: string;
  companyName?: string;
  campaignName?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subjectTemplate: string;
  bodyTemplate: string;
  tone: string;
  createdBy: string;
  createdAt: string;
}

export interface GmailToken {
  id: string;
  userId: string;
  email: string;
  accessToken: string;
  refreshToken?: string;
  expiryDate?: string;
  scope: string[];
  connected: boolean;
}

export interface Draft {
  id: string;
  gmailDraftId: string;
  companyId: string;
  campaignId?: string;
  subject: string;
  body: string;
  status: "Draft";
  createdAt: string;
}

