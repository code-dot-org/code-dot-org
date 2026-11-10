import {
  clickedSprite,
  eventSpriteWarning,
  touchedSprite,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/eventSprites';

function fakeBlock(
  eventSprite: typeof touchedSprite,
  rootType: string,
  {isInFlyout = false, rootEnabled = true} = {}
) {
  return {
    type: eventSprite.definition.type,
    isInFlyout,
    getRootBlock: () => ({type: rootType, isEnabled: () => rootEnabled}),
    setOnChange: jest.fn(),
    setWarningText: jest.fn(),
  };
}

function codeUnder(eventSprite: typeof touchedSprite, rootType: string) {
  const block = fakeBlock(eventSprite, rootType);
  const [code] = eventSprite.generator(block as never, {} as never) as [
    string,
    number
  ];
  return code;
}

function warningUnder(
  eventSprite: typeof touchedSprite,
  rootType: string,
  options?: {isInFlyout?: boolean; rootEnabled?: boolean}
) {
  const block = fakeBlock(eventSprite, rootType, options);
  eventSpriteWarning.call(block as never);
  block.setOnChange.mock.calls[0][0]();
  return block.setWarningText.mock.calls[0]?.[0];
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

describe('eventSpriteWarning', () => {
  it('warns under any other event, naming the right one', () => {
    expect(warningUnder(touchedSprite, 'spritelab2_whenRun')).toBe(
      'This block picks a sprite only under "when touching".'
    );
    expect(warningUnder(clickedSprite, 'gamelab_checkTouching')).toBe(
      'This block picks a sprite only under "when clicked".'
    );
  });

  it('clears the warning under its own event or a disabled stack', () => {
    expect(warningUnder(touchedSprite, 'gamelab_checkTouching')).toBeNull();
    expect(
      warningUnder(touchedSprite, 'spritelab2_whenRun', {rootEnabled: false})
    ).toBeNull();
  });

  it('leaves a flyout block alone', () => {
    expect(
      warningUnder(touchedSprite, 'spritelab2_whenRun', {isInFlyout: true})
    ).toBeUndefined();
  });
});
