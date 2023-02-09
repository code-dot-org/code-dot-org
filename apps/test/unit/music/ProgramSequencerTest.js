/* Tests for music/player/ProgramSequencer.js */

var assert = require('assert');
import ProgramSequencer from '@cdo/apps/music/player/ProgramSequencer';

describe('Music program sequencer tests', function() {
  it('nesting test', function() {
    const programSequencer = new ProgramSequencer();
    programSequencer.init();

    // prettier-ignore
    {
      programSequencer.playSequential();
        assert(programSequencer.getCurrentMeasure() === 1);
        programSequencer.updateMeasureForPlayByLength(2);
        assert(programSequencer.getCurrentMeasure() === 3);
        programSequencer.updateMeasureForPlayByLength(3);
        assert(programSequencer.getCurrentMeasure() === 6);
        programSequencer.playTogether();
          assert(programSequencer.getCurrentMeasure() === 6);
          programSequencer.updateMeasureForPlayByLength(2);
          assert(programSequencer.getCurrentMeasure() === 6);
          programSequencer.updateMeasureForPlayByLength(3);
          assert(programSequencer.getCurrentMeasure() === 6);
          programSequencer.playSequential();
            assert(programSequencer.getCurrentMeasure() === 6);
            programSequencer.updateMeasureForPlayByLength(2);
            assert(programSequencer.getCurrentMeasure() === 8);
            programSequencer.updateMeasureForPlayByLength(3);
            assert(programSequencer.getCurrentMeasure() === 11);
          programSequencer.endSequential();
        programSequencer.endTogether();
        assert(programSequencer.getCurrentMeasure() === 11);
      programSequencer.endSequential();
    }
  });
});
