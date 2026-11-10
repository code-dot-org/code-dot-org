import {
  clickedSprite,
  eventSpriteWarning,
  touchedSprite,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/eventSprites';

interface Placement {
  inHandler?: boolean;
  isInFlyout?: boolean;
  rootEnabled?: boolean;
}

// inHandler false puts the block in one of the event's own sprite inputs.
function fakeBlock(
  eventSprite: typeof touchedSprite,
  rootType: string,
  {inHandler = true, isInFlyout = false, rootEnabled = true}: Placement = {}
) {
  const block = {
    type: eventSprite.definition.type,
    isInFlyout,
    getRootBlock: () => root,
    setOnChange: jest.fn(),
    setWarningText: jest.fn(),
  };
  const handler = {getDescendants: () => (inHandler ? [block] : [])};
  const root = {
    type: rootType,
    isEnabled: () => rootEnabled,
    getNextBlock: () => handler,
  };
  return block;
}

function codeUnder(
  eventSprite: typeof touchedSprite,
  rootType: string,
  placement?: Placement
) {
  const block = fakeBlock(eventSprite, rootType, placement);
  const [code] = eventSprite.generator(block as never, {} as never) as [
    string,
    number
  ];
  return code;
}

function warningUnder(
  eventSprite: typeof touchedSprite,
  rootType: string,
  placement?: Placement
) {
  const block = fakeBlock(eventSprite, rootType, placement);
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

  it("picks no sprite in the event's own sprite inputs", () => {
    expect(
      codeUnder(touchedSprite, 'gamelab_checkTouching', {inHandler: false})
    ).toBe('{}');
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

  it("picks no sprite in the event's own sprite input", () => {
    expect(
      codeUnder(clickedSprite, 'gamelab_spriteClicked', {inHandler: false})
    ).toBe('{}');
  });
});

describe('eventSpriteWarning', () => {
  it('warns under any other event, naming the right one', () => {
    expect(warningUnder(touchedSprite, 'spritelab2_whenRun')).toBe(
      'This block picks a sprite only in the blocks below "when touching".'
    );
    expect(warningUnder(clickedSprite, 'gamelab_checkTouching')).toBe(
      'This block picks a sprite only in the blocks below "when clicked".'
    );
  });

  it("warns in its own event's sprite input", () => {
    expect(
      warningUnder(clickedSprite, 'gamelab_spriteClicked', {inHandler: false})
    ).toBe(
      'This block picks a sprite only in the blocks below "when clicked".'
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
