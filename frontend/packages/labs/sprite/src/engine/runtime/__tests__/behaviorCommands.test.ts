import {beforeEach, describe, expect, it, vi} from 'vitest';

import {setMouse} from '../../../sprites/__tests__/harness';
import type {Animation} from '../../../sprites/animation';
import {commands as actionCommands} from '../commands/actionCommands';
import {commands as behaviorCommands} from '../commands/behaviorCommands';
import type CoreLibrary from '../CoreLibrary';
import type {RuntimeSprite} from '../types';

import {getProp, makeAnimation, makeLibrary, predefine} from './harness';

describe('Behavior Commands', () => {
  let coreLibrary: CoreLibrary;
  let animation: Animation;

  beforeEach(async () => {
    coreLibrary = await makeLibrary();
    animation = makeAnimation(coreLibrary.p5);
  });

  function spriteNamed(name: string): RuntimeSprite {
    return coreLibrary.getSpriteArray({name})[0];
  }

  function locationOf(name: string): [unknown, unknown] {
    return [
      getProp(coreLibrary, {name}, 'x'),
      getProp(coreLibrary, {name}, 'y'),
    ];
  }

  describe('draggableFunc', () => {
    let mousePressedOver: ReturnType<typeof vi.fn>;
    let mouseWentDown: ReturnType<typeof vi.fn>;
    let mouseWentUp: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      const none = undefined as unknown as boolean;
      mousePressedOver = vi
        .spyOn(coreLibrary.p5, 'mousePressedOver')
        .mockReturnValue(none);
      mouseWentDown = vi
        .spyOn(coreLibrary.p5, 'mouseWentDown')
        .mockReturnValue(none);
      mouseWentUp = vi
        .spyOn(coreLibrary.p5, 'mouseWentUp')
        .mockReturnValue(none);
    });

    function drag(name: string): void {
      behaviorCommands.draggableFunc.apply(coreLibrary)({name});
    }

    it('can drag a sprite', () => {
      coreLibrary.addSprite({name: 'sprite', location: {x: 200, y: 200}});
      const sprite = spriteNamed('sprite');
      mousePressedOver.mockReturnValue(true);
      mouseWentDown.mockReturnValue(true);
      drag('sprite');
      expect(sprite.dragging).toBe(true);
    });

    it('dragging moves the sprite to the mouse position', () => {
      coreLibrary.addSprite({name: 'sprite', location: {x: 200, y: 200}});
      const sprite = spriteNamed('sprite');
      setMouse(coreLibrary.p5, 200, 200);
      // First tick, press down on the sprite to start the drag.
      mousePressedOver.mockReturnValue(true);
      mouseWentDown.mockReturnValue(true);
      drag('sprite');
      expect(sprite.dragging).toBe(true);

      // Next tick, sprite moves to new mouse position.
      mouseWentDown.mockReturnValue(false);
      setMouse(coreLibrary.p5, 100, 100);
      drag('sprite');

      expect(sprite.x).toBe(100);
      expect(sprite.y).toBe(100);
    });

    it('drag ends when mouse goes up', () => {
      coreLibrary.addSprite({name: 'sprite', location: {x: 200, y: 200}});
      const sprite = spriteNamed('sprite');
      setMouse(coreLibrary.p5, 200, 200);
      // First tick, press down on the sprite to start the drag.
      mousePressedOver.mockReturnValue(true);
      mouseWentDown.mockReturnValue(true);
      drag('sprite');
      expect(sprite.dragging).toBe(true);

      // Next tick, mouse went up, so sprite moves to new mouse position
      // and drag ends.
      mouseWentDown.mockReturnValue(false);
      mouseWentUp.mockReturnValue(true);
      setMouse(coreLibrary.p5, 100, 100);
      drag('sprite');
      expect(sprite.x).toBe(100);
      expect(sprite.y).toBe(100);
      expect(sprite.dragging).toBe(false);
    });

    it('only drags the top sprite', () => {
      coreLibrary.addSprite({name: 'bottom', location: {x: 200, y: 200}});
      const bottom = spriteNamed('bottom');
      coreLibrary.addSprite({name: 'top', location: {x: 200, y: 200}});
      const top = spriteNamed('top');

      mousePressedOver.mockReturnValue(true);
      mouseWentDown.mockReturnValue(true);

      drag('top');
      expect(top.dragging).toBe(true);

      drag('bottom');
      expect(!!bottom.dragging).toBe(false);
    });
  });

  describe('followingTargetsFunc', () => {
    it('moves towards the closest target', () => {
      predefine(coreLibrary, ['target'], animation);
      coreLibrary.addSprite({name: 'subject', location: {x: 200, y: 200}});
      coreLibrary.addSprite({animation: 'target', location: {x: 125, y: 200}});
      coreLibrary.addSprite({animation: 'target', location: {x: 125, y: 125}});

      actionCommands.addTarget.apply(coreLibrary, [
        {name: 'subject'},
        'target',
        'follow',
      ]);

      behaviorCommands.followingTargetsFunc.apply(coreLibrary)({
        name: 'subject',
      });
      expect(locationOf('subject')).toEqual([195, 200]);
    });

    it('does not move if there are no targets', () => {
      coreLibrary.addSprite({name: 'subject', location: {x: 200, y: 200}});
      behaviorCommands.followingTargetsFunc.apply(coreLibrary)({
        name: 'subject',
      });
      expect(locationOf('subject')).toEqual([200, 200]);
    });
  });

  describe('avoidingTargetsFunc', () => {
    it('moves away from the average position of targets in range', () => {
      predefine(coreLibrary, ['target'], animation);
      coreLibrary.addSprite({name: 'subject', location: {x: 200, y: 200}});
      coreLibrary.addSprite({animation: 'target', location: {x: 150, y: 250}});
      coreLibrary.addSprite({animation: 'target', location: {x: 150, y: 150}});

      actionCommands.addTarget.apply(coreLibrary, [
        {name: 'subject'},
        'target',
        'avoid',
      ]);

      behaviorCommands.avoidingTargetsFunc.apply(coreLibrary)({
        name: 'subject',
      });
      expect(locationOf('subject')).toEqual([205, 200]);
    });

    it('does not move if there are no targets', () => {
      coreLibrary.addSprite({name: 'subject', location: {x: 200, y: 200}});
      behaviorCommands.avoidingTargetsFunc.apply(coreLibrary)({
        name: 'subject',
      });
      expect(locationOf('subject')).toEqual([200, 200]);
    });

    it('does not move if there are no targets in range', () => {
      predefine(coreLibrary, ['target'], animation);
      coreLibrary.addSprite({name: 'subject', location: {x: 200, y: 200}});
      coreLibrary.addSprite({animation: 'target', location: {x: 100, y: 100}});

      actionCommands.addTarget.apply(coreLibrary, [
        {name: 'subject'},
        'target',
        'avoid',
      ]);

      behaviorCommands.avoidingTargetsFunc.apply(coreLibrary)({
        name: 'subject',
      });
      expect(locationOf('subject')).toEqual([200, 200]);
    });
  });
});
