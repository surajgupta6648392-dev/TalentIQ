import { Candidate, ParsedResume } from '../types';

export function normalizePhone(phone: string): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '').slice(-10);
}

export function detectDuplicateCandidate(
  newResume: ParsedResume,
  existingCandidates: Candidate[]
): { isDuplicate: boolean; matchedCandidate?: Candidate; reason?: string } {
  const newEmail = (newResume.email || '').toLowerCase().trim();
  const newPhone = normalizePhone(newResume.phone);
  const newName = (newResume.name || '').toLowerCase().trim();

  for (const existing of existingCandidates) {
    const exResume = existing.parsedResume;
    const exEmail = (exResume.email || '').toLowerCase().trim();
    const exPhone = normalizePhone(exResume.phone);
    const exName = (exResume.name || '').toLowerCase().trim();

    // 1. Email exact match
    if (newEmail && exEmail && newEmail === exEmail && newEmail !== 'not specified') {
      return {
        isDuplicate: true,
        matchedCandidate: existing,
        reason: `Identical email address found: ${newEmail}`,
      };
    }

    // 2. Phone exact match (10 digits)
    if (newPhone && exPhone && newPhone.length >= 7 && newPhone === exPhone) {
      return {
        isDuplicate: true,
        matchedCandidate: existing,
        reason: `Matching phone number found (${newResume.phone})`,
      };
    }

    // 3. Name match combined with company or location
    if (newName && exName && newName === exName && newName !== 'not specified') {
      const companyOverlap = newResume.companies.some(c => 
        c && exResume.companies.some(ec => ec && ec.toLowerCase() === c.toLowerCase())
      );
      if (companyOverlap) {
        return {
          isDuplicate: true,
          matchedCandidate: existing,
          reason: `Identical full name "${newResume.name}" with overlapping employment history (${newResume.companies[0]})`,
        };
      }
    }
  }

  return { isDuplicate: false };
}
