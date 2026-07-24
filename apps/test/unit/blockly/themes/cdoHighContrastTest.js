import {cdoHighContrastBlockStyles} from '@cdo/apps/blockly/themes/cdoHighContrast';

describe('high contrast Blockly setup block color', () => {
  it('uses the high contrast setup block color', () => {
    expect(cdoHighContrastBlockStyles.setup_blocks.colourPrimary).toBe(
      '#996300'
    );
  });
});
