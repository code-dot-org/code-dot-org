import {describe, expect, it, vi} from 'vitest';

import type {Transport} from '../../../transports/types';
import {createLibrariesApi} from '../libraries.api';

function mockTransport(response: unknown) {
  return {
    request: vi.fn().mockResolvedValue(response),
    requestBlob: vi.fn(),
    requestWithMeta: vi.fn(),
  } satisfies Transport;
}

describe('createLibrariesApi', () => {
  it('GETs a library by name, as text', async () => {
    const transport = mockTransport('function helper() {}');
    const source = await createLibrariesApi(transport).getSource({
      name: 'Native Sprite Lab',
    });
    expect(transport.request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/libraries/Native%20Sprite%20Lab',
    });
    expect(source).toBe('function helper() {}');
  });

  it('rejects a response that is not text', async () => {
    const transport = mockTransport({error: 'nope'});
    await expect(
      createLibrariesApi(transport).getSource({name: 'x'}),
    ).rejects.toThrow();
  });
});
