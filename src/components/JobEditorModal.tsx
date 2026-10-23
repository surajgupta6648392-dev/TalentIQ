import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Sliders,
  Sparkles,
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Save
} from 'lucide-react';
import { JobDescription, ScoringWeights } from '../types';

interface JobEditorModalProps {
  job?: JobDescription | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (jobData: Partial<JobDescription>) => void;
  templates?: Omit<JobDescription, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>[];
  onApplyTemplate?: (template: any) => void;
}

export const JobEditorModal: React.FC<JobEditorModalProps> = ({
  job,
  isOpen,
  onClose,
  onSave,
  templates = [],
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(job?.title || '');
  const [department, setDepartment] = useState(job?.department || 'Engineering');
  const [location, setLocation] = useState(job?.location || 'Remote / Hybrid');
  const [workplaceType, setWorkplaceType] = useState<JobDescription['workplaceType']>(job?.workplaceType || 'Hybrid');
  const [employmentType, setEmploymentType] = useState<JobDescription['employmentType']>(job?.employmentType || 'Full-time');
  const [minExp, setMinExp] = useState(job?.minExperienceYears ?? 3);
  const [maxExp, setMaxExp] = useState(job?.maxExperienceYears ?? 7);
  const [salaryMin, setSalaryMin] = useState(job?.salaryMin ?? 120000);
  const [salaryMax, setSalaryMax] = useState(job?.salaryMax ?? 160000);
  const [currency, setCurrency] = useState(job?.currency || 'USD');
  const [overview, setOverview] = useState(job?.overview || '');
  const [status, setStatus] = useState<JobDescription['status']>(job?.status || 'Open');

  // Requirements & Skills tags
  const [mandatoryReqs, setMandatoryReqs] = useState<string[]>(job?.mandatoryRequirements || []);
  const [preferredReqs, setPreferredReqs] = useState<string[]>(job?.preferredRequirements || []);
  const [requiredSkills, setRequiredSkills] = useState<string[]>(job?.requiredSkills || []);
  const [preferredSkills, setPreferredSkills] = useState<string[]>(job?.preferredSkills || []);
  const [certifications, setCertifications] = useState<string[]>(job?.certifications || []);
  const [domainKeywords, setDomainKeywords] = useState<string[]>(job?.domainKeywords || []);

  // Temporary input state
  const [newMandatory, setNewMandatory] = useState('');
  const [newPreferred, setNewPreferred] = useState('');
  const [newReqSkill, setNewReqSkill] = useState('');
  const [newPrefSkill, setNewPrefSkill] = useState('');
  const [newCert, setNewCert] = useState('');
  const [newDomain, setNewDomain] = useState('');

  // Configurable Scoring Weights
  const [weights, setWeights] = useState<ScoringWeights>(
    job?.scoringWeights || {
      requiredSkills: 35,
      relevantExperience: 25,
      jobRoleAlignment: 15,
      preferredSkills: 10,
      educationCertifications: 10,
      projectsDomain: 5,
    }
  );

  // Thresholds
  const [strongThreshold, setStrongThreshold] = useState(job?.strongMatchThreshold ?? 80);
  const [potentialThreshold, setPotentialThreshold] = useState(job?.potentialMatchThreshold ?? 65);
  const [reviewThreshold, setReviewThreshold] = useState(job?.needsReviewThreshold ?? 50);

  const totalWeight =
    weights.requiredSkills +
    weights.relevantExperience +
    weights.jobRoleAlignment +
    weights.preferredSkills +
    weights.educationCertifications +
    weights.projectsDomain;

  const handleApplyTemplate = (tmpl: any) => {
    setTitle(tmpl.title);
    setDepartment(tmpl.department);
    setLocation(tmpl.location);
    setWorkplaceType(tmpl.workplaceType);
    setEmploymentType(tmpl.employmentType);
    setMinExp(tmpl.minExperienceYears);
    setMaxExp(tmpl.maxExperienceYears);
    setSalaryMin(tmpl.salaryMin || 130000);
    setSalaryMax(tmpl.salaryMax || 170000);
    setOverview(tmpl.overview);
    setMandatoryReqs(tmpl.mandatoryRequirements || []);
    setPreferredReqs(tmpl.preferredRequirements || []);
    setRequiredSkills(tmpl.requiredSkills || []);
    setPreferredSkills(tmpl.preferredSkills || []);
    setCertifications(tmpl.certifications || []);
    setDomainKeywords(tmpl.domainKeywords || []);
    if (tmpl.scoringWeights) setWeights(tmpl.scoringWeights);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title,
      department,
      location,
      workplaceType,
      employmentType,
      minExperienceYears: Number(minExp),
      maxExperienceYears: Number(maxExp),
      salaryMin: Number(salaryMin),
      salaryMax: Number(salaryMax),
      currency,
      overview,
      mandatoryRequirements: mandatoryReqs,
      preferredRequirements: preferredReqs,
      requiredSkills,
      preferredSkills,
      certifications,
      domainKeywords,
      scoringWeights: weights,
      strongMatchThreshold: Number(strongThreshold),
      potentialMatchThreshold: Number(potentialThreshold),
      needsReviewThreshold: Number(reviewThreshold),
      status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {job ? 'Edit Job Description & Scoring Weights' : 'Create New Job Description'}
              </h2>
              <p className="text-xs text-slate-500">
                Define mandatory qualifications, skills, and calibrated match criteria
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Quick Selector */}
        {templates.length > 0 && !job && (
          <div className="px-6 py-2.5 bg-indigo-50/70 border-b border-indigo-100 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="font-semibold text-indigo-900 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Quick Templates:
            </span>
            {templates.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyTemplate(t)}
                className="px-2.5 py-1 rounded-md bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100/60 font-medium whitespace-nowrap transition-colors"
              >
                {t.title.split('(')[0].trim()}
              </button>
            ))}
          </div>
        )}

        {/* Body Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
              1. Job Details & Role Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Engineering"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA / Remote"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Workplace Type</label>
                <select
                  value={workplaceType}
                  onChange={(e) => setWorkplaceType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Employment Type</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Experience Range (Min - Max Years)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={minExp}
                    onChange={(e) => setMinExp(Number(e.target.value))}
                    className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-center"
                  />
                  <span className="text-slate-400">to</span>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={maxExp}
                    onChange={(e) => setMaxExp(Number(e.target.value))}
                    className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-center"
                  />
                  <span className="text-slate-500">years</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Salary Range ({currency})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(Number(e.target.value))}
                    className="w-28 px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="Min"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(Number(e.target.value))}
                    className="w-28 px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="Max"
                  />
                  <span className="text-slate-500 font-semibold">{currency}</span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Job Overview & Responsibilities</label>
                <textarea
                  rows={2}
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  placeholder="Summary of responsibilities and scope of role..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Skills & Requirements Separated */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
              2. Skills & Requirements (Mandatory vs. Preferred)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Mandatory Skills */}
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Required Skills (Mandatory)
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{requiredSkills.length} added</span>
                </div>
                <div className="flex gap-1.5 mb-2">
                  <input
                    type="text"
                    value={newReqSkill}
                    onChange={(e) => setNewReqSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newReqSkill.trim()) {
                        e.preventDefault();
                        if (!requiredSkills.includes(newReqSkill.trim())) {
                          setRequiredSkills([...requiredSkills, newReqSkill.trim()]);
                        }
                        setNewReqSkill('');
                      }
                    }}
                    placeholder="e.g. React, PostgreSQL..."
                    className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newReqSkill.trim() && !requiredSkills.includes(newReqSkill.trim())) {
                        setRequiredSkills([...requiredSkills, newReqSkill.trim()]);
                        setNewReqSkill('');
                      }
                    }}
                    className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-md font-medium"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                  {requiredSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-medium"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => setRequiredSkills(requiredSkills.filter((_, i) => i !== idx))}
                        className="text-indigo-400 hover:text-indigo-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Preferred Skills */}
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Preferred Skills (Nice-to-Have)
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{preferredSkills.length} added</span>
                </div>
                <div className="flex gap-1.5 mb-2">
                  <input
                    type="text"
                    value={newPrefSkill}
                    onChange={(e) => setNewPrefSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newPrefSkill.trim()) {
                        e.preventDefault();
                        if (!preferredSkills.includes(newPrefSkill.trim())) {
                          setPreferredSkills([...preferredSkills, newPrefSkill.trim()]);
                        }
                        setNewPrefSkill('');
                      }
                    }}
                    placeholder="e.g. Docker, AWS, GraphQL..."
                    className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newPrefSkill.trim() && !preferredSkills.includes(newPrefSkill.trim())) {
                        setPreferredSkills([...preferredSkills, newPrefSkill.trim()]);
                        setNewPrefSkill('');
                      }
                    }}
                    className="px-2.5 py-1.5 bg-slate-800 text-white rounded-md font-medium"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                  {preferredSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-medium"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => setPreferredSkills(preferredSkills.filter((_, i) => i !== idx))}
                        className="text-blue-400 hover:text-blue-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications & Domain */}
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
                <span className="font-bold text-slate-800 block mb-2">Target Certifications</span>
                <div className="flex gap-1.5 mb-2">
                  <input
                    type="text"
                    value={newCert}
                    onChange={(e) => setNewCert(e.target.value)}
                    placeholder="e.g. AWS Certified Developer, CKA..."
                    className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCert.trim() && !certifications.includes(newCert.trim())) {
                        setCertifications([...certifications, newCert.trim()]);
                        setNewCert('');
                      }
                    }}
                    className="px-2.5 py-1.5 bg-slate-800 text-white rounded-md font-medium"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {certifications.map((c, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-md font-medium">
                      {c}
                      <button type="button" onClick={() => setCertifications(certifications.filter((_, idx) => idx !== i))}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
                <span className="font-bold text-slate-800 block mb-2">Domain & Architectural Keywords</span>
                <div className="flex gap-1.5 mb-2">
                  <input
                    type="text"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="e.g. Microservices, CI/CD, Observability..."
                    className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newDomain.trim() && !domainKeywords.includes(newDomain.trim())) {
                        setDomainKeywords([...domainKeywords, newDomain.trim()]);
                        setNewDomain('');
                      }
                    }}
                    className="px-2.5 py-1.5 bg-slate-800 text-white rounded-md font-medium"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {domainKeywords.map((k, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md font-medium">
                      {k}
                      <button type="button" onClick={() => setDomainKeywords(domainKeywords.filter((_, idx) => idx !== i))}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Recruiter-Configurable Scoring Weights */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                3. Configurable Scoring Weights (Must Total 100%)
              </h3>
              <span
                className={`font-mono font-bold text-xs px-2 py-0.5 rounded-sm ${
                  totalWeight === 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}
              >
                Sum: {totalWeight}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Required Skills</span>
                  <span className="font-mono text-indigo-600">{weights.requiredSkills}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={weights.requiredSkills}
                  onChange={(e) => setWeights({ ...weights, requiredSkills: Number(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Relevant Experience</span>
                  <span className="font-mono text-indigo-600">{weights.relevantExperience}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={weights.relevantExperience}
                  onChange={(e) => setWeights({ ...weights, relevantExperience: Number(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Job-Role Alignment</span>
                  <span className="font-mono text-indigo-600">{weights.jobRoleAlignment}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="5"
                  value={weights.jobRoleAlignment}
                  onChange={(e) => setWeights({ ...weights, jobRoleAlignment: Number(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Preferred Skills</span>
                  <span className="font-mono text-indigo-600">{weights.preferredSkills}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="5"
                  value={weights.preferredSkills}
                  onChange={(e) => setWeights({ ...weights, preferredSkills: Number(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Education / Certifications</span>
                  <span className="font-mono text-indigo-600">{weights.educationCertifications}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="5"
                  value={weights.educationCertifications}
                  onChange={(e) => setWeights({ ...weights, educationCertifications: Number(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Projects / Domain</span>
                  <span className="font-mono text-indigo-600">{weights.projectsDomain}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="5"
                  value={weights.projectsDomain}
                  onChange={(e) => setWeights({ ...weights, projectsDomain: Number(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            {totalWeight !== 100 && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
                <span>The sum of weights is {totalWeight}%. Adjust sliders to equal exactly 100%.</span>
                <button
                  type="button"
                  onClick={() =>
                    setWeights({
                      requiredSkills: 35,
                      relevantExperience: 25,
                      jobRoleAlignment: 15,
                      preferredSkills: 10,
                      educationCertifications: 10,
                      projectsDomain: 5,
                    })
                  }
                  className="font-bold underline ml-2"
                >
                  Reset Defaults
                </button>
              </div>
            )}
          </div>

          {/* Section 4: Categorization Thresholds */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
              4. Shortlist Categorization Cutoffs
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <span className="font-bold text-emerald-800 block mb-1">Strong Match (≥)</span>
                <input
                  type="number"
                  value={strongThreshold}
                  onChange={(e) => setStrongThreshold(Number(e.target.value))}
                  className="w-full p-1.5 border border-emerald-200 rounded-md text-xs font-mono font-bold bg-white"
                />
              </div>
              <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                <span className="font-bold text-blue-800 block mb-1">Potential Match (≥)</span>
                <input
                  type="number"
                  value={potentialThreshold}
                  onChange={(e) => setPotentialThreshold(Number(e.target.value))}
                  className="w-full p-1.5 border border-blue-200 rounded-md text-xs font-mono font-bold bg-white"
                />
              </div>
              <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                <span className="font-bold text-amber-800 block mb-1">Needs Review (≥)</span>
                <input
                  type="number"
                  value={reviewThreshold}
                  onChange={(e) => setReviewThreshold(Number(e.target.value))}
                  className="w-full p-1.5 border border-amber-200 rounded-md text-xs font-mono font-bold bg-white"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 transition-colors text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-xs text-xs"
          >
            <Save className="w-4 h-4" />
            <span>{job ? 'Save Changes' : 'Create Job & Initialize Pool'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
