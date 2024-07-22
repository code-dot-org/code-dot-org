import _ from 'lodash';

import {
  Direction,
  BEHAVIOR_CHASE,
  BEHAVIOR_FLEE,
  BEHAVIOR_STOP,
  BEHAVIOR_WANDER,
  BEHAVIOR_WATCH_ACTOR,
  BEHAVIOR_GRID_ALIGNED,
} from '@cdo/apps/studio/constants';
// Studio needs to be imported before Item, or we get a TypeError: Cannot read
// properties of undefined (reading 'prototype').
// eslint-disable-next-line import/order
import Studio from '@cdo/apps/studio/studio';
import Item from '@cdo/apps/studio/Item';
import Sprite from '@cdo/apps/studio/Sprite';

describe('item', () => {
  beforeAll(() => {
    Studio.trackedBehavior = {};
    Studio.trackedBehavior.createdItems = {};
    Studio.SQUARE_SIZE = 50;
  });

  let item;

  describe('update', () => {
    describe('if destination is not yet set', () => {
      let targetSprite;
      let shuffleSpy;

      beforeEach(() => {
        item = new Item({});
        item.x = 100;
        item.y = 100;

        item.hasWall = jest.fn().mockReturnValue(false);

        targetSprite = new Sprite({});
        targetSprite.x = 200;
        targetSprite.y = 200;
        Studio.sprite = [targetSprite];
        item.targetSpriteIndex = 0;

        // the destination-setting logic uses _.shuffle to semi-randomize the
        // set of possible destinations before sorting them by score. We would
        // instead like to make it deterministic.
        shuffleSpy = jest
          .spyOn(_, 'shuffle')
          .mockClear()
          .mockImplementation(ar => ar);
      });

      afterEach(() => {
        _.shuffle.mockRestore();
      });

      it('sets an arbitrary direction on wander', () => {
        item.activity = BEHAVIOR_WANDER;

        // Since in the wander case all destinations are possible and all have a
        // score of one, whichever destination happens to be returned first will
        // be the coordinates to which we are headed. Since North happens to be
        // the first direction considered, North will be our final result.
        item.update();
        expect(shuffleSpy).toHaveBeenCalledTimes(1);

        const firstDestination = shuffleSpy.mock.calls[0][0][0];
        expect(firstDestination.gridX).toBe(2);
        expect(firstDestination.gridY).toBe(1);

        expect(item.dir).toBe(Direction.NORTH);
        expect(item.destGridX).toBe(2);
        expect(item.destGridY).toBe(1);
      });

      it('moves toward the target on chase', () => {
        item.activity = BEHAVIOR_CHASE;
        item.update();
        expect(item.dir).toBe(Direction.SOUTH);
        expect(item.destGridX).toBe(2);
        expect(item.destGridY).toBe(3);
      });

      it('runs from the target on flee', () => {
        item.activity = BEHAVIOR_FLEE;
        item.update();
        expect(item.dir).toBe(Direction.NORTH);
        expect(item.destGridX).toBe(2);
        expect(item.destGridY).toBe(1);
      });
    });

    describe('if destination is set', () => {
      beforeEach(() => {
        item = new Item({});
        item.x = 100;
        item.y = 100;
        item.destGridX = 200;
        item.destGridY = 200;
      });

      it('clears direction and destination on STOP', () => {
        item.activity = BEHAVIOR_STOP;
        item.update();
        expect(item.dir).toBe(Direction.NONE);
        expect(item.destGridX).toBeUndefined();
        expect(item.destGridY).toBeUndefined();
      });

      it('does nothing on WATCH_ACTOR or GRID_ALIGNED behaviors', () => {
        [BEHAVIOR_WATCH_ACTOR, BEHAVIOR_GRID_ALIGNED].forEach(behavior => {
          item.activity = behavior;
          item.update();
          expect(item.dir).toBeUndefined();
          expect(item.destGridX).toBe(200);
          expect(item.destGridY).toBe(200);
        });
      });
    });
  });

  describe('moveToNextPosition', () => {
    beforeEach(() => {
      item = new Item({});
      item.dir = Direction.EAST;
      item.x = 100;
      item.y = 100;
      item.speed = 5;
    });

    it('automatically moves in the set direction for movement behaviors', () => {
      [BEHAVIOR_CHASE, BEHAVIOR_FLEE, BEHAVIOR_WANDER].forEach(behavior => {
        item.activity = behavior;
        item.x = 100;
        item.moveToNextPosition();
        expect(item.x).toBe(105);
      });
    });

    it('does nothing for non-movement behaviors', () => {
      [BEHAVIOR_WATCH_ACTOR, BEHAVIOR_GRID_ALIGNED, BEHAVIOR_STOP].forEach(
        behavior => {
          item.activity = behavior;
          item.moveToNextPosition();
          expect(item.x).toBe(100);
        }
      );
    });
  });
});
