import {flatFromLevelConfig} from '@cdo/apps/p5lab/spritelab/lab2/levelConfig/applyLevelConfig';
import {
  FlatProperties,
  levelConfigFromFlat,
} from '@cdo/apps/p5lab/spritelab/lab2/levelConfig/fromFlat';
import {parseLevelConfig} from '@cdo/apps/p5lab/spritelab/lab2/levelConfig/schema';
import {LevelMode, tabsForMode} from '@cdo/apps/p5lab/spritelab/lab2/levelMode';

// A world level that starts with making its image, as the unit's ninth.
const WORLD_LEVEL: FlatProperties = {
  levelMode: {
    kind: 'world',
    imageFirst: true,
    imageType: 'sprite',
    imageRole: 'friend',
    oneImage: true,
    limitedPaintTools: true,
    generationLimit: 5,
    paletteRoles: ['friend', 'hero', 'treasure', 'block'],
  },
  pinnedScene: {id: 'scene-1', name: 'Scene 1'},
  worldKeepsRoles: ['friend', 'hero', 'treasure'],
  imageRoleDefaults: {sprite: 'hero'},
  objectives: {
    title: '**Friend or foe?**',
    items: [{text: 'Make a friend.', check: {kind: 'rated'}}],
  },
};

describe('levelConfigFromFlat', () => {
  it('writes a level in terms of its focus and what the student edits', () => {
    expect(levelConfigFromFlat(WORLD_LEVEL)).toEqual({
      config: {
        focus: 'world',
        edits: ['images', 'world'],
        images: {
          makes: {type: 'sprite', role: 'friend'},
          makeFirst: true,
          onlyThisImage: true,
          paintTools: 'limited',
          generationLimit: 5,
        },
        world: {
          palette: ['friend', 'hero', 'treasure', 'block'],
          keepsOneOf: ['friend', 'hero', 'treasure'],
        },
        scenes: {starting: [{id: 'scene-1', name: 'Scene 1'}]},
        blocks: {dropdownsStartOn: {sprite: 'hero'}},
        objectives: {
          title: '**Friend or foe?**',
          steps: [{text: 'Make a friend.', check: {kind: 'rated'}}],
        },
      },
      dropped: [],
    });
  });

  it('gives free play no focus', () => {
    expect(
      levelConfigFromFlat({levelMode: {kind: 'freeplay'}, freeplayIntro: true})
    ).toEqual({config: {freePlayIntro: true}, dropped: []});
  });

  it('turns the tabs a level added into parts the student edits', () => {
    const {config} = levelConfigFromFlat({
      levelMode: {kind: 'code', extraTabs: ['World', 'Images']},
    });
    expect(config).toEqual({focus: 'code', edits: ['images', 'world', 'code']});
  });

  it('lets a level about playing edit nothing', () => {
    expect(levelConfigFromFlat({levelMode: {kind: 'play'}}).config).toEqual({
      focus: 'play',
      edits: [],
    });
  });

  it('says what a student may not do as what they can', () => {
    const {config} = levelConfigFromFlat({
      levelMode: {kind: 'code', noNewImages: true, noDeletingImages: true},
    });
    expect(config.images).toEqual({canAdd: false, canDelete: false});
  });

  it('puts each premade world with its scene', () => {
    const {config} = levelConfigFromFlat({
      pinnedScene: {id: 'scene-1', name: 'Scene 1'},
      worldStartPattern: ['S.B'],
      worldStartRoles: {F: 'friend'},
      extraScene: {
        id: 'second-scene',
        name: 'Scene 2',
        worldStartPattern: ['BBB'],
        editable: true,
      },
    });
    expect(config.scenes?.starting).toEqual([
      {
        id: 'scene-1',
        name: 'Scene 1',
        world: {pattern: ['S.B'], roles: {F: 'friend'}},
      },
      {
        id: 'second-scene',
        name: 'Scene 2',
        world: {pattern: ['BBB']},
        editable: true,
      },
    ]);
  });

  it('lists the earlier options that have no place in the new shape', () => {
    const levelMode = {kind: 'code', placeOne: true} as unknown as LevelMode;
    expect(levelConfigFromFlat({levelMode}).dropped).toEqual([
      'level_mode.placeOne: true',
    ]);
  });

  it('gives the lab the same level back', () => {
    const {config} = levelConfigFromFlat(WORLD_LEVEL);
    expect(parseLevelConfig(config).problems).toEqual([]);
    const back = flatFromLevelConfig(config);
    expect(tabsForMode(back.levelMode)).toEqual(
      tabsForMode(WORLD_LEVEL.levelMode)
    );
    expect(back).toEqual({
      ...WORLD_LEVEL,
      // Images is the tab the level added, now that it is said as an edit.
      levelMode: {...WORLD_LEVEL.levelMode, extraTabs: ['Images']},
    });
  });
});
