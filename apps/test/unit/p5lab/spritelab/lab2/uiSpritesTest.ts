import {
  createUiCommands,
  displayText,
  UiLibrary,
  UiP5,
  UiSprite,
  wrapLines,
} from '@cdo/apps/p5lab/spritelab/lab2/uiSprites';

// Every character is 10px wide at any size, so widths are easy to predict.
const measure = (s: string) => s.length * 10;

describe('wrapLines', () => {
  it('keeps a short line whole', () => {
    expect(wrapLines('Plant Doctor', 200, measure)).toEqual(['Plant Doctor']);
  });

  it('breaks between words at the width', () => {
    expect(wrapLines('water it less often', 100, measure)).toEqual([
      'water it',
      'less often',
    ]);
  });

  it('gives an over-wide word its own line instead of splitting it', () => {
    expect(wrapLines('a photosynthesis b', 50, measure)).toEqual([
      'a',
      'photosynthesis',
      'b',
    ]);
  });

  it('keeps the student line breaks', () => {
    expect(wrapLines('one\ntwo', 500, measure)).toEqual(['one', 'two']);
  });
});

describe('displayText', () => {
  it('shows numbers and hides a missing value', () => {
    expect(displayText(3)).toBe('3');
    expect(displayText(undefined)).toBe('');
    expect(displayText(null)).toBe('');
  });
});

function fakeWorld() {
  const sprites: UiSprite[] = [];
  const events: {type: string; args: unknown; callback: () => void}[] = [];
  const p5 = {
    CENTER: 'center',
    BOLD: 'bold',
    NORMAL: 'normal',
    textWidth: measure,
    mouseIsOver: () => false,
  } as unknown as UiP5;
  [
    'push',
    'pop',
    'fill',
    'noFill',
    'stroke',
    'strokeWeight',
    'noStroke',
    'rect',
    'rectMode',
    'text',
    'textAlign',
    'textSize',
    'textStyle',
  ].forEach(name => {
    (p5 as unknown as Record<string, jest.Mock>)[name] = jest.fn();
  });
  const library: UiLibrary = {
    p5,
    addSprite({name, location}) {
      const at = location as {x: number; y: number};
      const sprite: UiSprite = {
        id: sprites.length,
        name,
        width: 100,
        height: 100,
        scale: 3,
        position: {x: at.x, y: at.y},
        draw: () => {},
        setCollider: jest.fn(),
        getAnimationLabel: () => '',
      };
      sprites.push(sprite);
      return sprite.id;
    },
    getSpriteArray(arg) {
      const {id, name} = arg as {id?: number; name?: string};
      return sprites.filter(s =>
        id !== undefined ? s.id === id : s.name === name
      );
    },
    addEvent(type, args, callback) {
      events.push({type, args, callback: callback as () => void});
    },
  };
  return {sprites, events, library, p5};
}

describe('createUiCommands', () => {
  it('shows text at the location, unscaled, with a box to click', () => {
    const {sprites, library} = fakeWorld();
    createUiCommands(library).showText(
      'Healthy',
      {x: 200, y: 60},
      'heading',
      'result'
    );
    expect(sprites).toHaveLength(1);
    expect(sprites[0]).toMatchObject({
      name: 'result',
      position: {x: 200, y: 60},
      scale: 1,
      width: 70,
      __slab2Ui: 'text',
    });
    expect(sprites[0].setCollider).toHaveBeenCalledWith('rectangle');
  });

  it('changes text already on screen instead of adding a copy', () => {
    const {sprites, library} = fakeWorld();
    const ui = createUiCommands(library);
    ui.showText('Thinking', {x: 200, y: 60}, 'body', 'result');
    ui.showText('Sick', {x: 200, y: 300}, 'body', 'result');
    expect(sprites).toHaveLength(1);
    expect(sprites[0].position).toEqual({x: 200, y: 300});
  });

  it('draws the new words after a change', () => {
    const {library, p5} = fakeWorld();
    const ui = createUiCommands(library);
    ui.showText('Thinking', {x: 200, y: 60}, 'body', 'result');
    ui.showText('Sick', {x: 200, y: 60}, 'body', 'result');
    library.getSpriteArray({name: 'result'})[0].draw();
    expect(p5.text).toHaveBeenCalledWith('Sick', 0, 0);
  });

  it('sizes a button to its label, with a floor for short ones', () => {
    const {sprites, library} = fakeWorld();
    const ui = createUiCommands(library);
    ui.makeButton('Go', {x: 100, y: 100}, 'blue');
    ui.makeButton('About This App', {x: 300, y: 100}, 'blue');
    expect(sprites[0].width).toBe(100);
    expect(sprites[1].width).toBe(140 + 36);
  });

  it('runs a button handler for a click on that button', () => {
    const {events, library} = fakeWorld();
    const handler = jest.fn();
    createUiCommands(library).whenButtonClicked('Help Me!', handler);
    expect(events[0]).toMatchObject({
      type: 'whenclick',
      args: {sprite: {name: 'Help Me!'}},
    });
    events[0].callback();
    expect(handler).toHaveBeenCalled();
  });

  it('falls back to the center for an empty location socket', () => {
    const {sprites, library} = fakeWorld();
    createUiCommands(library).showText('Hi', null, 'body', 'greeting');
    expect(sprites[0].position).toEqual({x: 200, y: 200});
  });
});
