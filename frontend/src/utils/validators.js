/**
 * Normalizes input string to a clean 10-digit mobile number.
 * Handles '+91', '0' prefixes, spaces, hyphens, and parentheses.
 */
export const normalizeMobile = (input) => {
  if (!input) return '';
  const digits = String(input).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
};

/**
 * Checks whether the phone number is a valid 10-digit mobile number (starts with 6, 7, 8, or 9).
 */
export const isValidMobile = (input) => {
  const normalized = normalizeMobile(input);
  return /^[6-9]\d{9}$/.test(normalized);
};
