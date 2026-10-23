import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { Candidate, JobDescription } from '../types';

export interface ExportColumnConfig {
  key: string;
  label: string;
  enabled: boolean;
}

export const DEFAULT_EXPORT_COLUMNS: ExportColumnConfig[] = [
  { key: 'name', label: 'Candidate Name', enabled: true },
  { key: 'email', label: 'Email', enabled: true },
  { key: 'phone', label: 'Phone', enabled: true },
  { key: 'status', label: 'Status', enabled: true },
  { key: 'matchScore', label: 'Match Score (%)', enabled: true },
  { key: 'category', label: 'Match Category', enabled: true },
  { key: 'totalExp', label: 'Total Experience (Yrs)', enabled: true },
  { key: 'currentTitle', label: 'Current Designation', enabled: true },
  { key: 'skills', label: 'Key Skills', enabled: true },
  { key: 'matchedSkills', label: 'Matched Requirements', enabled: true },
  { key: 'missingSkills', label: 'Missing Requirements', enabled: true },
  { key: 'education', label: 'Highest Education', enabled: true },
  { key: 'location', label: 'Location', enabled: true },
  { key: 'noticePeriod', label: 'Notice Period', enabled: true },
];

function prepareCandidateRow(candidate: Candidate, enabledKeys: Set<string>): Record<string, string | number> {
  const row: Record<string, string | number> = {};
  const pr = candidate.parsedResume;
  const ma = candidate.matchAnalysis;

  if (enabledKeys.has('name')) row['Candidate Name'] = pr.name || 'Not specified';
  if (enabledKeys.has('email')) row['Email'] = pr.email || 'Not specified';
  if (enabledKeys.has('phone')) row['Phone'] = pr.phone || 'Not specified';
  if (enabledKeys.has('status')) row['Status'] = candidate.status.toUpperCase();
  if (enabledKeys.has('matchScore')) row['Match Score (%)'] = ma?.matchScore ?? 'N/A';
  if (enabledKeys.has('category')) row['Match Category'] = ma?.category ?? 'Pending';
  if (enabledKeys.has('totalExp')) row['Total Experience (Yrs)'] = pr.totalExperienceYears || 0;
  if (enabledKeys.has('currentTitle')) row['Current Designation'] = pr.currentTitle || 'Not specified';
  if (enabledKeys.has('skills')) row['Key Skills'] = pr.technicalSkills.join(', ') || 'Not specified';
  if (enabledKeys.has('matchedSkills')) row['Matched Requirements'] = ma?.matchedRequiredSkills.join(', ') || 'None';
  if (enabledKeys.has('missingSkills')) row['Missing Requirements'] = ma?.missingRequiredSkills.join(', ') || 'None';
  if (enabledKeys.has('education')) {
    row['Highest Education'] = pr.education[0] ? `${pr.education[0].degree} in ${pr.education[0].field}` : 'Not specified';
  }
  if (enabledKeys.has('location')) row['Location'] = pr.location || 'Not specified';
  if (enabledKeys.has('noticePeriod')) row['Notice Period'] = pr.noticePeriod || 'Not specified';

  return row;
}

export function exportToCSV(candidates: Candidate[], columnConfigs: ExportColumnConfig[] = DEFAULT_EXPORT_COLUMNS, filename = 'candidate_screening_report.csv') {
  const enabledKeys = new Set(columnConfigs.filter(c => c.enabled).map(c => c.key));
  const data = candidates.map(c => prepareCandidateRow(c, enabledKeys));
  
  if (data.length === 0) return;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToExcel(candidates: Candidate[], columnConfigs: ExportColumnConfig[] = DEFAULT_EXPORT_COLUMNS, filename = 'candidate_screening_report.xlsx') {
  const enabledKeys = new Set(columnConfigs.filter(c => c.enabled).map(c => c.key));
  const data = candidates.map(c => prepareCandidateRow(c, enabledKeys));
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates');
  
  XLSX.writeFile(workbook, filename);
}

export function exportToPDF(candidates: Candidate[], job?: JobDescription, filename = 'candidate_screening_summary.pdf') {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text('TalentIQ — Candidate Screening Report', 14, 18);
  
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated: ${new Date().toLocaleDateString()} | Target Job: ${job ? job.title : 'All Active Jobs'}`, 14, 25);
  
  // Summary Stats
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.text(`Total Candidates Evaluated: ${candidates.length}`, 14, 40);

  const strongCount = candidates.filter(c => c.matchAnalysis?.category === 'Strong Match').length;
  const potentialCount = candidates.filter(c => c.matchAnalysis?.category === 'Potential Match').length;
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Strong Matches: ${strongCount}  |  Potential: ${potentialCount}  |  Review/Others: ${candidates.length - strongCount - potentialCount}`, 14, 46);

  // Table items
  let y = 56;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, 196, y);
  y += 6;

  // Column header
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text('CANDIDATE', 14, y);
  doc.text('SCORE', 75, y);
  doc.text('STATUS', 95, y);
  doc.text('EXPERIENCE', 125, y);
  doc.text('KEY MATCHED SKILLS', 150, y);
  y += 4;
  doc.line(14, y, 196, y);
  y += 6;

  candidates.slice(0, 30).forEach((cand) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    const pr = cand.parsedResume;
    const ma = cand.matchAnalysis;

    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(pr.name.slice(0, 26), 14, y);

    const score = ma?.matchScore ?? 0;
    if (score >= 80) doc.setTextColor(22, 101, 52); // green
    else if (score >= 65) doc.setTextColor(30, 64, 175); // blue
    else doc.setTextColor(180, 83, 9); // amber
    doc.text(`${score}% (${ma?.category ? ma.category.split(' ')[0] : 'N/A'})`, 75, y);

    doc.setTextColor(71, 85, 105);
    doc.text(cand.status.toUpperCase(), 95, y);
    doc.text(`${pr.totalExperienceYears} yrs`, 125, y);
    
    const skillsText = (ma?.matchedRequiredSkills || pr.technicalSkills).slice(0, 3).join(', ');
    doc.text(skillsText.slice(0, 24), 150, y);

    y += 7;
  });

  doc.save(filename);
}
