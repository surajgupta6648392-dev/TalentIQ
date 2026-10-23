import {
  ParsedResume,
  JobDescription,
  ScoringWeights,
  ScoreBreakdown,
  MatchAnalysis,
  MatchCategory,
} from '../types';

export const SYNONYM_MAP: Record<string, string[]> = {
  javascript: ['js', 'ecmascript', 'javascript', 'vanilla js'],
  typescript: ['ts', 'typescript'],
  react: ['react', 'reactjs', 'react.js', 'react native'],
  node: ['node', 'nodejs', 'node.js'],
  python: ['python', 'py', 'python3'],
  kubernetes: ['kubernetes', 'k8s', 'kubectl'],
  docker: ['docker', 'containerization', 'containers'],
  aws: ['aws', 'amazon web services', 'ec2', 's3', 'lambda'],
  gcp: ['gcp', 'google cloud', 'google cloud platform'],
  azure: ['azure', 'microsoft azure'],
  postgresql: ['postgres', 'postgresql', 'psql'],
  mongodb: ['mongo', 'mongodb'],
  graphql: ['graphql', 'apollo'],
  ci_cd: ['ci/cd', 'cicd', 'continuous integration', 'github actions', 'jenkins', 'gitlab ci'],
  sql: ['sql', 'relational database', 'rdbms', 'mysql', 'sqlite'],
  machine_learning: ['machine learning', 'ml', 'deep learning', 'ai', 'artificial intelligence'],
  tailwind: ['tailwind', 'tailwindcss', 'tailwind css'],
  nextjs: ['next', 'nextjs', 'next.js'],
};

export function normalizeSkill(skill: string): string {
  const clean = skill.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ');
  for (const [canonical, aliases] of Object.entries(SYNONYM_MAP)) {
    if (aliases.some(alias => clean.includes(alias.toLowerCase()))) {
      return canonical;
    }
  }
  return clean;
}

export function matchSkillAgainstList(targetSkill: string, candidateSkills: string[], resumeText: string): { matched: boolean; evidence?: string } {
  const normTarget = normalizeSkill(targetSkill);
  const lowerTarget = targetSkill.toLowerCase().trim();

  // 1. Direct or synonym match in technicalSkills
  for (const candSkill of candidateSkills) {
    if (candSkill.toLowerCase().trim() === lowerTarget || normalizeSkill(candSkill) === normTarget) {
      return { matched: true, evidence: `Listed explicitly in skills: "${candSkill}"` };
    }
  }

  // 2. Semantic/contextual presence in raw text
  const lowerResume = resumeText.toLowerCase();
  if (lowerResume.includes(lowerTarget)) {
    // Find context excerpt
    const idx = lowerResume.indexOf(lowerTarget);
    const start = Math.max(0, idx - 40);
    const end = Math.min(resumeText.length, idx + lowerTarget.length + 50);
    const snippet = resumeText.substring(start, end).replace(/\s+/g, ' ').trim();
    return { matched: true, evidence: `Found in resume context: "...${snippet}..."` };
  }

  // 3. Synonym match in raw text
  const aliases = SYNONYM_MAP[normTarget] || [];
  for (const alias of aliases) {
    if (lowerResume.includes(alias)) {
      const idx = lowerResume.indexOf(alias);
      const start = Math.max(0, idx - 40);
      const end = Math.min(resumeText.length, idx + alias.length + 50);
      const snippet = resumeText.substring(start, end).replace(/\s+/g, ' ').trim();
      return { matched: true, evidence: `Mentioned via synonym "${alias}": "...${snippet}..."` };
    }
  }

  return { matched: false };
}

