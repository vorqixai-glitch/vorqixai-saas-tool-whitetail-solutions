export function safeDate(dateStr: string | null | undefined): Date {
  if (!dateStr) return new Date();
  
  // If it's pure numbers (unix ms)
  if (/^\d+$/.test(dateStr)) {
    return new Date(parseInt(dateStr, 10));
  }

  // SQLite CURRENT_TIMESTAMP format "YYYY-MM-DD HH:MM:SS" -> Add T and Z
  if (typeof dateStr === 'string' && dateStr.includes(' ') && !dateStr.includes('Z')) {
    dateStr = dateStr.replace(' ', 'T') + 'Z';
  }

  return new Date(dateStr);
}
