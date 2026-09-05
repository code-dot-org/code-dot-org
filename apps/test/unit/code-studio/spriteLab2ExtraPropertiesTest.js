import {
  camelize,
  RAW_EDITABLE_PROPERTIES,
} from '@cdo/apps/code-studio/spriteLab2ExtraProperties';

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
