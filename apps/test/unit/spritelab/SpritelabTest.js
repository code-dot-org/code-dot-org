import sinon from 'sinon';
import {expect} from '../../util/reconfiguredChai';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import reducers from '@cdo/apps/p5lab/gamelab/reducers';
import {setIsRunning} from '@cdo/apps/redux/runState';
import Spritelab from '@cdo/apps/p5lab/spritelab/Spritelab';
import Sounds from '@cdo/apps/Sounds';

describe('Spritelab Preview', () => {
  beforeEach(stubRedux);
  afterEach(restoreRedux);
  let gamelab, muteSpy;
  beforeEach(function() {
    registerReducers({...commonReducers, ...reducers});
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
  it('Preview does not run if code is running', () => {
    let spritelab = new Spritelab();
    getStore().dispatch(setIsRunning(true));
    spritelab.preview.apply(gamelab);

    expect(muteSpy).to.not.have.been.called;
  });
});
