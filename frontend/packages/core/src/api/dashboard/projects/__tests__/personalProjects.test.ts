import {describe, expect, it, vi} from 'vitest';

import type {Transport} from '../../../transports/types';
import {createProjectsApi} from '../projects.api';

const transport = (reply: unknown) =>
  ({
    request: vi.fn().mockResolvedValue(reply),
    requestBlob: vi.fn(),
    requestWithMeta: vi.fn(),
  }) satisfies Transport;

describe('getPersonal', () => {
  it("GETs the user's projects, keeping fields it does not name", async () => {
    const row = {
      channel: 'abc',
      name: 'My song',
      type: 'music',
      updatedAt: '2026-08-25T10:00:00Z',
      labConfig: {music: {packId: 'default'}},
      frozen: null,
    };
    const t = transport([row]);
    const projects = await createProjectsApi(t).getPersonal();
    expect(t.request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/api/v1/projects/personal',
    });
    expect(projects).toEqual([row]);
  });

  it('takes the nulls a project never set', async () => {
    const t = transport([
      {channel: 'abc', name: null, type: null, updatedAt: null},
    ]);
    await expect(createProjectsApi(t).getPersonal()).resolves.toHaveLength(1);
  });

  it('rejects a row without a channel', async () => {
    await expect(
      createProjectsApi(transport([{name: 'x'}])).getPersonal(),
    ).rejects.toThrow();
  });
});
