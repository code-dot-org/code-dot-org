import ReactDOM from 'react-dom';

import {isOpen as isDebuggerOpen} from '@cdo/apps/lib/tools/jsdebugger/redux';
import GameLab from '@cdo/apps/p5lab/gamelab/GameLab';
import reducers from '@cdo/apps/p5lab/reducers';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import Sounds from '@cdo/apps/Sounds';

import {setExternalGlobals} from '../../util/testUtils';
import 'script-loader!@code-dot-org/p5.play/examples/lib/p5';
import 'script-loader!@code-dot-org/p5.play/lib/p5.play';

describe('GameLab', () => {
  setExternalGlobals();

  beforeAll(() => jest.spyOn(ReactDOM, 'render').mockImplementation());
  afterAll(() => ReactDOM.render.mockRestore());

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
        setPageConstants: jest.fn(),
        init: jest.fn(),
        isUsingBlockly: () => false,
        loadLibraries: () => Promise.resolve(),
        loadLibraryBlocks: jest.fn(),
      };
    });

    it('Must have studioApp injected first', () => {
      expect(() => instance.init({})).toThrow('GameLab requires a StudioApp');
    });

    describe('After being injected with a studioApp instance', () => {
      beforeEach(() => instance.injectStudioApp(studioApp));

      describe('Muting', () => {
        let unmuteSpy;
        beforeEach(() => {
          unmuteSpy = jest
            .spyOn(Sounds.getSingleton(), 'unmuteURLs')
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
          expect(Sounds.getSingleton().unmuteURLs).toHaveBeenCalledTimes(1);
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
          ).not.toThrow();
          expect(() => instance.init(config)).not.toThrow();
        });

        describe('the expandDebugger level option', () => {
          it('will leave the debugger closed when false', () => {
            expect(config.level.expandDebugger).not.toBe(true);
            instance.init(config);
            expect(isDebuggerOpen(getStore().getState())).toBe(false);
          });
          it('will open the debugger when true', () => {
            expect(isDebuggerOpen(getStore().getState())).toBe(false);
            instance.init({
              ...config,
              level: {
                ...config.level,
                expandDebugger: true,
              },
            });
            expect(isDebuggerOpen(getStore().getState())).toBe(true);
          });
        });
      });
    });
  });
});
