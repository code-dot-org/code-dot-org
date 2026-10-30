import ReactDOM from 'react-dom';

import reducers from '@cdo/apps/p5lab/reducers';
import SpriteLab from '@cdo/apps/p5lab/spritelab/SpriteLab';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import {setIsRunning} from '@cdo/apps/redux/runState';
import Sounds from '@cdo/apps/Sounds';
import 'script-loader!@code-dot-org/p5.play/examples/lib/p5';
import 'script-loader!@code-dot-org/p5.play/lib/p5.play';
import {singleton as studioApp} from '@cdo/apps/StudioApp';

import setBlocklyGlobal from '../../../util/setupBlocklyGlobal';
import {setExternalGlobals} from '../../../util/testUtils';

const backgroundSprite = {
  orderedKeys: ['44c5937d-c5c0-4676-bd0c-f7a86e99dd98'],
  propsByKey: {
    '44c5937d-c5c0-4676-bd0c-f7a86e99dd98': {
      name: 'grid',
      sourceUrl:
        'https://studio.code.org/api/v1/animation-library/spritelab/nG_cj1NXQ56VOdqMbGXqKxKupa4bCoNQ/category_backgrounds/background_grid.png',
      categories: ['backgrounds'],
    },
  },
};

describe('SpriteLab', () => {
  setExternalGlobals();
  setBlocklyGlobal();

  beforeAll(() =>
    jest.spyOn(ReactDOM, 'render').mockClear().mockImplementation()
  );
  afterAll(() => ReactDOM.render.mockRestore());

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

    let mockStudioApp;
    beforeEach(() => {
      registerReducers({...commonReducers, ...reducers});
      instance = new SpriteLab();
      mockStudioApp = {
        setCheckForEmptyBlocks: jest.fn(),
        setPageConstants: jest.fn(),
        init: jest.fn(),
        isUsingBlockly: () => false,
        loadLibraries: () => Promise.resolve(),
      };
    });

    it('Must have studioApp injected first', () => {
      expect(() => instance.init({})).toThrow('P5Lab requires a StudioApp');
    });

    describe('After being injected with a studioApp instance', () => {
      let muteSpy;
      beforeEach(() => {
        instance.injectStudioApp(mockStudioApp);
        registerReducers({...commonReducers, ...reducers});
        instance.areAnimationsReady_ = jest.fn().mockReturnValue(true);
        instance.p5Wrapper = jest.fn();
        instance.p5Wrapper.p5 = jest.fn();
        instance.p5Wrapper.p5.allSprites = jest.fn();
        instance.p5Wrapper.p5.allSprites.removeSprites = jest.fn();
        instance.p5Wrapper.p5.redraw = jest.fn();
        instance.JSInterpreter = jest.fn();
        instance.JSInterpreter.deinitialize = jest.fn();
        instance.initInterpreter = jest.fn();
        instance.onP5Setup = jest.fn();
        instance.onIsDebuggingSpritesChange = jest.fn();
        instance.onStepSpeedChange = jest.fn();
        instance.level = {};

        muteSpy = jest
          .spyOn(Sounds.getSingleton(), 'muteURLs')
          .mockClear()
          .mockImplementation();
      });

      afterEach(() => {
        muteSpy.mockRestore();
      });

      it('preview mutes sounds', () => {
        instance.preview();
        expect(muteSpy).toHaveBeenCalledTimes(1);
      });

      it('preview does not run if code is running', () => {
        getStore().dispatch(setIsRunning(true));
        instance.preview();
        expect(muteSpy).not.toHaveBeenCalled();
      });

      it('includes backgrounds if there are none', () => {
        instance.isBlockly = true;
        const initialAnimationList = {
          orderedKeys: ['2223bab1-0b27-4ad1-ad2e-7eb3dd0997c2'],
          propsByKey: {
            '2223bab1-0b27-4ad1-ad2e-7eb3dd0997c2': {
              name: 'bear',
              categories: ['animals'],
            },
          },
        };
        const resultingAnimations = instance.loadAnyMissingDefaultAnimations(
          initialAnimationList,
          backgroundSprite
        );
        expect(resultingAnimations.orderedKeys.length).toBeGreaterThan(1);
      });

      it('does not modify the list if there is an animation in the backgrounds category', () => {
        instance.isBlockly = true;
        const initialAnimationList = {
          orderedKeys: ['2223bab1-0b27-4ad1-ad2e-7eb3dd0997c2'],
          propsByKey: {
            '2223bab1-0b27-4ad1-ad2e-7eb3dd0997c2': {
              name: 'bear',
              categories: ['backgrounds'],
            },
          },
        };
        const resultingAnimations = instance.loadAnyMissingDefaultAnimations(
          initialAnimationList,
          backgroundSprite
        );
        expect(resultingAnimations.orderedKeys.length).toBe(1);
      });

      it('does not modify the list if there is an animation that matches a background', () => {
        instance.isBlockly = true;
        const initialAnimationList = {
          orderedKeys: ['2223bab1-0b27-4ad1-ad2e-7eb3dd0997c2'],
          propsByKey: {
            '2223bab1-0b27-4ad1-ad2e-7eb3dd0997c2': {
              name: 'grid',
            },
          },
        };
        const resultingAnimations = instance.loadAnyMissingDefaultAnimations(
          initialAnimationList,
          backgroundSprite
        );
        expect(resultingAnimations.orderedKeys.length).toBe(1);
      });

      describe('reactToExecutionError', () => {
        let alertSpy;
        beforeEach(() => {
          alertSpy = jest
            .spyOn(studioApp(), 'displayWorkspaceAlert')
            .mockClear()
            .mockImplementation();
          jest
            .spyOn(instance, 'getMsg')
            .mockClear()
            .mockReturnValue({
              workspaceAlertError: () => 'translated string',
            });
        });

        afterEach(() => {
          alertSpy.mockRestore();
          instance.getMsg.mockRestore();
        });

        it('displays a workspace alert if there is an executionError message', () => {
          instance.reactToExecutionError('test string');
          expect(alertSpy).toHaveBeenCalledTimes(1);
        });

        it('does nothing if there is no executionError message', () => {
          instance.reactToExecutionError(undefined);
          expect(alertSpy).not.toHaveBeenCalled();
        });
      });
    });
  });
});
