import {
  camelize,
  isBlank,
  RAW_EDITABLE_PROPERTIES,
} from '@cdo/apps/code-studio/spriteLab2ExtraProperties';

// isBlank hand-mirrors Rails present? — what SerializedProperties'
// before_save strips — so the two rule sets must not drift: a value the
// dump keeps but the server drops (or vice versa) makes the dump lie.
describe('isBlank', () => {
  const blank = [null, false, '', '   ', '\t\n', [], {}];
  const present = [true, 0, 1, 'x', ' x ', [0], [null], {a: null}, {a: 1}];

  blank.forEach(value => {
    it(`treats ${JSON.stringify(value)} as blank, like Rails`, () => {
      expect(isBlank(value)).toBe(true);
    });
  });

  present.forEach(value => {
    it(`keeps ${JSON.stringify(value)}, like Rails`, () => {
      expect(isBlank(value)).toBe(false);
    });
  });
});

// The dump reads values by the camelized name level_properties serves and
// saves by the stored snake_case name; every editable key must round-trip.
describe('camelize', () => {
  it('matches the server camelization for every editable key', () => {
    const expected = {
      guide_mode: 'guideMode',
      guide_steps: 'guideSteps',
      hide_custom_blocks: 'hideCustomBlocks',
      images_advanced: 'imagesAdvanced',
      locked_image_type: 'lockedImageType',
      pinned_scene_id: 'pinnedSceneId',
      pinned_scene_name: 'pinnedSceneName',
      show_world_tab: 'showWorldTab',
      visible_tabs: 'visibleTabs',
      world_grid_size: 'worldGridSize',
    };
    expect(Object.keys(expected).sort()).toEqual(
      [...RAW_EDITABLE_PROPERTIES].sort()
    );
    RAW_EDITABLE_PROPERTIES.forEach(key => {
      expect(camelize(key)).toBe(expected[key]);
    });
  });
});
