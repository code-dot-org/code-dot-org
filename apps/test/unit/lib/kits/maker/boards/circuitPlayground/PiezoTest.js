/** @file Tests for our johnny-five Piezo wrapper */
import five from '@code-dot-org/johnny-five';

import Piezo from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/Piezo';



describe('Piezo', function () {
  beforeEach(function () {
    // We stub five.Piezo's superclass to avoid calling any johnny-five
    // logic that requires a board.
    jest.spyOn(five.Board, 'Component').mockClear().mockImplementation();
  });

  afterEach(function () {
    five.Board.Component.mockRestore();
  });

  it('is a johnny-five Piezo component', function () {
    const piezo = new Piezo({
      controller: makeStubPiezoController(),
    });
    expect(piezo).toBeInstanceOf(five.Piezo);
  });

  ['play', 'playSong', 'playNotes'].forEach(methodUnderTest => {
    describe(`${methodUnderTest}()`, () => {
      let piezo;

      beforeEach(function () {
        jest.spyOn(five.Piezo.prototype, 'play').mockClear().mockImplementation();
        piezo = new Piezo({
          controller: makeStubPiezoController(),
        });
      });

      afterEach(function () {
        five.Piezo.prototype.play.mockRestore();
      });

      it(`converts a song and tempo to the 'tune' format expected by five.Piezo`, function () {
        const song = [
          ['C4', 1 / 2],
          ['D4', 1 / 2],
          ['E4', 1],
        ];
        const tempo = 100;
        piezo[methodUnderTest](song, tempo);
        expect(five.Piezo.prototype.play).toHaveBeenCalledWith({
          song,
          tempo,
        });
      });

      it(`assumes quarter notes if given a 1D note array`, function () {
        const song = ['C4', 'D4', 'E4'];
        const tempo = 100;
        piezo[methodUnderTest](song, tempo);
        expect(five.Piezo.prototype.play).toHaveBeenCalledWith({
          song: [
            ['C4', 1 / 4],
            ['D4', 1 / 4],
            ['E4', 1 / 4],
          ],
          tempo,
        });
      });

      it(`passes a default tempo of 120bpm`, function () {
        const song = [
          ['C4', 1 / 2],
          ['D4', 1 / 2],
          ['E4', 1],
        ];
        piezo[methodUnderTest](song);
        expect(five.Piezo.prototype.play).toHaveBeenCalledWith({
          song,
          tempo: 120,
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
      expect(controller.frequency.value).not.toHaveBeenCalled();
      piezo.note('A4', 100);
      expect(controller.frequency.value).toHaveBeenCalledTimes(1);
    });

    it('converts a note to a frequency correctly', () => {
      // Spot-check a few notes
      // A4 = 440Hz
      piezo.note('A4');
      expect(controller.frequency.value).toHaveBeenCalledWith(440);

      // C4 = 262Hz
      controller.frequency.value.mockReset();
      piezo.note('C4');
      expect(controller.frequency.value).toHaveBeenCalledWith(262);

      // C2 = 65Hz
      controller.frequency.value.mockReset();
      piezo.note('C2');
      expect(controller.frequency.value).toHaveBeenCalledWith(65);
    });

    it('passes the duration through untouched', () => {
      const duration = 1000 * Math.random();
      piezo.note('A4', duration);
      expect(controller.frequency.value).toHaveBeenCalledWith(440, duration);
    });
  });

  // These two methods should be identical in our implementation, so run them
  // through the same set of tests.
  ['stop', 'off'].forEach(methodUnderTest => {
    describe(`${methodUnderTest}()`, () => {
      beforeEach(() => {
        jest.useFakeTimers();
        controller = makeStubPiezoController();
        piezo = new Piezo({controller});
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('cancels frequency()', () => {
        // Start the tone
        piezo.frequency(440, 10000);
        expect(controller.frequency.value).toHaveBeenCalledTimes(1);
        expect(controller.noTone.value).not.toHaveBeenCalled();

        // Stop the tone
        piezo[methodUnderTest]();
        expect(controller.frequency.value).toHaveBeenCalledTimes(1);
        expect(controller.noTone.value).toHaveBeenCalledTimes(1);
      });

      it('cancels note()', () => {
        // Start the tone
        piezo.note('A4', 10000);
        expect(controller.frequency.value).toHaveBeenCalledTimes(1);
        expect(controller.noTone.value).not.toHaveBeenCalled();

        // Stop the tone
        piezo[methodUnderTest]();
        expect(controller.frequency.value).toHaveBeenCalledTimes(1);
        expect(controller.noTone.value).toHaveBeenCalledTimes(1);
      });

      it('cancels play()', () => {
        // Start the song
        const tempo = 100; // bpm - 600ms per beat, 150ms per quarter-note
        piezo.play(['C4', 'D4', 'E4'], tempo);
        expect(controller.frequency.value).toHaveBeenCalledTimes(1);

        // Let the second note play
        jest.advanceTimersByTime(150);
        expect(controller.frequency.value).toHaveBeenCalledTimes(2);

        // Stop the song
        piezo[methodUnderTest]();

        // Make sure the third note didn't play
        jest.advanceTimersByTime(150);
        expect(controller.frequency.value).toHaveBeenCalledTimes(2);
      });
    });
  });
});

function makeStubPiezoController() {
  return {
    frequency: {
      value: jest.fn(),
    },
    noTone: {
      value: jest.fn(),
    },
  };
}
