import {
  sceneBackgroundImage,
  sceneFingerprint,
  sceneMetadataFor,
  thumbnailFileName,
} from '@cdo/apps/p5lab/spritelab/lab2/sceneThumbnails';
import {
  RuntimeAnimationList,
  Scene,
} from '@cdo/apps/p5lab/spritelab/lab2/types';

const source = (imgField: string) => ({
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'spritelab2_whenRun',
        id: 'a',
        next: {
          block: {
            type: 'gamelab_setBackgroundImageAs',
            id: 'b',
            fields: {IMG: imgField},
          },
        },
      },
    ],
  },
});

const animations = (entries: [string, string][]): RuntimeAnimationList =>
  ({
    orderedKeys: entries.map(([name]) => name),
    propsByKey: Object.fromEntries(
      entries.map(([name, sourceUrl]) => [name, {name, sourceUrl}])
    ),
  } as unknown as RuntimeAnimationList);

describe('sceneThumbnails', () => {
  describe('sceneFingerprint', () => {
    const scene: Scene = {id: 's', name: 'S', source: source('"forest"')};

    it('is stable for the same scene and images', () => {
      const list = animations([['forest', '/a.png']]);
      expect(sceneFingerprint(scene, list)).toBe(
        sceneFingerprint({...scene}, list)
      );
    });

    it('changes when the code changes', () => {
      const list = animations([['forest', '/a.png']]);
      expect(sceneFingerprint(scene, list)).not.toBe(
        sceneFingerprint({...scene, source: source('"sky"')}, list)
      );
    });

    it('changes when a referenced image is replaced', () => {
      expect(
        sceneFingerprint(scene, animations([['forest', '/a.png']]))
      ).not.toBe(sceneFingerprint(scene, animations([['forest', '/b.png']])));
    });

    it('ignores images the scene does not reference', () => {
      expect(sceneFingerprint(scene, animations([['forest', '/a.png']]))).toBe(
        sceneFingerprint(
          scene,
          animations([
            ['forest', '/a.png'],
            ['unused', '/z.png'],
          ])
        )
      );
    });

    it('ignores the stored thumbnail itself', () => {
      const list = animations([]);
      expect(sceneFingerprint(scene, list)).toBe(
        sceneFingerprint(
          {...scene, thumbnail: {url: '/t.png', fingerprint: 'x'}},
          list
        )
      );
    });
  });

  describe('sceneBackgroundImage', () => {
    it('reads the quoted literal the block stores', () => {
      expect(
        sceneBackgroundImage({id: 's', name: 'S', source: source('"forest"')})
      ).toBe('forest');
    });

    it('is null for a scene with no background block', () => {
      expect(
        sceneBackgroundImage({
          id: 's',
          name: 'S',
          source: {
            blocks: {languageVersion: 0, blocks: []},
          } as unknown as Scene['source'],
        })
      ).toBeNull();
    });
  });

  describe('sceneMetadataFor', () => {
    const forest = animations([['forest', '/forest.png']]);

    it('uses the stored picture when there is one', () => {
      const [meta] = sceneMetadataFor(
        [
          {
            id: 's',
            name: 'S',
            source: source('"forest"'),
            thumbnail: {url: '/thumb.png', fingerprint: 'x'},
          },
        ],
        forest
      );
      expect(meta).toEqual({id: 's', name: 'S', thumbnail: '/thumb.png'});
    });

    it('falls back to the background the scene names', () => {
      const [meta] = sceneMetadataFor(
        [{id: 's', name: 'S', source: source('"forest"')}],
        forest
      );
      expect(meta.thumbnail).toBe('/forest.png');
    });

    it('has no picture for a scene naming an unknown image', () => {
      const [meta] = sceneMetadataFor(
        [{id: 's', name: 'S', source: source('"sky"')}],
        forest
      );
      expect(meta.thumbnail).toBeUndefined();
    });
  });

  it('names the asset after the scene and the fingerprint prefix', () => {
    expect(thumbnailFileName('scene-1', 'abcdef0123456789')).toBe(
      'scene-thumb-scene-1-abcdef01.png'
    );
  });
});
