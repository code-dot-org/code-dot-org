import type {CertificateParams} from './types';

function normalizeBase64Url(value: string): string {
  const paddingLength = (4 - (value.length % 4)) % 4;
  return `${value.replace(/-/g, '+').replace(/_/g, '/')}${'='.repeat(
    paddingLength,
  )}`;
}

/**
 * Decodes the base64url-JSON path param carried by /certificates/:encoded_params
 * and /print_certificates/:encoded_params. Throws on malformed input — callers
 * render an error state rather than a blank certificate.
 */
export function decodeCertificateParams(
  encodedParams: string,
): CertificateParams {
  const binary = atob(normalizeBase64Url(encodedParams));
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  const parsed: unknown = JSON.parse(
    new TextDecoder('utf-8', {fatal: true}).decode(bytes),
  );

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Certificate params must decode to a JSON object');
  }

  const {course, donor, name} = parsed as Record<string, unknown>;

  return {
    // The legacy server falls back to the Hour of Code certificate when the
    // course is absent or unrecognized.
    course: typeof course === 'string' && course ? course : 'hourofcode',
    ...(typeof donor === 'string' && donor ? {donor} : {}),
    ...(typeof name === 'string' && name ? {name} : {}),
  };
}

/**
 * RFC 4648 base64url without padding — the same alphabet the legacy pages
 * used when building share/print URLs (Certificate.jsx getEncodedParams).
 */
export function encodeCertificateParams(params: CertificateParams): string {
  const bytes = new TextEncoder().encode(JSON.stringify(params));
  let binary = '';
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
