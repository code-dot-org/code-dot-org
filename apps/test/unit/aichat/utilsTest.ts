import {AssetSource, ChatAsset} from '@cdo/apps/aichat/types';
import {getAssetUrl} from '@cdo/apps/aichat/utils';

describe('getAssetUrl', () => {
  const projectAsset: ChatAsset = {
    filename: 'sloth.png',
    source: AssetSource.PROJECT,
  };

  it('resolves a project asset against the open project when it records none', () => {
    expect(getAssetUrl(projectAsset, 'open-channel')).toBe(
      '/v3/assets/open-channel/sloth.png'
    );
  });

  it('resolves a project asset against the project it records', () => {
    // The asset was written to another project -- typically because its
    // message was created on a different level. Resolving against the open
    // project would 404.
    expect(
      getAssetUrl(
        {...projectAsset, channelId: 'origin-channel'},
        'open-channel'
      )
    ).toBe('/v3/assets/origin-channel/sloth.png');
  });

  it('prefers the recorded project even when no project is open', () => {
    expect(getAssetUrl({...projectAsset, channelId: 'origin-channel'})).toBe(
      '/v3/assets/origin-channel/sloth.png'
    );
  });

  it('keeps using bucketKey over filename', () => {
    expect(
      getAssetUrl({
        ...projectAsset,
        bucketKey: 'uuid-key.png',
        channelId: 'origin-channel',
      })
    ).toBe('/v3/assets/origin-channel/uuid-key.png');
  });

  it('resolves a level asset against the level it records', () => {
    expect(
      getAssetUrl(
        {
          filename: 'starter.png',
          source: AssetSource.LEVEL,
          levelName: 'origin-level',
        },
        undefined,
        'open-level'
      )
    ).toBe('/level_starter_assets/origin-level/starter.png');
  });

  it('resolves a level_uuid asset against the level it records', () => {
    expect(
      getAssetUrl(
        {
          filename: 'starter.png',
          source: AssetSource.LEVEL_UUID,
          levelName: 'origin-level',
        },
        undefined,
        'open-level'
      )
    ).toBe('/level_starter_assets/origin-level/uuid/starter.png');
  });

  it('falls back to the open level for assets that record none', () => {
    expect(
      getAssetUrl(
        {filename: 'starter.png', source: AssetSource.LEVEL},
        undefined,
        'open-level'
      )
    ).toBe('/level_starter_assets/open-level/starter.png');
  });

  it('throws when there is nothing to resolve against', () => {
    expect(() => getAssetUrl(projectAsset)).toThrow(
      'Either channel ID or level name must be provided'
    );
  });
});
