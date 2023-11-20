import {expect, assert} from 'chai';
import Simple2Sequencer from '@cdo/apps/music/player/sequencer/Simple2Sequencer';
import MusicLibrary, {SoundData} from '@cdo/apps/music/player/MusicLibrary';
import Sinon, {SinonStubbedInstance} from 'sinon';
import {
  PatternEventValue,
  PatternEvent,
} from '@cdo/apps/music/player/interfaces/PatternEvent';
import {SoundEvent} from '@cdo/apps/music/player/interfaces/SoundEvent';
import {DEFAULT_PATTERN_LENGTH} from '@cdo/apps/music/constants';
import {
  ChordEventValue,
  ChordEvent,
} from '@cdo/apps/music/player/interfaces/ChordEvent';

const testSound: SoundData = {
  name: 'name',
  src: 'id',
  length: 1,
  type: 'bass',
};

describe('Simple2Sequencer', () => {
  let sequencer: Simple2Sequencer;
  let library: SinonStubbedInstance<MusicLibrary>;

  beforeEach(() => {
    library = Sinon.createStubInstance(MusicLibrary);
    library.getSoundForId.returns(testSound);

    sequencer = new Simple2Sequencer(library);
  });

  it('starts a new sequence at the given measure', () => {
    // Default sequence (start at 1, triggered = false)
    sequencer.newSequence();
    expect(sequencer.getLastMeasure()).to.equal(1);

    sequencer.startFunctionContext('when_run');
    sequencer.playSound('id', 'blockId');
    expect(sequencer.getPlaybackEvents()[0].triggered).to.be.false;

    sequencer.clear();

    // Triggered sequence
    sequencer.newSequence(10, true);
    expect(sequencer.getLastMeasure()).to.equal(10);

    sequencer.startFunctionContext('when_run');
    sequencer.playSound('id', 'blockId');
    expect(sequencer.getPlaybackEvents()[0].triggered).to.be.true;
  });

  it('adds a sound event', () => {
    sequencer.newSequence();
    sequencer.startFunctionContext('when_run');
    sequencer.playSound('id', 'blockId');

    Sinon.assert.calledWith(library.getSoundForId, 'id');

    const playbackEvents = sequencer.getPlaybackEvents();
    expect(playbackEvents.length).to.equal(1);

    const event = playbackEvents[0];
    expect(event.type).to.equal('sound');
    expect(event.id).to.equal('id');
    expect(event.blockId).to.equal('blockId');
    expect(event.when).to.equal(1);
    expect(event.length).to.equal(testSound.length);
    expect(event.triggered).to.be.false;
    expect((event as SoundEvent).soundType).to.equal(testSound.type);
  });

  it('adds a pattern event', () => {
    const patternValue: PatternEventValue = {
      kit: 'machine',
      events: [],
    };

    sequencer.newSequence();
    sequencer.startFunctionContext('when_run');
    sequencer.playPattern(patternValue, 'blockId');

    const playbackEvents = sequencer.getPlaybackEvents();
    expect(playbackEvents.length).to.equal(1);

    const event = playbackEvents[0];
    expect(event.type).to.equal('pattern');
    expect(event.id).to.equal(JSON.stringify(patternValue));
    expect(event.blockId).to.equal('blockId');
    expect(event.when).to.equal(1);
    expect(event.length).to.equal(DEFAULT_PATTERN_LENGTH);
    expect(event.triggered).to.be.false;
    expect((event as PatternEvent).value).to.equal(patternValue);
  });

  it('adds a chord event', () => {
    const chordValue: ChordEventValue = {
      instrument: 'piano',
      notes: [],
      playStyle: 'arpeggio-up',
    };

    sequencer.newSequence();
    sequencer.startFunctionContext('when_run');
    sequencer.playChord(chordValue, 'blockId');

    const playbackEvents = sequencer.getPlaybackEvents();
    expect(playbackEvents.length).to.equal(1);

    const event = playbackEvents[0];
    expect(event.type).to.equal('chord');
    expect(event.id).to.equal(JSON.stringify(chordValue));
    expect(event.blockId).to.equal('blockId');
    expect(event.when).to.equal(1);
    expect(event.length).to.equal(DEFAULT_PATTERN_LENGTH);
    expect(event.triggered).to.be.false;
    expect((event as ChordEvent).value).to.equal(chordValue);
  });

  it('nests together and sequential events correctly', () => {
    sequencer.newSequence();
    sequencer.startFunctionContext('when_run');

    // Preserve indentation
    // prettier-ignore
    {
      sequencer.playSequential();
        assert(sequencer.getLastMeasure() === 1);
        sequencer.rest(2);
        assert(sequencer.getLastMeasure() === 3);
        sequencer.rest(3);
        assert(sequencer.getLastMeasure() === 6);
        sequencer.playTogether();
          assert(sequencer.getLastMeasure() === 6);
          sequencer.rest(2);
          assert(sequencer.getLastMeasure() === 6);
          sequencer.rest(3);
          assert(sequencer.getLastMeasure() === 6);
          sequencer.playSequential();
            assert(sequencer.getLastMeasure() === 6);
            sequencer.rest(2);
            assert(sequencer.getLastMeasure() === 8);
            sequencer.rest(3);
            assert(sequencer.getLastMeasure() === 11);
          sequencer.endSequential();
        sequencer.endTogether();
        assert(sequencer.getLastMeasure() === 11);
      sequencer.endSequential();
    }
  });

  it('nests functions correctly', () => {
    sequencer.newSequence();
    sequencer.playSequential();

    // Preserve indentation
    // prettier-ignore
    {
      sequencer.startFunctionContext('first');
        const first = sequencer.getOrderedFunctions()[0];
        expect(sequencer.getOrderedFunctions().length).to.equal(1);
        expect(first.startMeasure).to.equal(1);
        expect(first.endMeasure).to.equal(1);

        // Play two sequential one measure events
        sequencer.playSound('id', 'blockId');
        sequencer.playSound('id', 'blockId');

        expect(first.playbackEvents.length).to.equal(2);

          sequencer.startFunctionContext('second');
            const second = sequencer.getOrderedFunctions()[1];
            expect(sequencer.getOrderedFunctions().length).to.equal(2);
            // Second function should start at measure 3
            expect(second.startMeasure).to.equal(3);
            expect(second.endMeasure).to.equal(3);

            // Play one, 1-measure event
            sequencer.playSound('id', 'blockId');

            expect(second.playbackEvents.length).to.equal(1);

              sequencer.startFunctionContext('third');
                const third = sequencer.getOrderedFunctions()[2];
                expect(sequencer.getOrderedFunctions().length).to.equal(3);
                expect(third.startMeasure).to.equal(4);
                expect(third.endMeasure).to.equal(4);

                // Rest for 4 measures
                sequencer.rest(4);

                // Play two 1-measure sounds together
                sequencer.playTogether();
                  sequencer.playSound('id', 'blockId');
                  sequencer.playSound('id', 'blockId');
                sequencer.endTogether();

              sequencer.endFunctionContext();
              // End measure should now account for all sounds
              expect(third.endMeasure).to.equal(9);

            sequencer.playSound('id', 'blockId');
            sequencer.rest(6);

            expect(second.playbackEvents.length).to.equal(2);

          sequencer.endFunctionContext();
          // End measure should now account for all sounds
          expect(second.endMeasure).to.equal(16);

      sequencer.endFunctionContext();
      // End measure should now account for all sounds
      expect(first.endMeasure).to.equal(16);
    }
  });

  it('sets effects for the current function', () => {
    sequencer.newSequence();
    sequencer.startFunctionContext('when_run');
    sequencer.setEffect('filter', 'low');
    sequencer.setEffect('volume', 'medium');
    sequencer.playSound('id', 'blockId');

    const event = sequencer.getPlaybackEvents()[0];

    expect(event.effects).to.exist;
    expect(event.effects?.filter).to.equal('low');
    expect(event.effects?.volume).to.equal('medium');
  });

  it('maintains effects when entering a new function', () => {
    sequencer.newSequence();
    sequencer.startFunctionContext('when_run');
    sequencer.setEffect('filter', 'low');
    sequencer.playSound('id', 'blockId');

    const event = sequencer.getPlaybackEvents()[0];
    expect(event.effects?.filter).to.equal('low');

    sequencer.startFunctionContext('new function');
    sequencer.playSound('id', 'blockId');

    const newFunctionEvent =
      sequencer.getOrderedFunctions()[1].playbackEvents[0];
    expect(newFunctionEvent.effects).to.deep.equal({filter: 'low'});
  });

  it('nests random events correctly', () => {
    const getLastEvent = () =>
      sequencer.getPlaybackEvents()[sequencer.getPlaybackEvents().length - 1];

    sequencer.newSequence();
    sequencer.startFunctionContext('when_run');

    // Preserve indentation:
    // prettier-ignore
    {
      // Override to play index 1.
      sequencer.startRandom(2, 1);

        sequencer.playSound('id', 'blockId');
        assert.deepEqual(getLastEvent().skipContext, {
          insideRandom: true,
          skipSound: true,
        });

        sequencer.startRandom(2, 1);

          sequencer.playSound('id', 'blockId');
          assert.deepEqual(getLastEvent().skipContext, {
            insideRandom: true,
            skipSound: true
          });

          sequencer.nextRandom();

          sequencer.playSound('id', 'blockId');
          assert.deepEqual(getLastEvent().skipContext, {
            insideRandom: true,
            skipSound: true
          });

        sequencer.endRandom();

        sequencer.nextRandom();

        // This context will be played.

        sequencer.playSound('id', 'blockId');
        assert.deepEqual(getLastEvent().skipContext, {
          insideRandom: true,
          skipSound: false
        });

        // Override to play index 1.
        sequencer.startRandom(2, 1);

          sequencer.playSound('id', 'blockId');
          assert.deepEqual(getLastEvent().skipContext, {
            insideRandom: true,
            skipSound: true
          });

          sequencer.nextRandom();

          // This context will be played.

          sequencer.playSound('id', 'blockId');
          assert.deepEqual(getLastEvent().skipContext, {
            insideRandom: true,
            skipSound: false
          });

        sequencer.endRandom();

      sequencer.endRandom();
    }
  });

  it('returns playback events in the function order', () => {
    sequencer.newSequence();

    // Preserve indentation
    // prettier-ignore
    {
      sequencer.startFunctionContext('first');
        sequencer.playSound('1', 'blockId');
        sequencer.playSound('2', 'blockId');

          sequencer.startFunctionContext('second');
            sequencer.playSound('3', 'blockId');
            sequencer.playTogether();
              sequencer.playSound('4', 'blockId');
              sequencer.playSound('5', 'blockId');
            sequencer.endTogether();

              sequencer.startFunctionContext('third');
                sequencer.playSound('6', 'blockId');
              sequencer.endFunctionContext();

            sequencer.playSound('7', 'blockId');
            sequencer.playSound('8', 'blockId');
          sequencer.endFunctionContext();

        sequencer.playSound('9', 'blockId');
      sequencer.endFunctionContext();
    }

    expect(sequencer.getPlaybackEvents().map(event => event.id)).to.deep.equal([
      // first function
      '1',
      '2',
      '9',
      // second function
      '3',
      '4',
      '5',
      '7',
      '8',
      // third function
      '6',
    ]);
  });
});
