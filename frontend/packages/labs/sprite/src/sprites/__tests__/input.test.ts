import p5 from 'p5';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {preDraw} from '../lifecycle';
import type {SpriteP5} from '../types';

import {frame, frames, makeInstance} from './harness';

type Triple = [boolean, boolean, boolean];
type Quad = [boolean, boolean, boolean, boolean];

function keys(p: SpriteP5, key: number | string): Triple {
  return [p.keyDown(key), p.keyWentDown(key), p.keyWentUp(key)];
}

function mouse(p: SpriteP5, button?: string): Quad {
  return [
    p.mouseDown(button),
    p.mouseWentDown(button),
    p.mouseWentUp(button),
    p.mouseUp(button),
  ];
}

function key(type: 'keydown' | 'keyup', code: number): void {
  window.dispatchEvent(
    new KeyboardEvent(type, {keyCode: code, which: code, bubbles: true}),
  );
}

function canvasOf(p: SpriteP5): HTMLCanvasElement {
  return (p as unknown as {_curElement: {elt: HTMLCanvasElement}})._curElement
    .elt;
}

/** Lays the canvas out at the page origin: `client` square pixels shown, `layout` square pixels of layout. */
function layOut(p: SpriteP5, client = 400, layout = 400): void {
  const canvas = canvasOf(p);
  canvas.getBoundingClientRect = () =>
    ({
      left: 0,
      top: 0,
      width: client,
      height: client,
      right: client,
      bottom: client,
      x: 0,
      y: 0,
    }) as DOMRect;
  Object.defineProperty(canvas, 'offsetWidth', {value: layout});
  Object.defineProperty(canvas, 'offsetHeight', {value: layout});
}

function mouseEvent(
  type: 'mousedown' | 'mouseup' | 'mousemove',
  clientX: number,
  clientY: number,
  button = 0,
): void {
  window.dispatchEvent(
    new MouseEvent(type, {clientX, clientY, button, bubbles: true}),
  );
}

function touchEvent(
  type: 'touchstart' | 'touchend',
  touches: {clientX: number; clientY: number}[],
): void {
  const event = new Event(type);
  Object.defineProperty(event, 'touches', {value: touches});
  window.dispatchEvent(event);
}

