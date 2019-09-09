import ReactDOM from 'react-dom';
import sinon from 'sinon';
import {expect} from '../../util/configuredChai';
import SpriteLab from '@cdo/apps/p5lab/spritelab/SpriteLab';
import Sounds from '@cdo/apps/Sounds';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import {setIsRunning} from '@cdo/apps/redux/runState';
import reducers from '@cdo/apps/p5lab/reducers';
import {setExternalGlobals} from '../../util/testUtils';
import 'script-loader!@code-dot-org/p5.play/examples/lib/p5';
import 'script-loader!@code-dot-org/p5.play/lib/p5.play';

describe('SpriteLab', () => {
  setExternalGlobals();

  before(() => sinon.stub(ReactDOM, 'render'));
  after(() => ReactDOM.render.restore());

  beforeEach(stubRedux);
  afterEach(restoreRedux);

  describe('initialization flow', () => {
    let instance, container;

    beforeEach(() => {
      container = document.createElement('div');
      container.id = 'container';
      document.body.appendChild(container);
    });
    afterEach(() => document.body.removeChild(container));

    let studioApp;
    beforeEach(() => {
      registerReducers({...commonReducers, ...reducers});
      instance = new SpriteLab();
      studioApp = {
        setCheckForEmptyBlocks: sinon.spy(),
        showRateLimitAlert: sinon.spy(),
        setPageConstants: sinon.spy(),
        init: sinon.spy(),
        isUsingBlockly: () => false,
        loadLibraries: () => Promise.resolve()
      };
    });

    it('Must have studioApp injected first', () => {
      expect(() => instance.init({})).to.throw('P5Lab requires a StudioApp');
    });

    describe('After being injected with a studioApp instance', () => {
      let muteSpy;
      beforeEach(() => {
        instance.injectStudioApp(studioApp);
        registerReducers({...commonReducers, ...reducers});
        instance.areAnimationsReady_ = sinon.stub().returns(true);
        instance.p5Wrapper = sinon.spy();
        instance.p5Wrapper.p5 = sinon.spy();
        instance.p5Wrapper.p5.allSprites = sinon.spy();
        instance.p5Wrapper.p5.allSprites.removeSprites = sinon.spy();
        instance.p5Wrapper.p5.redraw = sinon.spy();
        instance.JSInterpreter = sinon.spy();
        instance.JSInterpreter.deinitialize = sinon.spy();
        instance.initInterpreter = sinon.spy();
        instance.onP5Setup = sinon.spy();

        muteSpy = sinon.stub(Sounds.getSingleton(), 'muteURLs');
      });

      afterEach(() => {
        muteSpy.restore();
      });

      it('preview mutes sounds', () => {
        instance.preview();
        expect(muteSpy).to.have.been.calledOnce;
      });

      it('preview does not run if code is running', () => {
        getStore().dispatch(setIsRunning(true));
        instance.preview();
        expect(muteSpy).to.not.have.been.called;
      });
    });
  });
});
