/** @file Tests for our johnny-five Piezo wrapper */
import {expect} from '../../../../util/configuredChai';
import sinon from 'sinon';
import five from '@code-dot-org/johnny-five';
import Piezo from '@cdo/apps/lib/kits/maker/Piezo';

describe('Piezo', function () {
  beforeEach(function () {
    // We stub five.Piezo's superclass to avoid calling any johnny-five
    // logic that requires a board.
    sinon.stub(five.Board, 'Component');
  });

  afterEach(function () {
    five.Board.Component.restore();
  });

  it('is a johnny-five Piezo component', function () {
    const piezo = new Piezo({
      controller: fakePiezoController
    });
    expect(piezo).to.be.an.instanceOf(five.Piezo);
  });

  describe('play()', function () {
    let piezo;

    beforeEach(function () {
      sinon.stub(five.Piezo.prototype, 'play');
      piezo = new Piezo({
        controller: fakePiezoController
      });
    });

    afterEach(function () {
      five.Piezo.prototype.play.restore();
    });

    it(`converts a song and tempo to the 'tune' format expected by five.Piezo`, function () {
      const song = [['C4', 1/2], ['D4', 1/2], ['E4', 1]];
      const tempo = 100;
      piezo.play(song, tempo);
      expect(five.Piezo.prototype.play).to.have.been.calledWith({song, tempo});
    });

    it(`assumes quarter notes if given a 1D note array`, function () {
      const song = ['C4', 'D4', 'E4'];
      const tempo = 100;
      piezo.play(song, tempo);
      expect(five.Piezo.prototype.play).to.have.been.calledWith({
        song: [
          ['C4', 1/4],
          ['D4', 1/4],
          ['E4', 1/4]
        ],
        tempo
      });
    });

    it(`passes a default tempo of 120bpm`, function () {
      const song = [['C4', 1/2], ['D4', 1/2], ['E4', 1]];
      piezo.play(song);
      expect(five.Piezo.prototype.play).to.have.been.calledWith({
        song,
        tempo: 120
      });
    });
  });
});

const fakePiezoController = {
  frequency: {
    value: function () {}
  },
  noTone: {
    value: function () {}
  }
};
