/* Tests for music/player/RandomSkipManager.js */

var assert = require('assert');
import RandomSkipManager from '@cdo/apps/music/player/RandomSkipManager';

describe('Music random skip manager tests', function() {
  it('nested test', function() {
    const randomSkipManager = new RandomSkipManager();

    randomSkipManager.init();

    assert.deepEqual(randomSkipManager.getSkipContext(), {
      insideRandom: false,
      skipSound: false
    });

    // prettier-ignore
    {
      // Override to play index 1.
      randomSkipManager.beginRandomContext(2, 1);

        assert.deepEqual(randomSkipManager.getSkipContext(), {
          insideRandom: true,
          skipSound: true
        });

        randomSkipManager.beginRandomContext(2, 1);

          assert.deepEqual(randomSkipManager.getSkipContext(), {
            insideRandom: true,
            skipSound: true
          });

          randomSkipManager.next();

          assert.deepEqual(randomSkipManager.getSkipContext(), {
            insideRandom: true,
            skipSound: true
          });

        randomSkipManager.endRandomContext();

        randomSkipManager.next();

        // This context will be played.

        assert.deepEqual(randomSkipManager.getSkipContext(), {
          insideRandom: true,
          skipSound: false
        });

        // Override to play index 1.
        randomSkipManager.beginRandomContext(2, 1);

          assert.deepEqual(randomSkipManager.getSkipContext(), {
            insideRandom: true,
            skipSound: true
          });

          randomSkipManager.next();

          // This context will be played.

          assert.deepEqual(randomSkipManager.getSkipContext(), {
            insideRandom: true,
            skipSound: false
          });

        randomSkipManager.endRandomContext();

      randomSkipManager.endRandomContext();
    }
  });
});