const F = false;
const T = true;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('input.md: keys', () => {
  it('INP-14, INP-15, INP-16, INP-17: the press, hold and release sequence', async () => {
    const p = await makeInstance();
    await frame(p, () => {
      keys(p, 'left');
      key('keydown', 37);
      expect(keys(p, 'left')).toEqual([F, F, F]);
    });
    await frame(p, () => expect(keys(p, 'left')).toEqual([F, T, F]));
    await frame(p, () => expect(keys(p, 'left')).toEqual([T, F, F]));
    key('keyup', 37);
    await frame(p, () => expect(keys(p, 'left')).toEqual([F, F, T]));
    await frame(p, () => expect(keys(p, 'left')).toEqual([F, F, F]));
  });

  it('CMP-34, INP-17: a key held for one pre phase is never DOWN or WENT_UP', async () => {
    const p = await makeInstance();
    keys(p, 'up');
    key('keydown', 38);
    await frame(p);
    expect(keys(p, 'up')).toEqual([F, T, F]);
    key('keyup', 38);
    await frame(p);
    expect(keys(p, 'up')).toEqual([F, F, F]);
    await frame(p);
    expect(keys(p, 'up')).toEqual([F, F, F]);
  });

  it('CMP-35, INP-17: a press and release between frames is not seen', async () => {
    const p = await makeInstance();
    keys(p, 'up');
    key('keydown', 38);
    key('keyup', 38);
    await frame(p);
    expect(keys(p, 'up')).toEqual([F, F, F]);
  });

  it('CMP-35, INP-17: a release and re-press between frames leaves the key DOWN', async () => {
    const p = await makeInstance();
    keys(p, 'right');
    key('keydown', 39);
    await frames(p, 2);
    expect(keys(p, 'right')).toEqual([T, F, F]);
    key('keyup', 39);
    key('keydown', 39);
    await frame(p);
    expect(keys(p, 'right')).toEqual([T, F, F]);
  });

  it('CMP-36, INP-14, INP-17: a key already down when first queried is DOWN', async () => {
    const p = await makeInstance();
    key('keydown', 65);
    await frames(p, 2);
    expect(keys(p, 'a')).toEqual([T, F, F]);
    await frame(p);
    expect(keys(p, 'a')).toEqual([T, F, F]);
  });

  it('INP-8, INP-10, INP-11: names are upper-cased; unknown names are no key', async () => {
    const p = await makeInstance();
    key('keydown', 32);
    for (const name of ['space', 'SPACE', 'Space', ' ', 'spacebar']) {
      keys(p, name);
    }
    expect(
      ['space', 'SPACE', 'Space', ' ', 'spacebar'].map(n => p.keyDown(n)),
    ).toEqual([T, T, T, T, F]);
  });

  it('INP-9: a deprecated alias works and warns', async () => {
    const p = await makeInstance();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    key('keydown', 109);
    expect(p.keyDown('minut')).toBe(true);
    expect(warn).toHaveBeenCalledWith(
      'Key literal "MINUT" is deprecated and may be removed in a future version of p5.play. Please use "MINUS" instead.',
    );
    key('keydown', 188);
    expect(p.keyDown('Coma')).toBe(true);
    expect(warn).toHaveBeenLastCalledWith(
      'Key literal "COMA" is deprecated and may be removed in a future version of p5.play. Please use "COMMA" instead.',
    );
  });

  it('INP-8, INP-12: all names of a code share one state; numeric strings name no key', async () => {
    const p = await makeInstance();
    keys(p, 'left');
    key('keydown', 37);
    await frame(p);
    expect(keys(p, 37)).toEqual([F, T, F]);
    expect(keys(p, '37')).toEqual([F, F, F]);
    expect(keys(p, 'LEFT_ARROW')).toEqual([F, T, F]);
    expect(keys(p, 'LEFT')).toEqual([F, T, F]);
    expect(keys(p, 'left')).toEqual([F, T, F]);
  });

  it('INP-14: a name that resolves to no key is always up', async () => {
    const p = await makeInstance();
    expect(p.keyDown('bogus')).toBe(false);
    key('keydown', 0);
    await frame(p);
    expect(keys(p, 'bogus')).toEqual([F, F, F]);
  });

  it('INP-10: the alias table', async () => {
    const p = await makeInstance();
    const table: [string, number][] = [
      ['BACKSPACE', 8],
      ['TAB', 9],
      ['ENTER', 13],
      ['SHIFT', 16],
      ['CTRL', 17],
      ['ALT', 18],
      ['PAUSE', 19],
      ['CAPS_LOCK', 20],
      ['ESC', 27],
      ['SPACE', 32],
      [' ', 32],
      ['PAGE_UP', 33],
      ['PAGE_DOWN', 34],
      ['END', 35],
      ['HOME', 36],
      ['LEFT_ARROW', 37],
      ['LEFT', 37],
      ['UP_ARROW', 38],
      ['UP', 38],
      ['RIGHT_ARROW', 39],
      ['RIGHT', 39],
      ['DOWN_ARROW', 40],
      ['DOWN', 40],
      ['INSERT', 45],
      ['DELETE', 46],
      ['0', 48],
      ['8', 56],
      ['9', 57],
      ['A', 65],
      ['B', 66],
      ['Z', 90],
      ['0NUMPAD', 96],
      ['5NUMPAD', 101],
      ['9NUMPAD', 105],
      ['MULTIPLY', 106],
      ['PLUS', 107],
      ['MINUS', 109],
      ['DOT', 110],
      ['SLASH1', 111],
      ['F1', 112],
      ['F10', 121],
      ['F12', 123],
      ['EQUAL', 187],
      ['COMMA', 188],
      ['SLASH', 191],
      ['BACKSLASH', 220],
    ];
    for (const [name, code] of table) {
      key('keydown', code);
      expect([name, p.keyDown(name)]).toEqual([name, true]);
      key('keyup', code);
      expect([name, p.keyDown(code)]).toEqual([name, true]);
    }
    for (const name of ['F13', '10NUMPAD', 'AA', '']) {
      expect([name, p.keyDown(name)]).toEqual([name, false]);
    }
  });

  it('INP-11: the Sprite Lab dropdown names resolve', async () => {
    const p = await makeInstance();
    const names: [string, number][] = [
      ['up', 38],
      ['down', 40],
      ['left', 37],
      ['right', 39],
      ['space', 32],
    ];
    for (let i = 0; i < 26; i++) {
      names.push([String.fromCharCode(97 + i), 65 + i]);
    }
    for (const [name, code] of names) {
      key('keydown', code);
      expect([name, p.keyDown(name)]).toEqual([name, true]);
    }
  });

  it('INP-2, INP-3: auto-repeat is ignored; keyup removes', async () => {
    const p = await makeInstance();
    key('keydown', 38);
    key('keydown', 38);
    key('keyup', 38);
    expect(p.keyDown(38)).toBe(false);
  });

  it('INP-3: keyup of a key not down changes nothing', async () => {
    const p = await makeInstance();
    key('keyup', 38);
    expect(p.keyDown(38)).toBe(false);
  });

  it('INP-4: window blur empties the down set', async () => {
    const p = await makeInstance();
    keys(p, 'down');
    key('keydown', 40);
    await frames(p, 2);
    expect(keys(p, 'down')).toEqual([T, F, F]);
    window.dispatchEvent(new Event('blur'));
    await frame(p);
    expect(keys(p, 'down')).toEqual([F, F, T]);
  });

  it('INP-14: every name form reads the same state in a frame', async () => {
    const p = await makeInstance();
    keys(p, 'b');
    key('keydown', 66);
    await frame(p);
    expect([
      p.keyWentDown('b'),
      p.keyWentDown('B'),
      p.keyWentDown(66),
      p.keyDown('b'),
    ]).toEqual([T, T, T, F]);
  });

  it('INP-6: a script-made KeyboardEvent on window reaches the down set', async () => {
    const p = await makeInstance();
    const event = new KeyboardEvent('keydown', {
      keyCode: 37,
      which: 37,
      key: 'ArrowLeft',
      code: 'ArrowLeft',
      bubbles: true,
    });
    expect(event.which).toBe(37);
    window.dispatchEvent(event);
    expect(p.keyDown(37)).toBe(true);
    window.dispatchEvent(
      new KeyboardEvent('keyup', {
        keyCode: 37,
        which: 37,
        key: 'ArrowLeft',
        code: 'ArrowLeft',
        bubbles: true,
      }),
    );
    await frame(p);
    expect(p.keyDown(37)).toBe(false);
  });

  it('INP-6: the mobile-control path calls the key handlers with {which}', async () => {
    const p = await makeInstance();
    const handlers = p as unknown as {
      _onkeydown(e: {which: number}): void;
      _onkeyup(e: {which: number}): void;
    };
    handlers._onkeydown({which: 90});
    expect(p.keyDown(90)).toBe(true);
    handlers._onkeyup({which: 90});
    await frame(p);
    expect(keys(p, 90)).toEqual([F, F, T]);
  });

  it('INP-2: a real event reaches the down set once through both paths', async () => {
    const p = await makeInstance();
    key('keydown', 38);
    key('keyup', 38);
    expect(p.keyDown(38)).toBe(false);
  });

  it('CMP-42, INP-5, INP-7: each instance has its own down set, empty at creation', async () => {
    const a = await makeInstance();
    key('keydown', 37);
    const b = await makeInstance();
    expect(b.keyDown(37)).toBe(false);
    expect(a.keyDown(37)).toBe(true);
    key('keydown', 38);
    expect([a.keyDown(38), b.keyDown(38)]).toEqual([T, T]);
  });

  it('CMP-38, INP-18: tracked states and the down set outlive a rerun', async () => {
    const p = await makeInstance();
    keys(p, 'left');
    key('keydown', 37);
    await frames(p, 2);
    p.allSprites.removeSprites();
    await frame(p);
    expect(keys(p, 'left')).toEqual([T, F, F]);
  });

  it('INP-1: listeners stop when the instance is removed', async () => {
    const p = await makeInstance();
    p.remove();
    key('keydown', 37);
    expect(p.keyDown(37)).toBe(false);
  });

  it('LIF-10, L2: input bookkeeping runs before the sprite update and the camera', async () => {
    const p = await makeInstance();
    p.keyWentDown('space');
    const s = p.createSprite();
    const update = s.update.bind(s);
    let seen: [boolean, boolean] | undefined;
    s.update = () => {
      seen = [p.keyWentDown('space'), p.camera.active];
      update();
    };
    key('keydown', 32);
    preDraw(p as unknown as p5);
    expect(seen).toEqual([T, F]);
    expect(p.camera.active).toBe(true);
  });
});

