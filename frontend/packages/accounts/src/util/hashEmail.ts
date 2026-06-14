import md5 from 'md5';

/**
 * MD5 of the lowercased, trimmed address, matching legacy hashEmail. Sent with
 * an email change so the backend can match accounts without the cleartext.
 */
export function hashEmail(cleartextEmail: string): string {
  return md5(cleartextEmail.toLowerCase().trim());
}
