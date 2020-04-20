/** @file Tests for our johnny-five Piezo wrapper */
import {expect} from '../../../../../../util/deprecatedChai';
import sinon from 'sinon';
import five from '@code-dot-org/johnny-five';
import Piezo from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/Piezo';

describe('Piezo', function() {
  beforeEach(function() {
    // We stub five.Piezo's superclass to avoid calling any johnny-five
    // logic that requires a board.
    sinon.stub(five.Board, 'Component');
  });

  afterEach(function() {
    five.Board.Component.restore();
  });

  it('is a johnny-five Piezo component', function() {
    const piezo = new Piezo({
      controller: makeStubPiezoController()
    });
    expect(piezo).to.be.an.instanceOf(five.Piezo);
  });

  ['play', 'playSong', 'playNotes'].forEach(methodUnderTest => {
    describe(`${methodUnderTest}()`, () => {
      let piezo;

      beforeEach(function() {
        sinon.stub(five.Piezo.prototype, 'play');
        piezo = new Piezo({
          controller: makeStubPiezoController()
        });
      });

      afterEach(function() {
        five.Piezo.prototype.play.restore();
      });

      it(`converts a song and tempo to the 'tune' format expected by five.Piezo`, function() {
        const song = [['C4', 1 / 2], ['D4', 1 / 2], ['E4', 1]];
        const tempo = 100;
        piezo[methodUnderTest](song, tempo);
        expect(five.Piezo.prototype.play).to.have.been.calledWith({
          song,
          tempo
        });
      });

      it(`assumes quarter notes if given a 1D note array`, function() {
        const song = ['C4', 'D4', 'E4'];
        const tempo = 100;
        piezo[methodUnderTest](song, tempo);
        expect(five.Piezo.prototype.play).to.have.been.calledWith({
          song: [['C4', 1 / 4], ['D4', 1 / 4], ['E4', 1 / 4]],
          tempo
        });
      });

      it(`passes a default tempo of 120bpm`, function() {
        const song = [['C4', 1 / 2], ['D4', 1 / 2], ['E4', 1]];
        piezo[methodUnderTest](song);
        expect(five.Piezo.prototype.play).to.have.been.calledWith({
          song,
          tempo: 120
        });
      });
    });
  });

  describe('note()', () => {
    let piezo, controller;

    beforeEach(() => {
      controller = makeStubPiezoController();
      piezo = new Piezo({controller});
    });

    it('calls frequency() on the controller', () => {
      expect(controller.frequency.value).not.to.have.been.called;
      piezo.note('A4', 100);
      expect(controller.frequency.value).to.have.been.calledOnce;
    });

    it('converts a note to a frequency correctly', () => {
      // Spot-check a few notes
      // A4 = 440Hz
      piezo.note('A4');
      expect(controller.frequency.value).to.have.been.calledWith(440);

      // C4 = 262Hz
      controller.frequency.value.resetHistory();
      piezo.note('C4');
      expect(controller.frequency.value).to.have.been.calledWith(262);

      // C2 = 65Hz
      controller.frequency.value.resetHistory();
      piezo.note('C2');
      expect(controller.frequency.value).to.have.been.calledWith(65);
    });

    it('passes the duration through untouched', () => {
      const duration = 1000 * Math.random();
      piezo.note('A4', duration);
      expect(controller.frequency.value).to.have.been.calledWith(440, duration);
    });
  });

  // These two methods should be identical in our implementation, so run them
  // through the same set of tests.
  ['stop', 'off'].forEach(methodUnderTest => {
    describe(`${methodUnderTest}()`, () => {
      let clock, controller, piezo;

      beforeEach(() => {
        clock = sinon.useFakeTimers();
        controller = makeStubPiezoController();
        piezo = new Piezo({controller});
      });

      afterEach(() => {
        clock.restore();
      });

      it('cancels frequency()', () => {
        // Start the tone
        piezo.frequency(440, 10000);
        expect(controller.frequency.value).to.have.been.calledOnce;
        expect(controller.noTone.value).not.to.have.been.called;

        // Stop the tone
        piezo[methodUnderTest]();
        expect(controller.frequency.value).to.have.been.calledOnce;
        expect(controller.noTone.value).to.have.been.calledOnce;
      });

      it('cancels note()', () => {
        // Start the tone
        piezo.note('A4', 10000);
        expect(controller.frequency.value).to.have.been.calledOnce;
        expect(controller.noTone.value).not.to.have.been.called;

        // Stop the tone
        piezo[methodUnderTest]();
        expect(controller.frequency.value).to.have.been.calledOnce;
        expect(controller.noTone.value).to.have.been.calledOnce;
      });

      it('cancels play()', () => {
        // Start the song
        const tempo = 100; // bpm - 600ms per beat, 150ms per quarter-note
        piezo.play(['C4', 'D4', 'E4'], tempo);
        expect(controller.frequency.value).to.have.been.calledOnce;

        // Let the second note play
        clock.tick(150);
        expect(controller.frequency.value).to.have.been.calledTwice;

        // Stop the song
        piezo[methodUnderTest]();

        // Make sure the third note didn't play
        clock.tick(150);
        expect(controller.frequency.value).to.have.been.calledTwice;
      });
    });
  });
});

function makeStubPiezoController() {
  return {
    frequency: {
      value: sinon.spy()
    },
    noTone: {
      value: sinon.spy()
    }
  };
}
