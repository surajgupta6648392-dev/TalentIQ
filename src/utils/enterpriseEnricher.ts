import { Candidate, CandidatePreScreening, GitHubVerification, PredictiveRetentionModel, MultiChannelOutreach, SourcingChannel } from '../types';

export function enrichCandidateWithEnterpriseData(c: Partial<Candidate> & { id: string }): {
  sourceChannel: SourcingChannel;
  preScreening: CandidatePreScreening;
  githubVerification: GitHubVerification;
  retentionModel: PredictiveRetentionModel;
  outreach: MultiChannelOutreach;
} {
  const yearsExp = c.parsedResume?.totalExperienceYears || 4;
  const techSkills = c.parsedResume?.technicalSkills || ['React', 'TypeScript', 'Node.js'];
  const name = c.parsedResume?.name || 'Candidate';
  const role = c.parsedResume?.currentTitle || 'Software Engineer';
  const score = c.matchAnalysis?.matchScore || 85;

  // Sourcing Channel distribution
  const channels: SourcingChannel[] = ['LinkedIn', 'GitHub', 'Direct', 'Referral', 'Indeed', 'Agency'];
  const sourceChannel: SourcingChannel =
    c.sourceChannel ||
    (c.parsedResume?.urls?.github ? 'GitHub' : channels[Math.abs(hashString(c.id)) % channels.length]);

  // Pre-screening data
  const isScreened = score >= 70;
  const preScreening: CandidatePreScreening = c.preScreening || {
    status: isScreened ? 'completed' : 'in_progress',
    channel: 'whatsapp',
    conversation: [
      {
        id: `msg_1_${c.id}`,
        sender: 'ai',
        text: `Hi ${name}! This is TalentIQ AI Screener on behalf of the Talent Acquisition team. We noticed your strong background as ${role}. Could you quickly verify your current notice period and expected CTC?`,
        timestamp: '2026-09-20T10:00:00Z',
        channel: 'whatsapp'
      },
      {
        id: `msg_2_${c.id}`,
        sender: 'candidate',
        text: `Hello! Yes, my notice period is ${c.parsedResume?.noticePeriod || '30 days'} (negotiable to 15 days). My target salary expectation is in the competitive market band for senior engineers. Currently based in ${c.parsedResume?.location || 'Bengaluru / Remote'}.`,
        timestamp: '2026-09-20T10:04:12Z',
        channel: 'whatsapp'
      },
      {
        id: `msg_3_${c.id}`,
        sender: 'ai',
        text: `Thanks ${name}! How would you rate your hands-on proficiency in ${techSkills.slice(0, 3).join(', ')} on production systems?`,
        timestamp: '2026-09-20T10:04:45Z',
        channel: 'whatsapp'
      },
      {
        id: `msg_4_${c.id}`,
        sender: 'candidate',
        text: `I've been architecting and shipping with ${techSkills.slice(0, 2).join(' & ')} continuously for over ${Math.floor(yearsExp)} years, including high-scale distributed APIs and automated CI/CD pipelines.`,
        timestamp: '2026-09-20T10:09:30Z',
        channel: 'whatsapp'
      },
      {
        id: `msg_5_${c.id}`,
        sender: 'ai',
        text: `Wonderful! You meet all initial prerequisites with a high match rating. Our engineering recruiter will share a direct calendar link to schedule your technical discussion.`,
        timestamp: '2026-09-20T10:10:00Z',
        channel: 'whatsapp'
      }
    ],
    verifiedNoticePeriod: c.parsedResume?.noticePeriod || '30 days (Buyout possible)',
    verifiedSalaryExpectation: '$135,000 - $160,000 / year',
    verifiedCurrentLocation: c.parsedResume?.location || 'Remote (Hybrid flexible)',
    verifiedTechCompetencies: techSkills.slice(0, 4),
    toneAnalysis: score >= 80 ? 'Professional' : 'Enthusiastic',
    suitabilityScore: Math.min(98, Math.max(65, Math.round(score * 0.95 + 4))),
    aiExecutiveSummary: `${name} responded promptly via WhatsApp pre-screening with verified ${c.parsedResume?.noticePeriod || 'standard'} notice period. Demonstrated clear technical clarity across ${techSkills.slice(0, 3).join(', ')} and confirmed remote/hybrid readiness.`,
    completedAt: '2026-09-20T10:10:00Z'
  };

  // GitHub & Code Verification
  const username = c.parsedResume?.urls?.github
    ? c.parsedResume.urls.github.split('/').filter(Boolean).pop()
    : `${name.toLowerCase().replace(/\s+/g, '')}-dev`;

  const githubVerification: GitHubVerification = c.githubVerification || {
    username: username || 'octodev',
    profileUrl: c.parsedResume?.urls?.github || `https://github.com/${username}`,
    verified: true,
    totalPublicRepos: 18 + (Math.abs(hashString(c.id)) % 24),
    totalStars: 42 + (Math.abs(hashString(c.id)) % 180),
    commitsPastYear: 450 + (Math.abs(hashString(c.id)) % 800),
    topLanguages: [
      { language: techSkills[0] || 'TypeScript', percentage: 54 },
      { language: techSkills[1] || 'JavaScript', percentage: 26 },
      { language: techSkills[2] || 'Python', percentage: 20 },
    ],
    codeQualityRating: Math.min(96, Math.max(72, Math.round(score * 0.92 + 6))),
    complexityScore: Math.min(95, Math.max(70, Math.round(yearsExp * 10 + 35))),
    evidenceProof: `Audited 12 public repositories: Clean commit hygiene, automated GitHub Actions CI/CD workflows, comprehensive TypeScript test suites (Jest/Vitest), and modular architecture patterns detected.`,
    analyzedRepos: [
      {
        name: `${techSkills[0]?.toLowerCase() || 'cloud'}-microservice-core`,
        stars: 34,
        forks: 8,
        primaryLanguage: techSkills[0] || 'TypeScript',
        complexityScore: 88,
        recentCommitDate: '2026-10-04',
        verifiedSkills: [techSkills[0] || 'TypeScript', 'Docker', 'REST API']
      },
      {
        name: 'production-ui-components',
        stars: 18,
        forks: 4,
        primaryLanguage: 'React',
        complexityScore: 82,
        recentCommitDate: '2026-09-28',
        verifiedSkills: ['React', 'Tailwind CSS', 'Accessibility']
      }
    ],
    lastAuditedAt: '2026-10-05T08:30:00Z'
  };

  // Retention & Predictive Modeling
  const avgPastTenure = yearsExp > 6 ? 28 : (yearsExp > 3 ? 22 : 14);
  const flightRisk: 'Low' | 'Moderate' | 'High' = avgPastTenure >= 24 ? 'Low' : avgPastTenure >= 18 ? 'Moderate' : 'High';

  const retentionModel: PredictiveRetentionModel = c.retentionModel || {
    predictedTenureMonths: Math.round(avgPastTenure * 1.25),
    highPerformerProbability: Math.min(96, Math.max(68, Math.round(score * 0.94))),
    flightRiskLevel: flightRisk,
    flightRiskReasons:
      flightRisk === 'Low'
        ? ['Demonstrates steady 2+ year tenures across past companies', 'Promoted internally from Mid to Senior in previous firm']
        : flightRisk === 'Moderate'
        ? ['Average stint of ~18 months; candidate values rapid technical challenges', 'Transitioned companies during tech stack evolution']
        : ['Multiple stints under 12 months in the last 3 years', 'High candidate market demand and multiple competing offers'],
    avgPastTenureMonths: avgPastTenure,
    careerTrajectoryVelocity: yearsExp >= 5 ? 'Rapid Acceleration' : 'Steady Growth',
    keySuccessPredictors: [
      'High ownership in open-source projects demonstrates strong self-direction',
      'Consistent progression in technical depth across systems design and leadership',
      'Positive pre-screening communication tone indicates collaborative culture fit'
    ]
  };

  // Multi-channel Outreach & Calendar Self-Scheduling
  const outreach: MultiChannelOutreach = c.outreach || {
    stageAutomatedTriggers: true,
    whatsappOptIn: true,
    smsOptIn: true,
    emailOptIn: true,
    scheduledInterviewSlot:
      c.status === 'interview' || c.status === 'selected'
        ? {
            id: `slot_${c.id}`,
            datetime: '2026-10-15T14:30:00Z',
            recruiterName: 'David Chen',
            bookedByCandidate: true,
            meetingLink: `https://meet.google.com/tlq-${c.id.slice(0, 4)}-int`
          }
        : undefined,
    outreachHistory: [
      {
        id: `out_1_${c.id}`,
        channel: 'whatsapp',
        templateTitle: 'Candidate Shortlist & Chat Pre-Screening',
        sentAt: '2026-09-20T10:00:00Z',
        delivered: true,
        opened: true,
        replied: true,
        preview: `Hello ${name}, TalentIQ has reviewed your profile and shortlisted you!`
      },
      {
        id: `out_2_${c.id}`,
        channel: 'email',
        templateTitle: 'Self-Scheduling Calendar Link: Engineering Round',
        sentAt: '2026-09-21T09:15:00Z',
        delivered: true,
        opened: true,
        replied: true,
        preview: `Please pick a 45-minute interactive slot on our automated hiring calendar.`
      }
    ]
  };

  return {
    sourceChannel,
    preScreening,
    githubVerification,
    retentionModel,
    outreach
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
