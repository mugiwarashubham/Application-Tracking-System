export const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];
export const SOURCES = ['LinkedIn', 'Referral', 'Job board', 'Company site', 'Agency', 'Other'];
export const STAGE_COLORS = {
  Applied: '#66758C',
  Screening: '#2878B5',
  Interview: '#7650C9',
  Offer: '#C98417',
  Hired: '#1C8A5A',
  Rejected: '#BF4540',
};

export const daysSince = (date) => Math.max(0, Math.floor((Date.now() - new Date(date)) / 86400000));
export const initials = (name) => name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
export const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
