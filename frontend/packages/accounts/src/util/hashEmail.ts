import md5 from 'md5';

/**
 * Client-side email hash, matching the legacy `hashEmail` behavior: MD5 of the
 * lowercased, trimmed address. Sent alongside an email change so the backend
 * can match accounts without the cleartext address.
 */
export function hashEmail(cleartextEmail: string): string {
  return md5(cleartextEmail.toLowerCase().trim());
}