describe('input.md: mouse', () => {
  it('INP-19, INP-20, INP-24, INP-25: the click sequence', async () => {
    const p = await makeInstance();
    layOut(p);
    await frame(p, () => expect(mouse(p)).toEqual([F, F, F, T]));
    mouseEvent('mousedown', 100, 50);
    expect([p.mouseX, p.mouseY, p.mouseButton, p.mouseIsPressed]).toEqual([
      100,
      50,
      'left',
      true,
    ]);
    expect(mouse(p)).toEqual([F, F, F, T]);
    await frame(p, () => {
      for (const button of [undefined, 'leftButton', 'left', p.LEFT]) {
        expect(mouse(p, button)).toEqual([F, T, F, F]);
      }
    });
    await frame(p, () => expect(mouse(p)).toEqual([T, F, F, F]));
    mouseEvent('mouseup', 100, 50);
    await frame(p, () => expect(mouse(p)).toEqual([F, F, T, F]));
    await frame(p, () => expect(mouse(p)).toEqual([F, F, F, T]));
    mouseEvent('mousedown', 500, 50);
    expect(p.mouseIsPressed).toBe(false);
    expect(p.mouseX).toBe(100);
  });

  it('INP-20, INP-23: right and center buttons', async () => {
    const p = await makeInstance();
    layOut(p);
    mouse(p, 'rightButton');
    mouse(p, 'left');
    mouseEvent('mousedown', 10, 10, 2);
    expect(p.mouseButton).toBe('right');
    await frame(p);
    expect(mouse(p, 'right')).toEqual([F, T, F, F]);
    expect(mouse(p, 'left')).toEqual([F, F, F, T]);
    mouseEvent('mouseup', 10, 10, 2);
    expect(p.mouseButton).toBe('right');
    mouseEvent('mousedown', 10, 10, 1);
    expect(p.mouseButton).toBe('center');
    expect(p.mouseDown('centerButton')).toBe(true);
  });

  it('INP-23: an unknown button is never pressed', async () => {
    const p = await makeInstance();
    layOut(p);
    mouse(p, 'middle');
    mouseEvent('mousedown', 10, 10);
    await frame(p);
    expect(mouse(p, 'middle')).toEqual([F, F, F, T]);
  });

  it('CMP-35, INP-17, INP-24: a click between frames is not seen', async () => {
    const p = await makeInstance();
    layOut(p);
    mouse(p);
    mouseEvent('mousedown', 10, 10);
    mouseEvent('mouseup', 10, 10);
    await frame(p);
    expect(mouse(p)).toEqual([F, F, F, T]);
  });

  it('INP-20: mouseup outside the canvas releases; mousemove only moves', async () => {
    const p = await makeInstance();
    layOut(p);
    mouseEvent('mousedown', 10, 10);
    mouseEvent('mousemove', 30, 40);
    expect([p.mouseX, p.mouseY, p.mouseIsPressed]).toEqual([30, 40, true]);
    mouseEvent('mousemove', 900, 40);
    expect(p.mouseX).toBe(30);
    mouseEvent('mouseup', 900, 900);
    expect(p.mouseIsPressed).toBe(false);
  });

  it('INP-21, INP-22: a touch presses the left button', async () => {
    const p = await makeInstance();
    layOut(p);
    mouse(p, 'left');
    mouse(p, 'right');
    touchEvent('touchstart', [
      {clientX: 700, clientY: 10},
      {clientX: 20, clientY: 30},
    ]);
    expect([p.touchIsDown, p.mouseX, p.mouseY]).toEqual([true, 20, 30]);
    await frame(p);
    expect(mouse(p, 'left')).toEqual([F, T, F, F]);
    expect(mouse(p, 'right')).toEqual([F, F, F, T]);
    touchEvent('touchend', [{clientX: 700, clientY: 10}]);
    expect(p.touchIsDown).toBe(false);
  });

  it('INP-21: touchend keeps the flag while an inside touch remains', async () => {
    const p = await makeInstance();
    layOut(p);
    touchEvent('touchstart', [{clientX: 700, clientY: 10}]);
    expect(p.touchIsDown).toBe(false);
    touchEvent('touchstart', [{clientX: 5, clientY: 5}]);
    touchEvent('touchend', [{clientX: 6, clientY: 6}]);
    expect(p.touchIsDown).toBe(true);
    touchEvent('touchend', []);
    expect(p.touchIsDown).toBe(false);
  });

  it('INP-22: an assigned touchIsDown presses left only', async () => {
    const p = await makeInstance();
    mouse(p, 'left');
    mouse(p, 'right');
    p.touchIsDown = true;
    await frame(p);
    expect(mouse(p, 'left')).toEqual([F, T, F, F]);
    expect(mouse(p, 'right')).toEqual([F, F, F, T]);
  });

  it('INP-19: CSS scaling is corrected', async () => {
    const p = await makeInstance();
    layOut(p, 800, 400);
    mouseEvent('mousedown', 401, 799);
    expect([p.mouseX, p.mouseY]).toEqual([201, 400]);
    mouseEvent('mousedown', 800, 10);
    expect(p.mouseX).toBe(201);
  });

  it("INP-19, INP-20: p5's own pointer handlers do not change the raw state", async () => {
    const p = await makeInstance();
    layOut(p);
    const handlers = p as unknown as Record<string, (e: unknown) => void>;
    const outside = {
      pointerId: 1,
      pointerType: 'mouse',
      buttons: 1,
      clientX: 500,
      clientY: 50,
      preventDefault() {},
    };
    handlers._onpointerdown(outside);
    handlers._onpointermove(outside);
    expect([p.mouseX, p.mouseIsPressed, p.mouseButton]).toEqual([
      0,
      false,
      'left',
    ]);
    handlers._onpointerup(outside);
    window.dispatchEvent(
      new MouseEvent('pointerdown', {clientX: 500, clientY: 60, buttons: 1}),
    );
    expect([p.mouseY, p.mouseIsPressed]).toEqual([0, false]);
    window.dispatchEvent(new MouseEvent('pointerup', {clientX: 500}));
  });

  it('INP-20: a window blur does not release the mouse', async () => {
    const p = await makeInstance();
    layOut(p);
    mouseEvent('mousedown', 10, 10);
    window.dispatchEvent(new Event('blur'));
    expect(p.mouseIsPressed).toBe(true);
    mouseEvent('mouseup', 10, 10);
    expect(p.mouseIsPressed).toBe(false);
  });

  it('INP-24: the initial state follows the button-pressed predicate', async () => {
    const p = await makeInstance();
    layOut(p);
    mouseEvent('mousedown', 10, 10);
    expect(mouse(p)).toEqual([T, F, F, F]);
    await frame(p);
    expect(mouse(p)).toEqual([T, F, F, F]);
  });

  it('CMP-34, INP-17, open question 1: a one-frame click never yields mouseWentUp', async () => {
    const p = await makeInstance();
    layOut(p);
    mouse(p);
    mouseEvent('mousedown', 10, 10);
    await frame(p);
    expect(mouse(p)).toEqual([F, T, F, F]);
    mouseEvent('mouseup', 10, 10);
    await frame(p);
    expect(mouse(p)).toEqual([F, F, F, T]);
  });

  it('INP-26, INP-27, INP-28: mousePressedOver reads the raw flags, any button', async () => {
    const p = await makeInstance();
    layOut(p);
    const s = p.createSprite(100, 100, 20, 20);
    expect(p.mouseIsOver(undefined)).toBe(false);
    mouse(p);
    mouseEvent('mousedown', 100, 100, 2);
    expect(p.mouseIsOver(s)).toBe(true);
    expect(p.mousePressedOver(s)).toBe(true);
    mouseEvent('mouseup', 100, 100, 2);
    expect(p.mousePressedOver(s)).toBe(false);
    mouseEvent('mousedown', 100, 100);
    let seen: boolean[] = [];
    await frame(p, () => {
      seen = [p.mouseWentDown('leftButton'), p.mousePressedOver(s)];
    });
    expect(seen).toEqual([T, T]);
    mouseEvent('mousemove', 300, 300);
    expect([p.mouseIsOver(s), p.mousePressedOver(s)]).toEqual([F, F]);
  });
});
