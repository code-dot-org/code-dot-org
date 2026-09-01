import {describe, expect, it, vi} from 'vitest';

import {createPullRequest} from '../github.js';

const INPUT = {
  owner: 'codeai-staff-apps',
  repo: 'widgets',
  base: 'main',
  head: 'widget/predict-the-trace-v1.0.0',
  title: 'Add predict-the-trace widget',
  body: 'Graduates `predict-the-trace`...',
};

describe('createPullRequest', () => {
  it('runs the exact gh pr create invocation when gh is available, with no network call', async () => {
    const runGh = vi.fn(() => 'https://github.com/codeai-staff-apps/widgets/pull/42\n');
    const result = await createPullRequest(INPUT, {
      ghAvailable: () => true,
      runGh,
    });

    expect(runGh).toHaveBeenCalledWith([
      'pr',
      'create',
      '--repo',
      'codeai-staff-apps/widgets',
      '--base',
      'main',
      '--head',
      'widget/predict-the-trace-v1.0.0',
      '--title',
      'Add predict-the-trace widget',
      '--body',
      'Graduates `predict-the-trace`...',
    ]);
    expect(result).toEqual({
      ok: true,
      method: 'gh',
      url: 'https://github.com/codeai-staff-apps/widgets/pull/42',
    });
  });

  it('reports a gh failure without falling through to the REST API', async () => {
    const runGh = vi.fn(() => {
      throw new Error('a pull request for branch "widget/x" into branch "main" already exists');
    });
    const fetchImpl = vi.fn();
    const result = await createPullRequest(INPUT, {
      ghAvailable: () => true,
      runGh,
      fetchImpl,
      token: 'unused-because-gh-was-tried-first',
    });

    expect(result).toEqual({
      ok: false,
      method: 'gh',
      error: expect.stringContaining('already exists') as unknown as string,
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('constructs the exact REST request when gh is unavailable but a token is set (no real network call)', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({html_url: 'https://github.com/codeai-staff-apps/widgets/pull/43'}), {
        status: 201,
      }),
    );
    const result = await createPullRequest(INPUT, {
      ghAvailable: () => false,
      fetchImpl,
      token: 'test-token',
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.github.com/repos/codeai-staff-apps/widgets/pulls');
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({
      Authorization: 'Bearer test-token',
      Accept: 'application/vnd.github+json',
    });
    expect(JSON.parse(init.body as string)).toEqual({
      title: 'Add predict-the-trace widget',
      head: 'widget/predict-the-trace-v1.0.0',
      base: 'main',
      body: 'Graduates `predict-the-trace`...',
    });
    expect(result).toEqual({
      ok: true,
      method: 'api',
      url: 'https://github.com/codeai-staff-apps/widgets/pull/43',
    });
  });

  it('reports a non-2xx REST response as a failure', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({message: 'Validation Failed'}), {status: 422}),
    );
    const result = await createPullRequest(INPUT, {
      ghAvailable: () => false,
      fetchImpl,
      token: 'test-token',
    });
    expect(result.ok).toBe(false);
    expect(result).toMatchObject({method: 'api'});
  });

  it('reports "none" and makes no network call when neither gh nor a token is available', async () => {
    const fetchImpl = vi.fn();
    const result = await createPullRequest(INPUT, {ghAvailable: () => false, fetchImpl});

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(result).toEqual({
      ok: false,
      method: 'none',
      reason: expect.stringContaining('no gh') as unknown as string,
    });
  });
});
