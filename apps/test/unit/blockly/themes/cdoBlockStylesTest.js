import cdoBlockStyles from '@cdo/apps/blockly/themes/cdoBlockStyles';

describe('CDO Blockly setup block colors', () => {
  it('uses the CodeAI orange for the default theme', () => {
    expect(cdoBlockStyles.setup_blocks.colourPrimary).toBe('#f46800');
  });
});
