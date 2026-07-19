import {describe, expect, it} from 'vitest';

import {parseSandboxUrl} from '../pyodideManager';

describe('parseSandboxUrl', () => {
  it('returns null when the sandbox param is absent', () => {
    expect(parseSandboxUrl('')).toBeNull();
    expect(parseSandboxUrl('?foo=bar')).toBeNull();
  });

  it('returns null when the sandbox param is present but empty', () => {
    expect(parseSandboxUrl('?pyodide-sandbox=')).toBeNull();
  });

  it('returns the sandbox URL when present', () => {
    expect(
      parseSandboxUrl('?pyodide-sandbox=http://localhost:5200/sandbox.html'),
    ).toBe('http://localhost:5200/sandbox.html');
  });

  it('decodes a percent-encoded sandbox URL', () => {
    const url = 'http://localhost:5200/sandbox.html?a=1&b=2';
    expect(parseSandboxUrl('?pyodide-sandbox=' + encodeURIComponent(url))).toBe(
      url,
    );
  });
});
