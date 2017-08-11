import {expect} from '../../util/configuredChai';
import Studio from '@cdo/apps/studio/studio';

import {
  Direction,
  BEHAVIOR_CHASE,
  BEHAVIOR_FLEE,
  BEHAVIOR_STOP,
  BEHAVIOR_WANDER,
  BEHAVIOR_WATCH_ACTOR,
  BEHAVIOR_GRID_ALIGNED
} from '@cdo/apps/studio/constants';

import Item from '@cdo/apps/studio/Item';

describe('item', () => {
  before(() => {
    Studio.trackedBehavior = {};
    Studio.trackedBehavior.createdItems = {};
  });

  let item;

  describe('update', () => {
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
        expect(item.dir).to.equal(Direction.NONE);
        expect(item.destGridX).to.be.undefined;
        expect(item.destGridY).to.be.undefined;
      });

      it('does nothing on WATCH_ACTOR or GRID_ALIGNED behaviors', () => {
        [
          BEHAVIOR_WATCH_ACTOR,
          BEHAVIOR_GRID_ALIGNED
        ].forEach(behavior => {
          item.activity = behavior;
          item.update();
          expect(item.dir).to.be.undefined;
          expect(item.destGridX).to.equal(200);
          expect(item.destGridY).to.equal(200);
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
      [
        BEHAVIOR_CHASE,
        BEHAVIOR_FLEE,
        BEHAVIOR_WANDER,
      ].forEach(behavior => {
        item.activity = behavior;
        item.x = 100;
        item.moveToNextPosition();
        expect(item.x).to.equal(105);
      });
    });

    it('does nothing for non-movement behaviors', () => {
      [
        BEHAVIOR_WATCH_ACTOR,
        BEHAVIOR_GRID_ALIGNED,
        BEHAVIOR_STOP
      ].forEach(behavior => {
        item.activity = behavior;
        item.moveToNextPosition();
        expect(item.x).to.equal(100);
      });
    });
  });
});

