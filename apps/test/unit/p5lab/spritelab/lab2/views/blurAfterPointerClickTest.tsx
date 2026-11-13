import React from 'react';

import {keepFocusOffAfterMousePress} from '@cdo/apps/p5lab/spritelab/lab2/views/blurAfterPointerClick';

describe('keepFocusOffAfterMousePress', () => {
  let elsewhere: HTMLButtonElement;
  let game: HTMLSpanElement;
  let inside: HTMLButtonElement;

  beforeEach(() => {
    document.body.innerHTML =
      '<button id="elsewhere">Elsewhere</button>' +
      '<div><span id="game">Game</span><button id="inside">Inside</button></div>';
    elsewhere = document.getElementById('elsewhere') as HTMLButtonElement;
    game = document.getElementById('game') as HTMLSpanElement;
    inside = document.getElementById('inside') as HTMLButtonElement;
    elsewhere.focus();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  // The handler reads only the press's target and cancels its default.
  const pressOn = (target: Element) => {
    const preventDefault = jest.fn();
    keepFocusOffAfterMousePress({
      target,
      preventDefault,
    } as unknown as React.MouseEvent<HTMLElement>);
    return preventDefault;
  };

  it('stops a mouse press from focusing the region, and takes focus off what had it', () => {
    expect(pressOn(game)).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(document.body);
  });

  it('leaves a press on a control inside the region alone', () => {
    expect(pressOn(inside)).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(elsewhere);
  });
});
