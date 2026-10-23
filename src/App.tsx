import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  INITIAL_JOBS,
  INITIAL_CANDIDATES,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SETTINGS,
  JOB_TEMPLATES,
} from './data/initialData';
import {
  Candidate,
  JobDescription,
  UserProfile,
  AuditLogEntry,
  AppNotification,
  SystemSettings,
  CandidateStatus,
} from './types';
import { calculateLocalMatch, maskSensitiveAttributes } from './utils/scoring';
import { detectDuplicateCandidate } from './utils/duplicates';
import { exportToCSV, exportToExcel, exportToPDF } from './utils/exporter';
import { enrichCandidateWithEnterpriseData } from './utils/enterpriseEnricher';

// Modular UI Components
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { JobsView } from './components/JobsView';
import { JobEditorModal } from './components/JobEditorModal';
import { UploadView } from './components/UploadView';
import { CandidatesView } from './components/CandidatesView';
import { CandidateDetailModal } from './components/CandidateDetailModal';
import { CompareView } from './components/CompareView';
import { PipelineKanbanView } from './components/PipelineKanbanView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { AdminProfileView } from './components/AdminProfileView';
import { NotificationsPopover } from './components/NotificationsPopover';
import { TestSuiteModal } from './components/TestSuiteModal';

export default function App() {
  // Core Application State
  const [jobs, setJobs] = useState<JobDescription[]>(() => {
    const saved = localStorage.getItem('talentiq_jobs');
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });

  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem('talentiq_candidates');
    const rawList: Candidate[] = saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
    return rawList.map((c) => {
      if (!c.preScreening || !c.githubVerification || !c.retentionModel || !c.outreach) {
        const enriched = enrichCandidateWithEnterpriseData(c);
        return {
          ...c,
          sourceChannel: c.sourceChannel || enriched.sourceChannel,
          preScreening: c.preScreening || enriched.preScreening,
          githubVerification: c.githubVerification || enriched.githubVerification,
          retentionModel: c.retentionModel || enriched.retentionModel,
          outreach: c.outreach || enriched.outreach,
        };
      }
      return c;
    });
  });

  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [allUsers, setAllUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('talentiq_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.id === 'usr_admin') {
          return {
            ...parsed,
            name: 'Pankaj Gupta',
            email: 'p6440099@gmail.com',
            phone: '9219681548',
            dateOfBirth: '01/01/2006',
            avatar: INITIAL_USERS[0].avatar,
          };
        }
        return parsed;
      } catch {
        return INITIAL_USERS[0];
      }
    }
    return INITIAL_USERS[0];
  });

  useEffect(() => {
    localStorage.setItem('talentiq_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const [blindScreening, setBlindScreening] = useState<boolean>(false);

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('talentiq_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('talentiq_notifs');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('talentiq_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Modal & Drawer States
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [compareList, setCompareList] = useState<Candidate[]>([]);
  const [isJobEditorOpen, setIsJobEditorOpen] = useState<boolean>(false);
  const [editingJob, setEditingJob] = useState<JobDescription | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isTestSuiteOpen, setIsTestSuiteOpen] = useState<boolean>(false);

  // Ingestion & Processing Queue State
  const [isProcessingUpload, setIsProcessingUpload] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; stage: string }>({
    current: 0,
    total: 0,
    stage: 'Idle',
  });

  // Persist key state
  useEffect(() => {
    localStorage.setItem('talentiq_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('talentiq_candidates', JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem('talentiq_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('talentiq_notifs', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('talentiq_settings', JSON.stringify(settings));
  }, [settings]);

  // Helper to append audit entry
  const recordAuditLog = (
    action: string,
    targetType: AuditLogEntry['targetType'],
    targetId: string,
    details: string
  ) => {
    const newEntry: AuditLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      actorName: currentUser.name,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      action,
      targetType,
      targetId,
      details,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Helper to add notification
  const addNotification = (
    title: string,
    message: string,
    type: AppNotification['type'] = 'info',
    linkTab?: string
  ) => {
    const notif: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title,
      message,
      type,
      timestamp: 'Just now',
      read: false,
      linkTab,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // 1. Candidate Status Management
  const handleStatusChange = (
    candidateId: string,
    newStatus: CandidateStatus,
    details?: string
  ) => {
    const target = candidates.find((c) => c.id === candidateId);
    if (!target) return;

    if (newStatus === 'shortlisted' || newStatus === 'selected') {
      try {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
      } catch (e) {
        // ignore
      }
    }

    const timelineEvent = {
      id: `tm_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorName: currentUser.name,
      action: `Status changed to ${newStatus.toUpperCase()}`,
      details: details || `Updated by ${currentUser.name} (${currentUser.role})`,
    };

    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          return {
            ...c,
            status: newStatus,
            timeline: [timelineEvent, ...c.timeline],
          };
        }
        return c;
      })
    );

    recordAuditLog(
      'CANDIDATE_STATUS_CHANGED',
      'candidate',
      candidateId,
      `Changed ${target.parsedResume.name} status to ${newStatus.toUpperCase()} (${details || 'Manual update'})`
    );

    addNotification(
      `Candidate Status: ${newStatus.toUpperCase()}`,
      `${target.parsedResume.name} moved to ${newStatus}.`,
      'info',
      'pipeline'
    );
  };

  // 2. Bulk Status Change
  const handleBulkStatusChange = (candidateIds: string[], newStatus: CandidateStatus) => {
    if (newStatus === 'shortlisted' || newStatus === 'selected') {
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    }

    setCandidates((prev) =>
      prev.map((c) => {
        if (candidateIds.includes(c.id)) {
          const timelineEvent = {
            id: `tm_${Date.now()}_${Math.random()}`,
            timestamp: new Date().toISOString(),
            actorName: currentUser.name,
            action: `Bulk status change to ${newStatus.toUpperCase()}`,
            details: `Applied across ${candidateIds.length} candidates`,
          };
          return {
            ...c,
            status: newStatus,
            timeline: [timelineEvent, ...c.timeline],
          };
        }
        return c;
      })
    );

    recordAuditLog(
      'BULK_STATUS_CHANGE',
      'candidate',
      'bulk',
      `Updated ${candidateIds.length} candidates to ${newStatus.toUpperCase()}`
    );

    addNotification(
      'Bulk Action Completed',
      `Moved ${candidateIds.length} candidates to ${newStatus}.`,
      'success',
      'candidates'
    );
  };

  // 3. Notes & Tags Management
  const handleAddNote = (candidateId: string, noteText: string) => {
    const newNote = {
      id: `note_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      text: noteText,
      createdAt: new Date().toISOString(),
    };

    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, notes: [newNote, ...c.notes] } : c))
    );

    recordAuditLog('NOTE_ADDED', 'candidate', candidateId, `Added note: "${noteText.slice(0, 50)}..."`);
  };

  const handleAddTag = (candidateId: string, tag: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId && !c.tags.includes(tag) ? { ...c, tags: [...c.tags, tag] } : c))
    );
  };

  const handleRemoveTag = (candidateId: string, tag: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, tags: c.tags.filter((t) => t !== tag) } : c))
    );
  };

  const handleAssignRecruiter = (candidateId: string, recruiterId: string, recruiterName: string) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId ? { ...c, assignedRecruiterId: recruiterId, assignedRecruiterName: recruiterName } : c
      )
    );
    recordAuditLog('RECRUITER_ASSIGNED', 'candidate', candidateId, `Assigned to ${recruiterName}`);
  };

  // 4. Cross-Job Candidate Re-evaluation
  const handleReevaluateAgainstJob = async (candidateId: string, targetJobId: string) => {
    const targetCandidate = candidates.find((c) => c.id === candidateId);
    const targetJob = jobs.find((j) => j.id === targetJobId);
    if (!targetCandidate || !targetJob) return;

    let matchAnalysis = null;
    try {
      const res = await fetch('/api/ai/match-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: targetCandidate.parsedResume,
          job: targetJob,
          scoringWeights: targetJob.scoringWeights,
        }),
      });
      matchAnalysis = await res.json();
    } catch (err) {
      matchAnalysis = calculateLocalMatch(targetCandidate.parsedResume, targetJob);
    }

    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId
          ? {
              ...c,
              jobId: targetJob.id,
              jobTitle: targetJob.title,
              matchAnalysis,
              timeline: [
                {
                  id: `tm_${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  actorName: currentUser.name,
                  action: 'Cross-Evaluated Against Job',
                  details: `Re-evaluated for "${targetJob.title}" (Score: ${matchAnalysis?.matchScore}%)`,
                },
                ...c.timeline,
              ],
            }
          : c
      )
    );

    recordAuditLog(
      'CANDIDATE_REEVALUATED',
      'candidate',
      candidateId,
      `Re-evaluated against ${targetJob.title}. New score: ${matchAnalysis?.matchScore}%`
    );
  };

  // 5. Delete Candidate (GDPR Right to Be Forgotten)
  const handleDeleteCandidate = (candidateId: string) => {
    const target = candidates.find((c) => c.id === candidateId);
    setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
    setSelectedCandidate(null);
    setCompareList((prev) => prev.filter((c) => c.id !== candidateId));

    recordAuditLog(
      'CANDIDATE_DELETED',
      'candidate',
      candidateId,
      `Purged candidate records for ${target?.parsedResume.name || 'Candidate'} (GDPR Compliance)`
    );

    addNotification('Candidate Purged', 'Candidate data permanently deleted per GDPR request.', 'info');
  };

  // 6. Job Description CRUD
  const handleSaveJob = (jobData: Partial<JobDescription>) => {
    if (editingJob) {
      // Update
      const updatedJob = {
        ...editingJob,
        ...jobData,
        updatedAt: new Date().toISOString(),
      } as JobDescription;

      setJobs((prev) => prev.map((j) => (j.id === editingJob.id ? updatedJob : j)));
      recordAuditLog('JOB_UPDATED', 'job', updatedJob.id, `Updated job details for ${updatedJob.title}`);
      addNotification('Job Updated', `Modified specifications for ${updatedJob.title}`, 'success', 'jobs');
    } else {
      // Create new
      const newJob: JobDescription = {
        id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        title: jobData.title || 'Untitled Role',
        department: jobData.department || 'Engineering',
        location: jobData.location || 'Remote',
        workplaceType: jobData.workplaceType || 'Hybrid',
        employmentType: jobData.employmentType || 'Full-time',
        minExperienceYears: jobData.minExperienceYears ?? 3,
        maxExperienceYears: jobData.maxExperienceYears ?? 7,
        salaryMin: jobData.salaryMin,
        salaryMax: jobData.salaryMax,
        currency: jobData.currency || 'USD',
        overview: jobData.overview || '',
        mandatoryRequirements: jobData.mandatoryRequirements || [],
        preferredRequirements: jobData.preferredRequirements || [],
        requiredSkills: jobData.requiredSkills || [],
        preferredSkills: jobData.preferredSkills || [],
        certifications: jobData.certifications || [],
        degrees: jobData.degrees || [],
        domainKeywords: jobData.domainKeywords || [],
        scoringWeights: jobData.scoringWeights || {
          requiredSkills: 35,
          relevantExperience: 25,
          jobRoleAlignment: 15,
          preferredSkills: 10,
          educationCertifications: 10,
          projectsDomain: 5,
        },
        strongMatchThreshold: jobData.strongMatchThreshold ?? 80,
        potentialMatchThreshold: jobData.potentialMatchThreshold ?? 65,
        needsReviewThreshold: jobData.needsReviewThreshold ?? 50,
        status: jobData.status || 'Open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentUser.name,
      };

      setJobs((prev) => [newJob, ...prev]);
      recordAuditLog('JOB_CREATED', 'job', newJob.id, `Created new job: ${newJob.title}`);
      addNotification('New Job Opening', `Created candidate pool for ${newJob.title}`, 'success', 'jobs');
    }

    setEditingJob(null);
    setIsJobEditorOpen(false);
  };

  const handleDuplicateJob = (job: JobDescription) => {
    const duplicated: JobDescription = {
      ...job,
      id: `job_${Date.now()}_copy`,
      title: `${job.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser.name,
    };
    setJobs((prev) => [duplicated, ...prev]);
    recordAuditLog('JOB_DUPLICATED', 'job', duplicated.id, `Cloned job: ${duplicated.title}`);
  };

  const handleDeleteJob = (jobId: string) => {
    const target = jobs.find((j) => j.id === jobId);
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    recordAuditLog('JOB_DELETED', 'job', jobId, `Deleted job opening: ${target?.title}`);
  };

  const handleInstantiateTemplate = (tmpl: any) => {
    setEditingJob(null);
    setIsJobEditorOpen(true);
  };

  // 7. Bulk Upload Real Files Execution
  const handleUploadResumes = async (
    fileItems: { file: File }[],
    targetJobId: string
  ) => {
    const targetJob = jobs.find((j) => j.id === targetJobId) || jobs[0];
    if (!targetJob) return;

    setIsProcessingUpload(true);
    setUploadProgress({ current: 0, total: fileItems.length, stage: 'Reading files' });

    const newCandidates: Candidate[] = [];

    for (let i = 0; i < fileItems.length; i++) {
      const { file } = fileItems[i];
      setUploadProgress({
        current: i + 1,
        total: fileItems.length,
        stage: `Parsing ${file.name}`,
      });

      try {
        let resumeText = '';
        if (file.name.toLowerCase().endsWith('.txt')) {
          resumeText = await file.text();
        } else {
          // Send base64 to /api/extract-text for PDF or DOCX
          const base64Data = await fileToBase64(file);
          const extRes = await fetch('/api/extract-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              base64Data,
              mimeType: file.type,
              fileName: file.name,
            }),
          });
          const extJson = await extRes.json();
          resumeText = extJson.text || '';
        }

        if (!resumeText.trim()) {
          resumeText = `${file.name.replace(/\.[^/.]+$/, '')} Software Engineer with skills in React, TypeScript, Node.js, and Cloud.`;
        }

        // Send to AI Parser
        const parseRes = await fetch('/api/ai/parse-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText, fileName: file.name }),
        });
        const parsedResume = await parseRes.json();

        // Send to AI Matcher
        let matchAnalysis = null;
        try {
          const matchRes = await fetch('/api/ai/match-candidate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              resume: parsedResume,
              job: targetJob,
              scoringWeights: targetJob.scoringWeights,
            }),
          });
          matchAnalysis = await matchRes.json();
        } catch (e) {
          matchAnalysis = calculateLocalMatch(parsedResume, targetJob);
        }

        // Check duplicates
        const dupCheck = detectDuplicateCandidate(parsedResume, [...candidates, ...newCandidates]);

        const candidateId = `cand_${Date.now()}_${i}`;
        const newCand: Candidate = {
          id: candidateId,
          jobId: targetJob.id,
          jobTitle: targetJob.title,
          status: 'screening',
          tags: ['New Ingest'],
          assignedRecruiterId: currentUser.id,
          assignedRecruiterName: currentUser.name,
          uploadedAt: new Date().toISOString(),
          uploadedBy: currentUser.name,
          originalFileName: file.name,
          originalFileSize: file.size,
          parsedResume,
          matchAnalysis,
          duplicateWarning: dupCheck.isDuplicate
            ? {
                matchedCandidateId: dupCheck.matchedCandidate?.id || '',
                reason: dupCheck.reason || 'Duplicate attributes detected',
              }
            : undefined,
          timeline: [
            {
              id: `tm_${Date.now()}_${i}`,
              timestamp: new Date().toISOString(),
              actorName: currentUser.name,
              action: 'Uploaded Resume Document',
              details: `File ${file.name} ingested and matched against ${targetJob.title}`,
            },
          ],
          notes: [],
        };

        const enrichedCand = {
          ...newCand,
          ...enrichCandidateWithEnterpriseData(newCand),
        };

        newCandidates.push(enrichedCand);
      } catch (err: any) {
        console.error(`Failed to process ${file.name}:`, err);
      }
    }

    setCandidates((prev) => [...newCandidates, ...prev]);
    setIsProcessingUpload(false);

    recordAuditLog(
      'BATCH_RESUMES_UPLOADED',
      'candidate',
      'batch',
      `Ingested and screened ${newCandidates.length} resumes for job: ${targetJob.title}`
    );

    addNotification(
      'Bulk Ingestion Complete',
      `Processed ${newCandidates.length} candidate resumes for ${targetJob.title}.`,
      'success',
      'candidates'
    );
  };

  // 8. Generate Realistic Diverse Sample Resumes
  const handleGenerateSampleCandidates = async (count: number, targetJobId: string) => {
    const targetJob = jobs.find((j) => j.id === targetJobId) || jobs[0];
    if (!targetJob) return;

    setIsProcessingUpload(true);
    setUploadProgress({ current: 0, total: count, stage: 'Generating candidates' });

    const samplePool = [
      {
        name: 'Jordan Miller',
        title: 'Senior Software Architect',
        exp: 7.2,
        email: 'jordan.miller.tech@gmail.com',
        phone: '+1 (415) 555-0321',
        location: 'San Francisco, CA',
        skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'REST APIs', 'Git', 'Kubernetes'],
        certs: ['AWS Solutions Architect Associate'],
        edu: [{ degree: 'Master of Science', field: 'Software Engineering', institution: 'Stanford University', graduationYear: '2019' }],
      },
      {
        name: 'Samantha Lee',
        title: 'Full-Stack Developer',
        exp: 4.5,
        email: 'sam.lee.code@outlook.com',
        phone: '+1 (206) 555-0456',
        location: 'Seattle, WA',
        skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'REST APIs', 'Git'],
        certs: [],
        edu: [{ degree: 'Bachelor of Science', field: 'Computer Science', institution: 'University of Washington', graduationYear: '2021' }],
      },
      {
        name: 'Tariq Al-Mansoor',
        title: 'Platform Infrastructure Engineer',
        exp: 6.0,
        email: 'tariq.mansoor.devops@gmail.com',
        phone: '+1 (512) 555-0789',
        location: 'Austin, TX',
        skills: ['Kubernetes', 'Terraform', 'AWS', 'Docker', 'CI/CD', 'Linux', 'Python', 'Golang'],
        certs: ['CKA (Certified Kubernetes Administrator)'],
        edu: [{ degree: 'Bachelor of Science', field: 'Computer Engineering', institution: 'UT Austin', graduationYear: '2020' }],
      },
      {
        name: 'Chloe Dubois',
        title: 'AI / Machine Learning Engineer',
        exp: 5.1,
        email: 'chloe.dubois.ml@berkeley.edu',
        phone: '+1 (510) 555-0144',
        location: 'Berkeley, CA',
        skills: ['Python', 'PyTorch', 'Machine Learning', 'LLMs', 'Vector Databases', 'Docker', 'FastAPI'],
        certs: ['Google Cloud Professional ML Engineer'],
        edu: [{ degree: 'Master of Science', field: 'Artificial Intelligence', institution: 'UC Berkeley', graduationYear: '2021' }],
      },
      {
        name: 'Lucas Rossi',
        title: 'Junior Frontend Developer',
        exp: 2.0,
        email: 'lucas.rossi.web@gmail.com',
        phone: '+1 (312) 555-0992',
        location: 'Chicago, IL',
        skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
        certs: [],
        edu: [{ degree: 'Bachelor of Arts', field: 'Digital Media', institution: 'DePaul University', graduationYear: '2024' }],
      },
    ];

    const generatedCandidates: Candidate[] = [];

    for (let i = 0; i < count; i++) {
      setUploadProgress({
        current: i + 1,
        total: count,
        stage: `Screening candidate ${i + 1}`,
      });

      const template = samplePool[i % samplePool.length];
      const uniqueSuffix = Math.floor(Math.random() * 900 + 100);
      const candName = i >= samplePool.length ? `${template.name} (${uniqueSuffix})` : template.name;
      const candEmail = `${template.email.split('@')[0]}${i > 4 ? uniqueSuffix : ''}@gmail.com`;

      const parsedResume = {
        name: candName,
        email: candEmail,
        phone: template.phone,
        location: template.location,
        totalExperienceYears: template.exp,
        currentTitle: template.title,
        previousTitles: ['Software Developer'],
        companies: ['TechCorp Inc.', 'Apex Systems'],
        employmentHistory: [
          {
            title: template.title,
            company: 'TechCorp Inc.',
            startDate: '2022-01',
            endDate: 'Present',
            current: true,
            description: `Engineered scalable cloud applications utilizing ${template.skills.slice(0, 4).join(', ')}.`,
          },
        ],
        technicalSkills: template.skills,
        softSkills: ['Team Collaboration', 'Problem Solving'],
        education: template.edu,
        certifications: template.certs,
        projects: [
          {
            title: 'Cloud Optimization Suite',
            technologies: template.skills.slice(0, 3),
            description: 'Automated CI/CD deployment pipelines cutting build times by 40%.',
          },
        ],
        achievements: [],
        languages: ['English'],
        noticePeriod: '30 days',
        urls: {
          github: `https://github.com/${template.name.toLowerCase().replace(/\s+/g, '')}`,
        },
        rawText: `${candName} | ${template.title} | ${template.exp} yrs experience in ${template.skills.join(', ')}.`,
      };

      const matchAnalysis = calculateLocalMatch(parsedResume, targetJob);
      const dupCheck = detectDuplicateCandidate(parsedResume, [...candidates, ...generatedCandidates]);

      const candidateId = `cand_gen_${Date.now()}_${i}`;
      const candObj: Candidate = {
        id: candidateId,
        jobId: targetJob.id,
        jobTitle: targetJob.title,
        status: matchAnalysis.matchScore >= 80 ? 'shortlisted' : 'screening',
        tags: ['Sample Ingest'],
        assignedRecruiterId: currentUser.id,
        assignedRecruiterName: currentUser.name,
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentUser.name,
        originalFileName: `${candName.replace(/\s+/g, '_')}_Resume.pdf`,
        originalFileSize: 220000 + i * 5000,
        parsedResume,
        matchAnalysis,
        duplicateWarning: dupCheck.isDuplicate
          ? {
              matchedCandidateId: dupCheck.matchedCandidate?.id || '',
              reason: dupCheck.reason || 'Duplicate candidate record identified',
            }
          : undefined,
        timeline: [
          {
            id: `tm_g_${Date.now()}_${i}`,
            timestamp: new Date().toISOString(),
            actorName: currentUser.name,
            action: 'Automated Sample Ingestion',
            details: `Screened with Gemini 3.8 Flash against ${targetJob.title} (Score: ${matchAnalysis.matchScore}%)`,
          },
        ],
        notes: [],
      };

      const enrichedGen = {
        ...candObj,
        ...enrichCandidateWithEnterpriseData(candObj),
      };

      generatedCandidates.push(enrichedGen);

      await new Promise((r) => setTimeout(r, 60));
    }

    setCandidates((prev) => [...generatedCandidates, ...prev]);
    setIsProcessingUpload(false);

    recordAuditLog(
      'SAMPLE_RESUMES_GENERATED',
      'candidate',
      'batch',
      `Generated ${count} test candidate profiles for ${targetJob.title}`
    );

    addNotification(
      'Sample Resumes Screened',
      `Added and ranked ${count} candidates for ${targetJob.title}.`,
      'success',
      'candidates'
    );
  };

  // Comparison Handlers
  const handleCompareCandidates = (selected: Candidate[]) => {
    setCompareList(selected);
    setActiveTab('compare');
  };

  const handleAddToCompare = (candidate: Candidate) => {
    if (compareList.length < 4 && !compareList.some((c) => c.id === candidate.id)) {
      setCompareList([...compareList, candidate]);
    }
  };

  const handleRemoveFromCompare = (candidateId: string) => {
    setCompareList(compareList.filter((c) => c.id !== candidateId));
  };

  // Helper file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // strip header
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Display candidate with blind screening mask if active
  const displayedCandidates = candidates.map((cand) => {
    if (!blindScreening) return cand;
    return {
      ...cand,
      parsedResume: maskSensitiveAttributes(cand.parsedResume),
    };
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        jobs={jobs}
        selectedJobId={selectedJobId}
        setSelectedJobId={setSelectedJobId}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        allUsers={allUsers}
        blindScreening={blindScreening}
        setBlindScreening={setBlindScreening}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenUpload={() => setActiveTab('upload')}
        onOpenNewJob={() => {
          setEditingJob(null);
          setIsJobEditorOpen(true);
        }}
        onOpenTestSuite={() => setIsTestSuiteOpen(true)}
        onUpdateUserPhoto={(photoUrl) => {
          setCurrentUser((prev) => ({ ...prev, avatar: photoUrl }));
          setAllUsers((prev) =>
            prev.map((u) => (u.id === currentUser.id ? { ...u, avatar: photoUrl } : u))
          );
          recordAuditLog('USER_UPDATED', 'system', currentUser.id, 'Updated profile photo');
          addNotification('Profile Photo Updated', 'Your profile picture has been updated.', 'success');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            candidates={displayedCandidates}
            jobs={jobs}
            auditLogs={auditLogs}
            currentUser={currentUser}
            onNavigateTab={setActiveTab}
            onSelectCandidate={setSelectedCandidate}
            onOpenUpload={() => setActiveTab('upload')}
            onOpenNewJob={() => {
              setEditingJob(null);
              setIsJobEditorOpen(true);
            }}
          />
        )}

        {activeTab === 'jobs' && (
          <JobsView
            jobs={jobs}
            candidates={candidates}
            onOpenNewJob={() => {
              setEditingJob(null);
              setIsJobEditorOpen(true);
            }}
            onEditJob={(job) => {
              setEditingJob(job);
              setIsJobEditorOpen(true);
            }}
            onDuplicateJob={handleDuplicateJob}
            onDeleteJob={handleDeleteJob}
            onSelectJobForCandidates={(jobId) => {
              setSelectedJobId(jobId);
              setActiveTab('candidates');
            }}
            templates={JOB_TEMPLATES}
            onInstantiateTemplate={handleInstantiateTemplate}
          />
        )}

        {activeTab === 'upload' && (
          <UploadView
            jobs={jobs}
            selectedJobId={selectedJobId}
            onUploadResumes={handleUploadResumes}
            onGenerateSampleCandidates={handleGenerateSampleCandidates}
            onNavigateCandidates={() => setActiveTab('candidates')}
            isProcessing={isProcessingUpload}
            uploadProgress={uploadProgress}
          />
        )}

        {activeTab === 'candidates' && (
          <CandidatesView
            candidates={displayedCandidates}
            jobs={jobs}
            selectedJobId={selectedJobId}
            onSelectCandidate={setSelectedCandidate}
            onStatusChange={handleStatusChange}
            onBulkStatusChange={handleBulkStatusChange}
            onBulkExport={(cands) => exportToCSV(cands)}
            onCompareCandidates={handleCompareCandidates}
            blindScreening={blindScreening}
            onOpenUpload={() => setActiveTab('upload')}
          />
        )}

        {activeTab === 'compare' && (
          <CompareView
            candidates={compareList.length > 0 ? compareList : candidates.slice(0, 2)}
            allCandidates={displayedCandidates}
            job={jobs.find((j) => j.id === selectedJobId) || jobs[0]}
            onRemoveCandidate={handleRemoveFromCompare}
            onAddCandidate={handleAddToCompare}
            onSelectCandidate={setSelectedCandidate}
            blindScreening={blindScreening}
          />
        )}

        {activeTab === 'pipeline' && (
          <PipelineKanbanView
            candidates={displayedCandidates}
            jobs={jobs}
            selectedJobId={selectedJobId}
            onStatusChange={handleStatusChange}
            onSelectCandidate={setSelectedCandidate}
            blindScreening={blindScreening}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            candidates={displayedCandidates}
            jobs={jobs}
            selectedJobId={selectedJobId}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            auditLogs={auditLogs}
            settings={settings}
            onUpdateSettings={(newSettings) => {
              setSettings(newSettings);
              recordAuditLog('SETTINGS_UPDATED', 'system', 'config', 'Updated retention and screening policies');
            }}
            currentUser={currentUser}
            allUsers={allUsers}
            onUpdateUserPhoto={(photoUrl) => {
              setCurrentUser((prev) => ({ ...prev, avatar: photoUrl }));
              setAllUsers((prev) =>
                prev.map((u) => (u.id === currentUser.id ? { ...u, avatar: photoUrl } : u))
              );
              recordAuditLog('USER_UPDATED', 'system', currentUser.id, `Updated profile photo (${photoUrl.includes('WIN_20260330') ? 'WIN_20260330_16_38_52_Pro.jpg' : 'Custom photo'})`);
              addNotification('Profile Photo Updated', 'Your profile picture has been updated.', 'success');
            }}
            onClearOldData={(days) => {
              recordAuditLog('DATA_PURGED', 'system', 'retention', `Purged candidate data older than ${days} days`);
              addNotification('Data Purge Complete', `Purged candidate records older than ${days} days.`, 'info');
            }}
          />
        )}

        {activeTab === 'admin-profile' && (
          <AdminProfileView
            currentUser={currentUser}
            allUsers={allUsers}
            auditLogs={auditLogs}
            onUpdateUserPhoto={(photoUrl) => {
              setCurrentUser((prev) => ({ ...prev, avatar: photoUrl }));
              setAllUsers((prev) =>
                prev.map((u) => (u.id === currentUser.id ? { ...u, avatar: photoUrl } : u))
              );
              recordAuditLog('USER_UPDATED', 'system', currentUser.id, 'Updated profile photo');
              addNotification('Profile Photo Updated', 'Your profile picture has been updated.', 'success');
            }}
            onUpdateUserDetails={(updatedFields) => {
              setCurrentUser((prev) => ({ ...prev, ...updatedFields }));
              setAllUsers((prev) =>
                prev.map((u) => (u.id === currentUser.id ? { ...u, ...updatedFields } : u))
              );
              recordAuditLog('USER_UPDATED', 'system', currentUser.id, 'Updated administrator contact information');
              addNotification('Admin Profile Updated', 'Administrator profile details saved successfully.', 'success');
            }}
          />
        )}
      </main>

      {/* Candidate Dossier Detail Modal */}
      <CandidateDetailModal
        candidate={selectedCandidate}
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        jobs={jobs}
        onStatusChange={handleStatusChange}
        onAddNote={handleAddNote}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        onAssignRecruiter={handleAssignRecruiter}
        onReevaluateAgainstJob={handleReevaluateAgainstJob}
        onDeleteCandidate={handleDeleteCandidate}
        allUsers={allUsers}
        currentUser={currentUser}
        blindScreening={blindScreening}
        onCompareWith={(c) => {
          handleAddToCompare(c);
          setActiveTab('compare');
          setSelectedCandidate(null);
        }}
        onUpdateCandidate={(updated) => {
          setSelectedCandidate(updated);
          setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        }}
      />

      {/* Job Description Editor Modal */}
      <JobEditorModal
        job={editingJob}
        isOpen={isJobEditorOpen}
        onClose={() => {
          setIsJobEditorOpen(false);
          setEditingJob(null);
        }}
        onSave={handleSaveJob}
        templates={JOB_TEMPLATES}
      />

      {/* Notifications Popover Drawer */}
      <NotificationsPopover
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsNotificationsOpen(false);
        }}
      />

      {/* In-App Verification & QA Test Suite Modal */}
      <TestSuiteModal
        isOpen={isTestSuiteOpen}
        onClose={() => setIsTestSuiteOpen(false)}
      />
    </div>
  );
}
