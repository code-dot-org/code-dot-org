/**
 * Polyfills for Node.js globals required by aws-sdk in browser environments.
 * This file must be imported BEFORE any aws-sdk imports.
 */

// The buffer package used by aws-sdk expects 'global' to be defined
if (typeof globalThis.global === 'undefined') {
  (globalThis as typeof globalThis & {global: typeof globalThis}).global =
    globalThis;
}
