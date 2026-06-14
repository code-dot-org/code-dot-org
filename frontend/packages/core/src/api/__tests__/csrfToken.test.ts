// @vitest-environment jsdom
import {afterEach, describe, expect, it} from 'vitest';

import {getSpaCsrfToken, resolveCsrfToken, setSpaCsrfToken} from '../csrfToken';

function setMeta(content: string | null) {
  document.querySelector('meta[name="csrf-token"]')?.remove();
  if (content !== null) {
    const meta = document.createElement('meta');
    meta.name = 'csrf-token';
    meta.content = content;
    document.head.appendChild(meta);
  }
}

afterEach(() => {
  setSpaCsrfToken(null);
  setMeta(null);
});

describe('resolveCsrfToken', () => {
  it('is null when neither the meta nor a fetched token is present', () => {
    expect(resolveCsrfToken()).toBeNull();
  });

  it('falls back to the fetched token when the meta is absent', () => {
    setSpaCsrfToken('fetched-tok');
    expect(getSpaCsrfToken()).toBe('fetched-tok');
    expect(resolveCsrfToken()).toBe('fetched-tok');
  });

  it('prefers the shell meta over a fetched token', () => {
    setMeta('meta-tok');
    setSpaCsrfToken('fetched-tok');
    expect(resolveCsrfToken()).toBe('meta-tok');
  });
});
