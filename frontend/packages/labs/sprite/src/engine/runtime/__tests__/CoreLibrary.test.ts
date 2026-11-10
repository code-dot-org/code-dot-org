import {beforeEach, describe, expect, it, vi} from 'vitest';

import {commands as spriteCommands} from '../commands/spriteCommands';
import {MAX_NUM_SPRITES, SPRITE_WARNING_BUFFER} from '../constants';
import type CoreLibrary from '../CoreLibrary';
import {NO_OP_HOST, type RuntimeHost} from '../RuntimeHost';
import type {Behavior, EventArgs, RuntimeSprite} from '../types';

import {getProp, makeLibrary, predefine} from './harness';

describe('SpriteLab Core Library', () => {
  let coreLibrary: CoreLibrary;
  const spriteName = 'spriteName';

  beforeEach(async () => {
    coreLibrary = await makeLibrary();
    predefine(coreLibrary, ['a', 'b', 'c', 'costume_label']);
  });

  function spriteOf(id: number | undefined): RuntimeSprite {
    return coreLibrary.nativeSpriteMap[id as number];
  }

  describe('addSprite', () => {
    it('returns an id', () => {
      expect(coreLibrary.addSprite()).toBe(0);
      expect(coreLibrary.addSprite()).toBe(1);
      expect(coreLibrary.addSprite()).toBe(2);
    });

    it('location defaults to (200,200)', () => {
      coreLibrary.addSprite({name: spriteName});
      expect(getProp(coreLibrary, {name: spriteName}, 'x')).toBe(200);
      expect(getProp(coreLibrary, {name: spriteName}, 'y')).toBe(200);
    });

    it('location picker works', () => {
      coreLibrary.addSprite({name: spriteName, location: {x: 123, y: 321}});
      expect(getProp(coreLibrary, {name: spriteName}, 'x')).toBe(123);
      expect(getProp(coreLibrary, {name: spriteName}, 'y')).toBe(400 - 321);
    });

    it('location function works', () => {
      const locationFunc = () => ({x: 123, y: 321});
      coreLibrary.addSprite({name: spriteName, location: locationFunc});
      expect(getProp(coreLibrary, {name: spriteName}, 'x')).toBe(123);
      expect(getProp(coreLibrary, {name: spriteName}, 'y')).toBe(400 - 321);
    });

    it('setting animation works', () => {
      coreLibrary.addSprite({name: spriteName, animation: 'costume_label'});
      expect(getProp(coreLibrary, {name: spriteName}, 'costume')).toBe(
        'costume_label',
      );
    });
  });

  describe('Sprite Map', () => {
    it('sprite ids increase starting at 0', () => {
      expect(coreLibrary.addSprite()).toBe(0);
      expect(coreLibrary.addSprite()).toBe(1);
      expect(coreLibrary.addSprite()).toBe(2);
      expect(coreLibrary.getSpriteIdsInUse()).toEqual(
        expect.arrayContaining([0, 1, 2]),
      );
      expect(coreLibrary.getSpriteIdsInUse()).toHaveLength(3);
    });

    it('deleting a sprite removes its id', () => {
      const id1 = coreLibrary.addSprite() as number;
      expect(coreLibrary.getSpriteIdsInUse()).toEqual([0]);

      coreLibrary.deleteSprite(id1);
      expect(coreLibrary.getSpriteIdsInUse()).toEqual([]);

      coreLibrary.addSprite();
      expect(coreLibrary.getSpriteIdsInUse()).toEqual([1]);
    });

    it('can get all animations in use', () => {
      coreLibrary.addSprite({animation: 'a'});
      coreLibrary.addSprite({animation: 'b'});
      coreLibrary.addSprite({animation: 'a'});

      expect([...coreLibrary.getAnimationsInUse()].sort()).toEqual(['a', 'b']);
    });

    it('sprite names are unique', () => {
      const sprite1 = spriteOf(coreLibrary.addSprite({name: spriteName}));
      expect(sprite1.name).toBe(spriteName);

      const sprite2 = spriteOf(coreLibrary.addSprite({name: spriteName}));
      expect(sprite1.name).toBeUndefined();
      expect(sprite2.name).toBe(spriteName);
    });
  });

  describe('getSpriteArray', () => {
    it('works with ids', () => {
      const id1 = coreLibrary.addSprite() as number;
      const id2 = coreLibrary.addSprite() as number;
      const id3 = coreLibrary.addSprite() as number;

      expect(coreLibrary.getSpriteArray({id: id1})).toEqual([spriteOf(id1)]);
      expect(coreLibrary.getSpriteArray({id: id2})).toEqual([spriteOf(id2)]);
      expect(coreLibrary.getSpriteArray({id: id3})).toEqual([spriteOf(id3)]);
    });

    it('works with animation groups', () => {
      const id1 = coreLibrary.addSprite({animation: 'a'});
      const id2 = coreLibrary.addSprite({animation: 'b'});
      const id3 = coreLibrary.addSprite({animation: 'a'});

      const as = coreLibrary.getSpriteArray({costume: 'a'});
      expect(as).toHaveLength(2);
      expect(as).toContain(spriteOf(id1));
      expect(as).toContain(spriteOf(id3));
      expect(coreLibrary.getSpriteArray({costume: 'b'})).toEqual([
        spriteOf(id2),
      ]);
    });

    it('works with sprite names', () => {
      const id1 = coreLibrary.addSprite({name: spriteName});
      const id2 = coreLibrary.addSprite({name: 'name2'});

      expect(coreLibrary.getSpriteArray({name: spriteName})).toEqual([
        spriteOf(id1),
      ]);
      expect(coreLibrary.getSpriteArray({name: 'name2'})).toEqual([
        spriteOf(id2),
      ]);

      const id3 = coreLibrary.addSprite({name: spriteName});
      expect(coreLibrary.getSpriteArray({name: spriteName})).toEqual([
        spriteOf(id3),
      ]);
    });
  });

  describe('The number of sprites created is capped by MAX_NUM_SPRITES', () => {
    it(`caps at ${MAX_NUM_SPRITES} sprites`, () => {
      for (let i = 0; i < 50000; i++) {
        coreLibrary.addSprite();
      }
      expect(coreLibrary.getNumberOfSprites()).toBe(MAX_NUM_SPRITES);
    });
  });

  describe('Workspace alert dispatch', () => {
    let displayWorkspaceAlert: ReturnType<
      typeof vi.fn<RuntimeHost['displayWorkspaceAlert']>
    >;

    beforeEach(async () => {
      displayWorkspaceAlert = vi.fn<RuntimeHost['displayWorkspaceAlert']>();
      coreLibrary = await makeLibrary({...NO_OP_HOST, displayWorkspaceAlert});
    });

    function expectOneSpriteLimitAlert(): void {
      expect(displayWorkspaceAlert).toHaveBeenCalledOnce();
      expect(displayWorkspaceAlert).toHaveBeenCalledWith(
        'warning',
        expect.stringContaining(String(MAX_NUM_SPRITES)),
        /* bottom */ true,
      );
    }

    it(`If ${
      MAX_NUM_SPRITES - SPRITE_WARNING_BUFFER
    } sprites or less are created, a workspace alert is NOT dispatched`, () => {
      for (let i = 0; i < MAX_NUM_SPRITES - SPRITE_WARNING_BUFFER; i++) {
        coreLibrary.addSprite();
      }
      expect(displayWorkspaceAlert).not.toHaveBeenCalled();
    });

    it(`When ${MAX_NUM_SPRITES} sprites is reached, a workspace alert was dispatched`, () => {
      for (let i = 0; i < MAX_NUM_SPRITES; i++) {
        coreLibrary.addSprite();
      }
      expectOneSpriteLimitAlert();
    });

    it(`Even when 100 more than ${MAX_NUM_SPRITES} sprites is reached, workspace alert is dispatched only once`, () => {
      for (let i = 0; i < MAX_NUM_SPRITES + 100; i++) {
        coreLibrary.addSprite();
      }
      expectOneSpriteLimitAlert();
    });
  });

  describe('Behaviors', () => {
    function logging(log: string[], name: string, label: string): Behavior {
      return {func: arg => log.push(`${label}${arg.id}`), name};
    }

    it('Can add behaviors for a single sprite', () => {
      const behaviorLog: string[] = [];
      const sprite = spriteOf(coreLibrary.addSprite());
      coreLibrary.addBehavior(sprite, {
        func: () => behaviorLog.push('behavior 1 ran'),
        name: 'behavior1',
      });
      coreLibrary.addBehavior(sprite, {
        func: () => behaviorLog.push('behavior 2 ran'),
        name: 'behavior2',
      });
      coreLibrary.runBehaviors();

      expect(behaviorLog).toEqual(['behavior 1 ran', 'behavior 2 ran']);
    });

    it('can add behaviors with multiple sprites', () => {
      const behaviorLog: string[] = [];
      const sprite1 = spriteOf(coreLibrary.addSprite());
      const sprite2 = spriteOf(coreLibrary.addSprite());
      const behavior = logging(
        behaviorLog,
        'behavior',
        'behavior ran for sprite ',
      );

      coreLibrary.addBehavior(sprite1, behavior);
      coreLibrary.addBehavior(sprite2, behavior);
      coreLibrary.runBehaviors();

      expect(behaviorLog).toEqual([
        'behavior ran for sprite 0',
        'behavior ran for sprite 1',
      ]);
    });

    it('can remove individual behaviors', () => {
      const behaviorLog: string[] = [];
      const sprite0 = spriteOf(coreLibrary.addSprite());
      const sprite1 = spriteOf(coreLibrary.addSprite());
      const behavior1 = logging(
        behaviorLog,
        'behavior1',
        'behavior 1 ran for sprite ',
      );
      const behavior2 = logging(
        behaviorLog,
        'behavior2',
        'behavior 2 ran for sprite ',
      );

      coreLibrary.addBehavior(sprite0, behavior1);
      coreLibrary.addBehavior(sprite1, behavior1);
      coreLibrary.addBehavior(sprite0, behavior2);
      coreLibrary.addBehavior(sprite1, behavior2);
      coreLibrary.runBehaviors();

      coreLibrary.removeBehavior(sprite0, behavior1);
      coreLibrary.removeBehavior(sprite1, behavior2);
      coreLibrary.runBehaviors();

      expect(behaviorLog).toEqual([
        // First tick:
        'behavior 1 ran for sprite 0',
        'behavior 1 ran for sprite 1',
        'behavior 2 ran for sprite 0',
        'behavior 2 ran for sprite 1',
        // Second tick:
        'behavior 1 ran for sprite 1',
        'behavior 2 ran for sprite 0',
      ]);
    });

    it('can remove all behaviors for a sprite', () => {
      const behaviorLog: string[] = [];
      const sprite0 = spriteOf(coreLibrary.addSprite());
      const sprite1 = spriteOf(coreLibrary.addSprite());
      const behavior1 = logging(
        behaviorLog,
        'behavior1',
        'behavior 1 ran for sprite ',
      );
      const behavior2 = logging(
        behaviorLog,
        'behavior2',
        'behavior 2 ran for sprite ',
      );

      coreLibrary.addBehavior(sprite0, behavior1);
      coreLibrary.addBehavior(sprite1, behavior1);
      coreLibrary.addBehavior(sprite0, behavior2);
      coreLibrary.addBehavior(sprite1, behavior2);
      coreLibrary.runBehaviors();

      coreLibrary.removeAllBehaviors(sprite0);
      coreLibrary.runBehaviors();

      expect(behaviorLog).toEqual([
        // First tick:
        'behavior 1 ran for sprite 0',
        'behavior 1 ran for sprite 1',
        'behavior 2 ran for sprite 0',
        'behavior 2 ran for sprite 1',
        // Second tick:
        'behavior 1 ran for sprite 1',
        'behavior 2 ran for sprite 1',
      ]);
    });
  });

  describe('Events', () => {
    it('Can run key events', () => {
      vi.spyOn(coreLibrary.p5, 'keyWentDown').mockReturnValue(true);
      vi.spyOn(coreLibrary.p5, 'keyDown').mockReturnValue(true);
      const eventLog: string[] = [];
      coreLibrary.addEvent('whenpress', {key: 'up'}, () =>
        eventLog.push('when up press ran'),
      );
      coreLibrary.addEvent('whilepress', {key: 'down'}, () =>
        eventLog.push('while down press ran'),
      );

      coreLibrary.runEvents();

      expect(eventLog).toEqual(['when up press ran', 'while down press ran']);
    });

    describe('Click events', () => {
      let eventLog: string[];
      let mouseWentDown: ReturnType<typeof vi.fn>;
      let mouseIsOver: ReturnType<typeof vi.fn>;
      let mousePressedOver: ReturnType<typeof vi.fn>;

      beforeEach(() => {
        eventLog = [];
        // Sinon stubs answer undefined until told otherwise.
        mouseWentDown = vi
          .spyOn(coreLibrary.p5, 'mouseWentDown')
          .mockReturnValue(undefined as unknown as boolean);
        mouseIsOver = vi
          .spyOn(coreLibrary.p5, 'mouseIsOver')
          .mockReturnValue(undefined as unknown as boolean);
        mousePressedOver = vi
          .spyOn(coreLibrary.p5, 'mousePressedOver')
          .mockReturnValue(undefined as unknown as boolean);
      });

      it('works with individual sprites', () => {
        mouseWentDown.mockReturnValue(true);
        mouseIsOver.mockReturnValue(true);
        mousePressedOver.mockReturnValue(true);
        coreLibrary.addSprite({name: spriteName});
        coreLibrary.addEvent('whenclick', {sprite: {name: spriteName}}, () =>
          eventLog.push('when click ran'),
        );
        coreLibrary.addEvent('whileclick', {sprite: {name: spriteName}}, () =>
          eventLog.push('while click ran'),
        );

        coreLibrary.runEvents();
        expect(eventLog).toEqual(['when click ran', 'while click ran']);
      });

      it('works with animation groups', () => {
        mouseWentDown.mockReturnValue(true);

        const id1 = coreLibrary.addSprite({animation: 'a'});
        const sprite1 = spriteOf(id1);
        const sprite2 = spriteOf(coreLibrary.addSprite({animation: 'b'}));
        const sprite3 = spriteOf(coreLibrary.addSprite({animation: 'a'}));

        const over = new Map([
          [sprite1, true],
          [sprite2, true],
          [sprite3, false],
        ]);
        mouseIsOver.mockImplementation((s: RuntimeSprite) => over.get(s));

        coreLibrary.addEvent(
          'whenclick',
          {sprite: {costume: 'a'}},
          (extraArgs: EventArgs) =>
            eventLog.push(extraArgs.clickedSprite + ' was clicked'),
        );

        coreLibrary.runEvents();
        expect(eventLog).toEqual([id1 + ' was clicked']);
      });

      it('calls the callback twice if you click overlapping sprites', () => {
        mouseWentDown.mockReturnValue(true);

        const id1 = coreLibrary.addSprite({animation: 'a'});
        const id2 = coreLibrary.addSprite({animation: 'a'});
        const over = new Set([spriteOf(id1), spriteOf(id2)]);
        mouseIsOver.mockImplementation((s: RuntimeSprite) => over.has(s));

        coreLibrary.addEvent(
          'whenclick',
          {sprite: {costume: 'a'}},
          (extraArgs: EventArgs) =>
            eventLog.push(extraArgs.clickedSprite + ' was clicked'),
        );

        coreLibrary.runEvents();
        expect(eventLog).toEqual([id1 + ' was clicked', id2 + ' was clicked']);
      });
    });

    describe('Collision Events with individual sprites', () => {
      let eventLog: string[];
      let overlap: ReturnType<typeof vi.fn>;
      const targetName = 'targetName';

      beforeEach(() => {
        eventLog = [];
        const sprite = spriteOf(coreLibrary.addSprite({name: spriteName}));
        coreLibrary.addSprite({name: targetName});
        // Sinon stubs answer undefined past the calls they were told about.
        overlap = vi
          .spyOn(sprite, 'overlap')
          .mockReturnValue(undefined as unknown as boolean);
      });

      const touching = {
        sprite1: {name: spriteName},
        sprite2: {name: targetName},
      };

      it('Can run collision events', () => {
        overlap.mockReturnValueOnce(true).mockReturnValueOnce(true);
        coreLibrary.addEvent('whentouch', touching, () =>
          eventLog.push('when touch ran'),
        );
        coreLibrary.addEvent('whiletouch', touching, () =>
          eventLog.push('while touch ran'),
        );

        coreLibrary.runEvents();
        expect(eventLog).toEqual(['when touch ran', 'while touch ran']);
      });

      it('while touching continues to call the callback', () => {
        overlap.mockReturnValueOnce(true).mockReturnValueOnce(true);
        coreLibrary.addEvent('whiletouch', touching, () =>
          eventLog.push('while touch ran'),
        );
        // First tick- expect the callback to be called
        coreLibrary.runEvents();
        expect(eventLog).toEqual(['while touch ran']);

        // Second tick- expect the callback to be called again
        coreLibrary.runEvents();
        expect(eventLog).toEqual(['while touch ran', 'while touch ran']);
      });

      it('when touching does not continue to call the callback for the same overlap', () => {
        overlap.mockReturnValueOnce(true).mockReturnValueOnce(true);
        coreLibrary.addEvent('whentouch', touching, () =>
          eventLog.push('when touch ran'),
        );
        // First tick- expect the callback to be called
        coreLibrary.runEvents();
        expect(eventLog).toEqual(['when touch ran']);

        // Second tick- expect the callback not to be called again
        coreLibrary.runEvents();
        expect(eventLog).toEqual(['when touch ran']);
      });

      it('when touching calls the callback again if the sprites stop and start touching', () => {
        overlap
          .mockReturnValueOnce(true)
          .mockReturnValueOnce(false)
          .mockReturnValueOnce(true);
        coreLibrary.addEvent('whentouch', touching, () =>
          eventLog.push('when touch ran'),
        );
        // First tick- expect the callback to be called
        coreLibrary.runEvents();
        expect(eventLog).toEqual(['when touch ran']);

        // Second tick- expect the callback not to be called (overlap returns false)
        coreLibrary.runEvents();
        expect(eventLog).toEqual(['when touch ran']);

        // Third tick- expect the callback to be called again
        coreLibrary.runEvents();
        expect(eventLog).toEqual(['when touch ran', 'when touch ran']);
      });
    });

    describe('Collision Events with animation groups', () => {
      let eventLog: string[];
      let sprite1: RuntimeSprite;
      let sprite2: RuntimeSprite;
      let target1: RuntimeSprite;
      let target2: RuntimeSprite;
      let touches1: Map<RuntimeSprite, boolean>;
      let touches2: Map<RuntimeSprite, boolean>;
      const aTouchesB = {sprite1: {costume: 'a'}, sprite2: {costume: 'b'}};
      const logAs = (label: string) => (extraArgs: EventArgs) =>
        eventLog.push(
          `${label}: ${extraArgs.subjectSprite}, ${extraArgs.objectSprite}`,
        );

      beforeEach(() => {
        eventLog = [];
        sprite1 = spriteOf(
          coreLibrary.addSprite({name: 'sprite1', animation: 'a'}),
        );
        sprite2 = spriteOf(
          coreLibrary.addSprite({name: 'sprite2', animation: 'a'}),
        );
        target1 = spriteOf(
          coreLibrary.addSprite({name: 'target1', animation: 'b'}),
        );
        target2 = spriteOf(
          coreLibrary.addSprite({name: 'target2', animation: 'b'}),
        );
        // As sinon's withArgs: an unlisted target answers undefined.
        touches1 = new Map();
        touches2 = new Map();
        vi.spyOn(sprite1, 'overlap').mockImplementation(
          target => touches1.get(target as RuntimeSprite) as boolean,
        );
        vi.spyOn(sprite2, 'overlap').mockImplementation(
          target => touches2.get(target as RuntimeSprite) as boolean,
        );
      });

      it('Calls the callback for each overlap - 1 sprite, 1 target', () => {
        // Only one sprite is touching one target
        touches1.set(target1, true).set(target2, false);
        touches2.set(target1, false).set(target2, false);

        coreLibrary.addEvent('whentouch', aTouchesB, logAs('when'));
        coreLibrary.addEvent('whiletouch', aTouchesB, logAs('while'));

        coreLibrary.runEvents();
        expect(eventLog).toEqual(['when: 0, 2', 'while: 0, 2']);
      });

      it('Calls the callback for each overlap - 1 sprite, 2 targets', () => {
        // One 'a' sprite is touching two 'b' sprites
        touches1.set(target1, true).set(target2, true);
        touches2.set(target1, false).set(target2, false);

        coreLibrary.addEvent('whentouch', aTouchesB, logAs('when'));

        coreLibrary.runEvents();
        expect(eventLog).toEqual(['when: 0, 2', 'when: 0, 3']);
      });

      it('Calls the callback for each overlap - 2 sprites, 1 target', () => {
        // Two 'a' sprites, each touching one 'b' sprite
        touches1.set(target1, true).set(target2, false);
        touches2.set(target1, false).set(target2, true);

        coreLibrary.addEvent('whentouch', aTouchesB, logAs('when'));

        coreLibrary.runEvents();
        expect(eventLog).toEqual(['when: 0, 2', 'when: 1, 3']);
      });

      it('Calls the callback for each overlap - 2 sprites, 2 targets', () => {
        // Two 'a' sprites, each touching two 'b' sprites
        touches1.set(target1, true).set(target2, true);
        touches2.set(target1, true).set(target2, true);

        coreLibrary.addEvent('whiletouch', aTouchesB, logAs('while'));

        coreLibrary.runEvents();
        expect(eventLog).toEqual([
          'while: 0, 2',
          'while: 0, 3',
          'while: 1, 2',
          'while: 1, 3',
        ]);
      });

      it('Calls the callback if costume group changes', () => {
        // 'a' sprite overlapping 'b' sprite
        touches1.set(target1, true);
        coreLibrary.addEvent('whentouch', aTouchesB, logAs('when'));
        coreLibrary.runEvents();
        expect(eventLog).toEqual(['when: 0, 2']);

        // 'b' sprite changes to 'c' sprite
        spriteCommands.setAnimation.apply(coreLibrary, [
          {name: 'target1'},
          'c',
        ]);
        coreLibrary.runEvents();
        // Event does not fire
        expect(eventLog).toEqual(['when: 0, 2']);

        // 'c' sprite changes back to 'b' sprite
        spriteCommands.setAnimation.apply(coreLibrary, [
          {name: 'target1'},
          'b',
        ]);
        coreLibrary.runEvents();
        // Event does fire again
        expect(eventLog).toEqual(['when: 0, 2', 'when: 0, 2']);
      });

      it('Collision events with the same costume group work', () => {
        // Two 'a' sprites, overlapping each other
        touches1.set(sprite1, false).set(sprite2, true);
        touches2.set(sprite1, true).set(sprite2, false);

        coreLibrary.addEvent(
          'whiletouch',
          {sprite1: {costume: 'a'}, sprite2: {costume: 'a'}},
          logAs('while'),
        );

        coreLibrary.runEvents();
        expect(eventLog).toEqual(['while: 0, 1', 'while: 1, 0']);
      });
    });
  });
});
