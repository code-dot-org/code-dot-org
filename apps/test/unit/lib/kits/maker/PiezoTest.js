/** @file Tests for our johnny-five Piezo wrapper */
import {expect} from '../../../../util/configuredChai';
import sinon from 'sinon';
import five from 'johnny-five';
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
    it(`converts a song and tempo to the 'tune' format expected by five.Piezo`, function () {
      sinon.stub(five.Piezo.prototype, 'play');

      const piezo = new Piezo({
        controller: fakePiezoController
      });

      const song = [['C4', 1], ['D4', 1], ['E4', 1]];
      const tempo = 100;
      piezo.play(song, tempo);

      expect(five.Piezo.prototype.play).to.have.been.calledWith({song, tempo});

      five.Piezo.prototype.play.restore();
    });
  });
});

const fakePiezoController = {
  frequency: {
    value: function() {}
  },
  noTone: {
    value: function() {}
  }
};