export function calculateLocalMatch(
  resume: ParsedResume,
  jd: JobDescription,
  customWeights?: ScoringWeights
): MatchAnalysis {
  const weights: ScoringWeights = customWeights || jd.scoringWeights;

  // 1. Required Skills Score
  const matchedRequired: string[] = [];
  const missingRequired: string[] = [];
  const evidenceQuotes: MatchAnalysis['evidenceQuotes'] = [];

  for (const skill of jd.requiredSkills) {
    const res = matchSkillAgainstList(skill, resume.technicalSkills, resume.rawText);
    if (res.matched) {
      matchedRequired.push(skill);
      evidenceQuotes.push({
        claim: `Proficiency in ${skill}`,
        evidence: res.evidence || `Confirmed in resume skills and project experience.`,
        confidence: 'high',
      });
    } else {
      missingRequired.push(skill);
    }
  }

  const reqSkillScore = jd.requiredSkills.length > 0
    ? Math.round((matchedRequired.length / jd.requiredSkills.length) * 100)
    : 100;

  // 2. Preferred Skills Score
  const matchedPreferred: string[] = [];
  const missingPreferred: string[] = [];

  for (const skill of jd.preferredSkills) {
    const res = matchSkillAgainstList(skill, resume.technicalSkills, resume.rawText);
    if (res.matched) {
      matchedPreferred.push(skill);
      evidenceQuotes.push({
        claim: `Preferred skill: ${skill}`,
        evidence: res.evidence || `Found in candidate profile.`,
        confidence: 'medium',
      });
    } else {
      missingPreferred.push(skill);
    }
  }

  const prefSkillScore = jd.preferredSkills.length > 0
    ? Math.round((matchedPreferred.length / jd.preferredSkills.length) * 100)
    : 80;

  // 3. Relevant Experience Score
  const candExp = resume.totalExperienceYears || 0;
  let expScore = 0;
  if (candExp >= jd.minExperienceYears) {
    // Meets or exceeds minimum
    const excess = candExp - jd.minExperienceYears;
    expScore = Math.min(100, 80 + excess * 5);
  } else {
    // Below minimum
    expScore = Math.max(10, Math.round((candExp / Math.max(1, jd.minExperienceYears)) * 75));
  }

  // 4. Job Role Alignment
  const candTitle = (resume.currentTitle || '').toLowerCase();
  const jdTitle = jd.title.toLowerCase();
  let roleScore = 50;
  if (candTitle && jdTitle.includes(candTitle) || candTitle.includes(jdTitle)) {
    roleScore = 100;
  } else {
    // Check keyword overlap
    const titleWords = jdTitle.split(/\s+/).filter(w => w.length > 3);
    const matches = titleWords.filter(w => candTitle.includes(w) || resume.previousTitles.some(pt => pt.toLowerCase().includes(w)));
    roleScore = Math.min(95, 60 + matches.length * 15);
  }

  // 5. Education & Certifications
  let eduCertScore = 70;
  if (jd.certifications.length > 0) {
    const matchedCerts = jd.certifications.filter(c => 
      resume.certifications.some(rc => rc.toLowerCase().includes(c.toLowerCase())) ||
      resume.rawText.toLowerCase().includes(c.toLowerCase())
    );
    eduCertScore = Math.round((matchedCerts.length / jd.certifications.length) * 100);
    if (matchedCerts.length > 0) {
      evidenceQuotes.push({
        claim: `Verified Certifications`,
        evidence: `Holds: ${matchedCerts.join(', ')}`,
        confidence: 'high'
      });
    }
  } else {
    eduCertScore = resume.education.length > 0 ? 90 : 70;
  }

  // 6. Projects & Domain Relevance
  let projDomainScore = 75;
  if (jd.domainKeywords.length > 0) {
    const matchedKeywords = jd.domainKeywords.filter(k => 
      resume.rawText.toLowerCase().includes(k.toLowerCase())
    );
    projDomainScore = Math.min(100, Math.round((matchedKeywords.length / jd.domainKeywords.length) * 100));
  }
  if (resume.projects.length >= 2) {
    projDomainScore = Math.min(100, projDomainScore + 10);
  }

  // Calculate weighted total
  const totalWeight =
    weights.requiredSkills +
    weights.relevantExperience +
    weights.jobRoleAlignment +
    weights.preferredSkills +
    weights.educationCertifications +
    weights.projectsDomain;

  const rawWeighted = (
    reqSkillScore * weights.requiredSkills +
    expScore * weights.relevantExperience +
    roleScore * weights.jobRoleAlignment +
    prefSkillScore * weights.preferredSkills +
    eduCertScore * weights.educationCertifications +
    projDomainScore * weights.projectsDomain
  ) / (totalWeight || 100);

  const finalMatchScore = Math.round(Math.min(100, Math.max(0, rawWeighted)));

  // Categorization
  let category: MatchCategory = 'Does Not Meet Requirements';
  if (finalMatchScore >= (jd.strongMatchThreshold || 80) && missingRequired.length <= 1) {
    category = 'Strong Match';
  } else if (finalMatchScore >= (jd.potentialMatchThreshold || 65)) {
    category = 'Potential Match';
  } else if (finalMatchScore >= (jd.needsReviewThreshold || 50)) {
    category = 'Needs Review';
  } else {
    category = 'Does Not Meet Requirements';
  }

  // Strengths and Concerns
  const keyStrengths: string[] = [];
  const potentialConcerns: string[] = [];

  if (matchedRequired.length >= Math.ceil(jd.requiredSkills.length * 0.8)) {
    keyStrengths.push(`Matches ${matchedRequired.length} of ${jd.requiredSkills.length} required technical skills.`);
  }
  if (candExp >= jd.minExperienceYears) {
    keyStrengths.push(`Has ${candExp} years of experience, satisfying minimum requirement of ${jd.minExperienceYears} years.`);
  } else {
    potentialConcerns.push(`Total experience (${candExp} yrs) is below desired ${jd.minExperienceYears} yrs.`);
  }

  if (missingRequired.length > 0) {
    potentialConcerns.push(`Missing mandatory requirements: ${missingRequired.slice(0, 3).join(', ')}${missingRequired.length > 3 ? '...' : ''}.`);
  }

  if (matchedPreferred.length > 0) {
    keyStrengths.push(`Bonus skills present: ${matchedPreferred.slice(0, 3).join(', ')}.`);
  }

  if (resume.certifications.length > 0) {
    keyStrengths.push(`Has recognized credentials: ${resume.certifications.slice(0, 2).join(', ')}.`);
  }

  const breakdown: ScoreBreakdown = {
    requiredSkillsScore: reqSkillScore,
    relevantExperienceScore: expScore,
    jobRoleAlignmentScore: roleScore,
    preferredSkillsScore: prefSkillScore,
    educationCertScore: eduCertScore,
    projectsDomainScore: projDomainScore,
    weightedTotal: finalMatchScore,
  };

  const explanationSummary = `${finalMatchScore}/100 — Candidate matches ${matchedRequired.length} of ${jd.requiredSkills.length} required skills, has ${candExp} yrs relevant experience (target: ${jd.minExperienceYears}+ yrs)${missingRequired.length > 0 ? `, but does not mention ${missingRequired[0]}` : ' with strong all-around role alignment'}.`;

  return {
    matchScore: finalMatchScore,
    category,
    scoreBreakdown: breakdown,
    matchedRequiredSkills: matchedRequired,
    missingRequiredSkills: missingRequired,
    matchedPreferredSkills: matchedPreferred,
    missingPreferredSkills: missingPreferred,
    relevantExperienceYears: candExp,
    keyStrengths,
    potentialConcerns,
    evidenceQuotes,
    explanationSummary,
    aiModelVersion: 'gemini-3.8-flash',
    evaluatedAt: new Date().toISOString(),
    weightsUsed: weights,
  };
}

// Blind screening utility
export function maskSensitiveAttributes(resume: ParsedResume): ParsedResume {
  return {
    ...resume,
    name: `Candidate #${Math.abs(hashString(resume.email || resume.name || 'anonymous')).toString().slice(0, 4)}`,
    email: '[Protected - Blind Screening]',
    phone: '[Protected - Blind Screening]',
    location: resume.location ? `${resume.location.split(',').pop()?.trim() || 'Region Protected'} (City Masked)` : 'Not specified',
    urls: {
      linkedin: resume.urls.linkedin ? '[Protected URL]' : undefined,
      github: resume.urls.github,
      portfolio: resume.urls.portfolio,
    },
    education: resume.education.map(edu => ({
      degree: edu.degree,
      field: edu.field,
      institution: 'Accredited University',
      graduationYear: 'Completed',
    })),
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
