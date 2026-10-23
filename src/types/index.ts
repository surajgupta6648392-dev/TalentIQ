export type UserRole = 'admin' | 'recruiter' | 'hiring_manager';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  dateOfBirth?: string;
}

export type CandidateStatus =
  | 'applied'
  | 'screening'
  | 'shortlisted'
  | 'interview'
  | 'selected'
  | 'rejected';

export type MatchCategory =
  | 'Strong Match'
  | 'Potential Match'
  | 'Needs Review'
  | 'Does Not Meet Requirements';

export interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  location: string;
  totalExperienceYears: number;
  currentTitle: string;
  previousTitles: string[];
  companies: string[];
  employmentHistory: {
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }[];
  technicalSkills: string[];
  softSkills: string[];
  education: {
    degree: string;
    field: string;
    institution: string;
    graduationYear: string;
  }[];
  certifications: string[];
  projects: {
    title: string;
    technologies: string[];
    description: string;
    url?: string;
  }[];
  achievements: string[];
  languages: string[];
  noticePeriod: string;
  urls: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  rawText: string;
}

export interface ScoringWeights {
  requiredSkills: number;     // e.g. 35
  relevantExperience: number; // e.g. 25
  jobRoleAlignment: number;   // e.g. 15
  preferredSkills: number;    // e.g. 10
  educationCertifications: number; // e.g. 10
  projectsDomain: number;     // e.g. 5
}

export interface ScoreBreakdown {
  requiredSkillsScore: number;     // 0 - 100
  relevantExperienceScore: number; // 0 - 100
  jobRoleAlignmentScore: number;   // 0 - 100
  preferredSkillsScore: number;    // 0 - 100
  educationCertScore: number;      // 0 - 100
  projectsDomainScore: number;     // 0 - 100
  weightedTotal: number;           // 0 - 100
}

export interface MatchAnalysis {
  matchScore: number; // 0 - 100
  category: MatchCategory;
  scoreBreakdown: ScoreBreakdown;
  matchedRequiredSkills: string[];
  missingRequiredSkills: string[];
  matchedPreferredSkills: string[];
  missingPreferredSkills: string[];
  relevantExperienceYears: number;
  keyStrengths: string[];
  potentialConcerns: string[];
  evidenceQuotes: {
    claim: string;
    evidence: string;
    confidence: 'high' | 'medium' | 'low';
  }[];
  explanationSummary: string;
  aiModelVersion: string;
  evaluatedAt: string;
  weightsUsed: ScoringWeights;
}

export type SourcingChannel = 'LinkedIn' | 'GitHub' | 'Direct' | 'Referral' | 'Indeed' | 'Agency';

export interface PreScreeningMessage {
  id: string;
  sender: 'ai' | 'candidate' | 'recruiter';
  text: string;
  timestamp: string;
  channel?: 'whatsapp' | 'web_portal' | 'sms';
}

export interface CandidatePreScreening {
  status: 'not_initiated' | 'in_progress' | 'completed' | 'declined';
  channel: 'whatsapp' | 'web_portal';
  conversation: PreScreeningMessage[];
  verifiedNoticePeriod?: string;
  verifiedSalaryExpectation?: string;
  verifiedCurrentLocation?: string;
  verifiedTechCompetencies?: string[];
  toneAnalysis?: 'Professional' | 'Enthusiastic' | 'Hesitant' | 'Demanding' | 'Neutral';
  suitabilityScore?: number; // 0 - 100
  aiExecutiveSummary?: string;
  completedAt?: string;
}

export interface GitHubRepoAnalysis {
  name: string;
  stars: number;
  forks: number;
  primaryLanguage: string;
  complexityScore: number; // 0 - 100
  recentCommitDate: string;
  verifiedSkills: string[];
}

export interface GitHubVerification {
  username?: string;
  profileUrl?: string;
  verified: boolean;
  totalPublicRepos: number;
  totalStars: number;
  commitsPastYear: number;
  topLanguages: { language: string; percentage: number }[];
  codeQualityRating: number; // 0 - 100
  complexityScore: number; // 0 - 100
  evidenceProof: string;
  analyzedRepos: GitHubRepoAnalysis[];
  lastAuditedAt?: string;
}

export interface PredictiveRetentionModel {
  predictedTenureMonths: number;
  highPerformerProbability: number; // 0 - 100%
  flightRiskLevel: 'Low' | 'Moderate' | 'High';
  flightRiskReasons: string[];
  avgPastTenureMonths: number;
  careerTrajectoryVelocity: 'Rapid Acceleration' | 'Steady Growth' | 'Lateral Stability';
  keySuccessPredictors: string[];
}

export interface InterviewBookingSlot {
  id: string;
  datetime: string;
  recruiterName: string;
  bookedByCandidate: boolean;
  meetingLink?: string;
}

export interface MultiChannelOutreach {
  stageAutomatedTriggers: boolean;
  whatsappOptIn: boolean;
  smsOptIn: boolean;
  emailOptIn: boolean;
  scheduledInterviewSlot?: InterviewBookingSlot;
  outreachHistory: {
    id: string;
    channel: 'whatsapp' | 'sms' | 'email';
    templateTitle: string;
    sentAt: string;
    delivered: boolean;
    opened?: boolean;
    replied?: boolean;
    preview: string;
  }[];
}

export interface Candidate {
  id: string;
  jobId: string;
  jobTitle?: string;
  parsedResume: ParsedResume;
  matchAnalysis?: MatchAnalysis;
  status: CandidateStatus;
  notes: CandidateNote[];
  tags: string[];
  assignedRecruiterId?: string;
  assignedRecruiterName?: string;
  uploadedAt: string;
  uploadedBy: string;
  originalFileName: string;
  originalFileSize: number;
  duplicateWarning?: {
    matchedCandidateId: string;
    reason: string;
  };
  timeline: CandidateTimelineEvent[];
  sourceChannel?: SourcingChannel;
  preScreening?: CandidatePreScreening;
  githubVerification?: GitHubVerification;
  retentionModel?: PredictiveRetentionModel;
  outreach?: MultiChannelOutreach;
}

export interface CandidateNote {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  text: string;
  createdAt: string;
}

export interface CandidateTimelineEvent {
  id: string;
  timestamp: string;
  actorName: string;
  action: string;
  details?: string;
}

export interface JobDescription {
  id: string;
  title: string;
  department: string;
  location: string;
  workplaceType: 'Remote' | 'Hybrid' | 'On-site';
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  minExperienceYears: number;
  maxExperienceYears: number;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  overview: string;
  mandatoryRequirements: string[];
  preferredRequirements: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  certifications: string[];
  degrees: string[];
  domainKeywords: string[];
  scoringWeights: ScoringWeights;
  strongMatchThreshold: number; // default 80
  potentialMatchThreshold: number; // default 65
  needsReviewThreshold: number; // default 50
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  status: 'Open' | 'Paused' | 'Closed';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  targetType: 'candidate' | 'job' | 'system' | 'scoring_weights';
  targetId: string;
  details: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  linkTab?: string;
}

export interface SystemSettings {
  blindScreeningDefault: boolean;
  dataRetentionDays: number;
  duplicateDetectionStrictness: 'high' | 'medium' | 'low';
  allowHiringManagerEditJobs: boolean;
  aiAutoScreenNewUploads: boolean;
}
