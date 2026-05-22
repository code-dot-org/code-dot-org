/**
 * codec — encodes and decodes CompletionArtifact values for URL transport.
 *
 * Encoding: JSON.stringify → pako.deflate → base64url (no padding).
 * Decoding: base64url → pako.inflate → JSON.parse.
 *
 * base64url uses '-' for '+' and '_' for '/' with no trailing '=' padding,
 * making the result safe to embed in URL hash fragments without percent-encoding.
 */

import pako from 'pako';
import type {CompletionArtifact} from './artifactPayload';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Converts a standard base64 string to base64url encoding.
 * Replaces '+' with '-', '/' with '_', and strips trailing '='.
 * @param b64 Standard base64 string
 * @returns base64url encoded string
 */
function toBase64Url(b64: string): string {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Converts a base64url string back to standard base64 for decoding.
 * Replaces '-' with '+' and '_' with '/', and re-adds padding if needed.
 * @param b64url base64url encoded string
 * @returns Standard base64 string with correct padding
 */
function fromBase64Url(b64url: string): string {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (b64.length % 4)) % 4;
  return b64 + '='.repeat(padLen);
}

/**
 * Converts a Uint8Array to a standard base64 string.
 * Uses String.fromCharCode in chunks to avoid stack overflow on large arrays.
 * @param bytes Binary data to encode
 * @returns Standard base64 string
 */
function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

/**
 * Converts a standard base64 string to a Uint8Array.
 * @param b64 Standard base64 string
 * @returns Decoded binary data
 */
function base64ToUint8(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Encodes a CompletionArtifact to a compact URL-safe string.
 *
 * Pipeline: JSON.stringify → pako.deflate → base64url.
 * The resulting string is safe to embed in URL hash fragments.
 *
 * @param artifact Artifact to encode
 * @returns base64url-encoded deflated JSON
 */
export function encodeArtifact(artifact: CompletionArtifact): string {
  const json = JSON.stringify(artifact);
  const deflated = pako.deflate(json);
  const b64 = uint8ToBase64(deflated);
  return toBase64Url(b64);
}

/**
 * Decodes a CompletionArtifact from the compact URL-safe string produced by
 * {@link encodeArtifact}.
 *
 * Pipeline: base64url → pako.inflate → JSON.parse.
 * Throws on any decoding or parsing failure.
 *
 * @param encoded base64url-encoded deflated JSON string
 * @returns Decoded CompletionArtifact
 * @throws {Error} When the input is not a valid encoded artifact
 */
export function decodeArtifact(encoded: string): CompletionArtifact {
  const b64 = fromBase64Url(encoded);
  const bytes = base64ToUint8(b64);
  const json = pako.inflate(bytes, {to: 'string'});
  return JSON.parse(json) as CompletionArtifact;
}
