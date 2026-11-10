import {
  clickedSprite,
  touchedSprite,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/eventSprites';

function codeUnder(eventSprite: typeof touchedSprite, rootType: string) {
  const block = {getRootBlock: () => ({type: rootType})};
  const [code] = eventSprite.generator(block as never, {} as never) as [
    string,
    number
  ];
  return code;
}

describe('spritelab2_touchedSprite', () => {
  it('picks the touched sprite under "when touching"', () => {
    expect(codeUnder(touchedSprite, 'gamelab_checkTouching')).toBe(
      '{id: extraArgs.objectSprite}'
    );
  });

  it('picks no sprite under any other event', () => {
    expect(codeUnder(touchedSprite, 'gamelab_spriteClicked')).toBe('{}');
    expect(codeUnder(touchedSprite, 'spritelab2_whenRun')).toBe('{}');
  });
});

describe('spritelab2_clickedSprite', () => {
  it('picks the clicked sprite under "when clicked"', () => {
    expect(codeUnder(clickedSprite, 'gamelab_spriteClicked')).toBe(
      '{id: extraArgs.clickedSprite}'
    );
  });

  it('picks no sprite under any other event', () => {
    expect(codeUnder(clickedSprite, 'gamelab_checkTouching')).toBe('{}');
    expect(codeUnder(clickedSprite, 'spritelab2_whenRun')).toBe('{}');
  });
});
