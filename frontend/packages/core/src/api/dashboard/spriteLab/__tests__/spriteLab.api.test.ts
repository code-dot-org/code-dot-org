import {describe, expect, it, vi} from 'vitest';

import type {Transport} from '../../../transports/types';
import {createSpriteLabApi} from '../spriteLab.api';

function mockTransport(
  response: unknown,
): Transport & {request: ReturnType<typeof vi.fn>} {
  return {
    request: vi.fn().mockResolvedValue(response),
    requestBlob: vi.fn(),
    requestWithMeta: vi.fn(),
  };
}

const ref = {
  channel: 'abc123',
  sceneId: 'scene-1',
  sceneName: 'Forest',
  ownerName: 'Sam',
};

describe('createSpriteLabApi', () => {
  it('GETs section scenes for a level in a script', async () => {
    const transport = mockTransport({scenes: [ref]});
    const scenes = await createSpriteLabApi(transport).getSectionScenes({
      levelId: 7,
      scriptId: 9,
    });
    expect(transport.request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/sprite_lab2/section_scenes',
      query: {level_id: 7, script_id: 9},
    });
    expect(scenes).toEqual([ref]);
  });

  it('reads a missing scene list as empty', async () => {
    const transport = mockTransport({});
    const scenes = await createSpriteLabApi(transport).getSectionScenes({
      levelId: 7,
      scriptId: 9,
    });
    expect(scenes).toEqual([]);
  });

  it('GETs an external project, sending an empty script id when absent', async () => {
    const project = {scenes: [{id: 's'}], animations: {}, ownerName: 'Sam'};
    const transport = mockTransport(project);
    const result = await createSpriteLabApi(transport).getExternalScenes({
      channel: 'abc123',
      levelId: 7,
    });
    expect(transport.request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/sprite_lab2/external_scenes',
      query: {channel: 'abc123', level_id: 7, script_id: ''},
    });
    expect(result).toEqual(project);
  });
});
