import {describe, expect, it, vi} from 'vitest';

import type {Transport} from '../../../transports/types';
import {createProjectsApi} from '../projects.api';

describe('createProjectsApi.createBuildLabProject', () => {
  it('creates a Build Lab project through the dashboard API', async () => {
    const request = vi.fn().mockResolvedValue({channel: 'channel-1'});
    const transport = {
      request,
      requestBlob: vi.fn(),
      requestWithMeta: vi.fn(),
    } as unknown as Transport;

    await expect(
      createProjectsApi(transport).createBuildLabProject(),
    ).resolves.toEqual({channel: 'channel-1'});
    expect(request).toHaveBeenCalledWith({
      method: 'POST',
      url: '/api/v1/build_lab/projects',
    });
  });
});
