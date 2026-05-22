/**
 * Tests for rewriteGithubUrl.
 *
 * Covers blob → raw rewrite, already-raw passthrough, non-GitHub passthrough,
 * and no-throw guarantee on malformed / empty input.
 */

import {describe, it, expect} from 'vitest';
import {rewriteGithubUrl} from '../githubUrl';

// ---------------------------------------------------------------------------
// Constants shared across tests
// ---------------------------------------------------------------------------

/** Expected raw.githubusercontent.com base for the test repo. */
const RAW_BASE = 'https://raw.githubusercontent.com/owner/repo/main/notebooks/hello.ipynb';

describe('rewriteGithubUrl', () => {
  it('rewrites a github.com blob URL to raw.githubusercontent.com', () => {
    const input = 'https://github.com/owner/repo/blob/main/notebooks/hello.ipynb';
    expect(rewriteGithubUrl(input)).toBe(RAW_BASE);
  });

  it('rewrites a github.com raw URL to raw.githubusercontent.com', () => {
    const input = 'https://github.com/owner/repo/raw/main/notebooks/hello.ipynb';
    expect(rewriteGithubUrl(input)).toBe(RAW_BASE);
  });

  it('passes through an already-raw raw.githubusercontent.com URL unchanged', () => {
    expect(rewriteGithubUrl(RAW_BASE)).toBe(RAW_BASE);
  });

  it('passes through a non-GitHub URL unchanged', () => {
    const input = 'https://example.com/some/notebook.ipynb';
    expect(rewriteGithubUrl(input)).toBe(input);
  });

  it('passes through a malformed string without throwing', () => {
    const input = 'not-a-url-at-all';
    expect(() => rewriteGithubUrl(input)).not.toThrow();
    expect(rewriteGithubUrl(input)).toBe(input);
  });

  it('passes through an empty string without throwing', () => {
    expect(() => rewriteGithubUrl('')).not.toThrow();
    expect(rewriteGithubUrl('')).toBe('');
  });
});
