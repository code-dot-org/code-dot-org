import ReactDOM from 'react-dom';
import {expect} from '../../util/reconfiguredChai';
import GameLab from '@cdo/apps/p5lab/gamelab/GameLab';
import Sounds from '@cdo/apps/Sounds';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import reducers from '@cdo/apps/p5lab/reducers';
import {isOpen as isDebuggerOpen} from '@cdo/apps/lib/tools/jsdebugger/redux';
import {setExternalGlobals} from '../../util/testUtils';
import 'script-loader!@code-dot-org/p5.play/examples/lib/p5';
import 'script-loader!@code-dot-org/p5.play/lib/p5.play';

describe('GameLab', () => {
  setExternalGlobals();

  before(() => jest.spyOn(ReactDOM, 'render').mockClear().mockImplementation());
  after(() => ReactDOM.render.mockRestore());

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
          codeFunctions: {},
        },
        containerId: container.id,
      };
    });
    afterEach(() => document.body.removeChild(container));

    let studioApp;
    beforeEach(() => {
      registerReducers({...commonReducers, ...reducers});
      instance = new GameLab();
      studioApp = {
        setCheckForEmptyBlocks: jest.fn(),
        showRateLimitAlert: jest.fn(),
        setPageConstants: jest.fn(),
        init: jest.fn(),
        isUsingBlockly: () => false,
        loadLibraries: () => Promise.resolve(),
        loadLibraryBlocks: jest.fn(),
      };
    });

    it('Must have studioApp injected first', () => {
      expect(() => instance.init({})).to.throw('GameLab requires a StudioApp');
    });

    describe('After being injected with a studioApp instance', () => {
      beforeEach(() => instance.injectStudioApp(studioApp));

      describe('Muting', () => {
        let unmuteSpy;
        beforeEach(() => {
          unmuteSpy = jest
            .spyOn(Sounds.getSingleton(), 'unmuteURLs')
            .mockClear()
            .mockImplementation();
          instance.p5Wrapper.p5 = jest.fn();
          instance.p5Wrapper.p5.allSprites = jest.fn();
          instance.p5Wrapper.p5.allSprites.removeSprites = jest.fn();
          instance.p5Wrapper.p5.redraw = jest.fn();
          instance.p5Wrapper.p5.World = jest.fn();
          instance.p5Wrapper.setLoop = jest.fn();
          instance.p5Wrapper.startExecution = jest.fn();
          instance.initInterpreter = jest.fn();
          instance.onP5Setup = jest.fn();
          instance.reset = jest.fn();
          instance.studioApp_.clearAndAttachRuntimeAnnotations = jest.fn();
          instance.JSInterpreter = jest.fn();
          instance.JSInterpreter.deinitialize = jest.fn();
          instance.JSInterpreter.initialized = jest.fn();
        });

        afterEach(() => {
          unmuteSpy.mockRestore();
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
                editCode: false,
              },
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
                expandDebugger: true,
              },
            });
            expect(isDebuggerOpen(getStore().getState())).to.be.true;
          });
        });
      });
    });
  });
});
