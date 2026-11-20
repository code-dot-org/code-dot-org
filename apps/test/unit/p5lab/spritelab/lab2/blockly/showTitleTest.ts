import showTitle, {
  SHOW_TITLE_BLOCK_TYPE,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/showTitle';

describe(SHOW_TITLE_BLOCK_TYPE, () => {
  it('generates a showTitle call with the text, quoted', () => {
    const block = {getFieldValue: () => 'You "win"!'};
    expect(showTitle.generator(block as never, {} as never)).toBe(
      'showTitle("You \\"win\\"!");\n'
    );
  });
});
