import sinon from 'sinon';
import {expect} from '../../../util/reconfiguredChai';
import Spritelab from '@cdo/apps/gamelab/spritelab/Spritelab';
import Sounds from '@cdo/apps/Sounds';

describe('Spritelab Preview', () => {
  let gamelab, muteSpy;
  beforeEach(function() {
    gamelab = sinon.spy();
    gamelab.areAnimationsReady_ = sinon.stub().returns(true);
    gamelab.gameLabP5 = sinon.spy();
    gamelab.gameLabP5.p5 = sinon.spy();
    gamelab.gameLabP5.p5.allSprites = sinon.spy();
    gamelab.gameLabP5.p5.allSprites.removeSprites = sinon.spy();
    gamelab.gameLabP5.p5.redraw = sinon.spy();
    gamelab.JSInterpreter = sinon.spy();
    gamelab.JSInterpreter.deinitialize = sinon.spy();
    gamelab.initInterpreter = sinon.spy();
    gamelab.onP5Setup = sinon.spy();

    muteSpy = sinon.stub(Sounds.getSingleton(), 'muteURLs');
  });

  afterEach(function() {
    muteSpy.restore();
  });
  it('Mutes sounds', () => {
    let spritelab = new Spritelab();
    spritelab.preview.apply(gamelab);

    expect(muteSpy).to.have.been.calledOnce;
  });
});
