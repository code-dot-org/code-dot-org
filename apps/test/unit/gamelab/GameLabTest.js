import ReactDOM from 'react-dom';
import sinon from 'sinon';
import {expect} from '../../util/configuredChai';
import GameLab from '@cdo/apps/p5lab/gamelab/GameLab';
import Sounds from '@cdo/apps/Sounds';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import reducers from '@cdo/apps/p5lab/reducers';
import {isOpen as isDebuggerOpen} from '@cdo/apps/lib/tools/jsdebugger/redux';
import {setExternalGlobals} from '../../util/testUtils';
import 'script-loader!@code-dot-org/p5.play/examples/lib/p5';
import 'script-loader!@code-dot-org/p5.play/lib/p5.play';

describe('GameLab', () => {
  setExternalGlobals();

  before(() => sinon.stub(ReactDOM, 'render'));
  after(() => ReactDOM.render.restore());

  beforeEach(stubRedux);
  afterEach(restoreRedux);

  describe('initialization flow', () => {
    let instance, container, config;

    beforeEach(() => {
      container = document.createElement('div');
      container.id = 'container';
      document.body.appendChild(container);
      config = {
        channel: 'bar',
        baseUrl: 'foo',
        skin: {},
        level: {
          editCode: 'foo',
          startInAnimationTab: true,
          codeFunctions: {}
        },
        containerId: container.id
      };
    });
    afterEach(() => document.body.removeChild(container));

    let studioApp;
    beforeEach(() => {
      registerReducers({...commonReducers, ...reducers});
      instance = new GameLab();
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
      beforeEach(() => instance.injectStudioApp(studioApp));

      describe('Muting', () => {
        let unmuteSpy;
        beforeEach(() => {
          unmuteSpy = sinon.stub(Sounds.getSingleton(), 'unmuteURLs');
          instance.p5Wrapper.p5 = sinon.spy();
          instance.p5Wrapper.p5.allSprites = sinon.spy();
          instance.p5Wrapper.p5.allSprites.removeSprites = sinon.spy();
          instance.p5Wrapper.p5.redraw = sinon.spy();
          instance.p5Wrapper.p5.World = sinon.spy();
          instance.p5Wrapper.setLoop = sinon.spy();
          instance.p5Wrapper.startExecution = sinon.spy();
          instance.initInterpreter = sinon.spy();
          instance.onP5Setup = sinon.spy();
          instance.reset = sinon.spy();
          instance.studioApp_.clearAndAttachRuntimeAnnotations = sinon.spy();
          instance.JSInterpreter = sinon.spy();
          instance.JSInterpreter.deinitialize = sinon.spy();
          instance.JSInterpreter.initialized = sinon.spy();
        });

        afterEach(() => {
          unmuteSpy.restore();
        });

        it('Execute unmutes URLs', () => {
          instance.execute();
          expect(Sounds.getSingleton().unmuteURLs).to.have.been.calledOnce;
        });
      });

      describe('The init method', () => {
        it('does not require droplet to be in the config', () => {
          expect(() =>
            instance.init({
              ...config,
              level: {
                ...config.level,
                editCode: false
              }
            })
          ).not.to.throw;
          expect(() => instance.init(config)).not.to.throw;
        });

        describe('the expandDebugger level option', () => {
          it('will leave the debugger closed when false', () => {
            expect(config.level.expandDebugger).not.to.be.true;
            instance.init(config);
            expect(isDebuggerOpen(getStore().getState())).to.be.false;
          });
          it('will open the debugger when true', () => {
            expect(isDebuggerOpen(getStore().getState())).to.be.false;
            instance.init({
              ...config,
              level: {
                ...config.level,
                expandDebugger: true
              }
            });
            expect(isDebuggerOpen(getStore().getState())).to.be.true;
          });
        });
      });
    });
  });
});
