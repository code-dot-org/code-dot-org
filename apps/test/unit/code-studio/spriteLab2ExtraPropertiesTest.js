import {
  camelize,
  RAW_EDITABLE_PROPERTIES,
} from '@cdo/apps/code-studio/spriteLab2ExtraProperties';

// The dump reads values by the camelized name level_properties serves and
// saves by the stored snake_case name; every editable key must round-trip.
describe('camelize', () => {
  it('matches the server camelization for every editable key', () => {
    const expected = {
      guide_steps: 'guideSteps',
      hide_custom_blocks: 'hideCustomBlocks',
      image_defaults: 'imageDefaults',
      level_mode: 'levelMode',
      pinned_scene: 'pinnedScene',
      world_start_pattern: 'worldStartPattern',
    };
    expect(Object.keys(expected).sort()).toEqual(
      [...RAW_EDITABLE_PROPERTIES].sort()
    );
    RAW_EDITABLE_PROPERTIES.forEach(key => {
      expect(camelize(key)).toBe(expected[key]);
    });
  });
});
