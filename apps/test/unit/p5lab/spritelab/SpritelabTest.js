import ReactDOM from 'react-dom';
import sinon from 'sinon';
import {expect} from '../../../util/deprecatedChai';
import SpriteLab from '@cdo/apps/p5lab/spritelab/SpriteLab';
import {
  addAnimation,
  editAnimation,
  setInitialAnimationList
} from '@cdo/apps/p5lab/redux/animationList';
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
import {setExternalGlobals} from '../../../util/testUtils';
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
        instance.onIsDebuggingSpritesChange = sinon.spy();
        instance.onStepSpeedChange = sinon.spy();

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

      it('includes backgrounds if there are none', () => {
        instance.isSpritelab = true;
        const initialAnimationList = {
          orderedKeys: ['2223bab1-0b27-4ad1-ad2e-7eb3dd0997c2'],
          propsByKey: {
            '2223bab1-0b27-4ad1-ad2e-7eb3dd0997c2': {
              name: 'bear',
              categories: ['animals']
            }
          }
        };
        const resultingAnimations = instance.loadAnyMissingDefaultAnimations(
          initialAnimationList
        );
        expect(resultingAnimations.orderedKeys.length).to.be.above(1);
      });

      it('does not modify the list if there is an animation in the backgrounds category', () => {
        instance.isSpritelab = true;
        const initialAnimationList = {
          orderedKeys: ['2223bab1-0b27-4ad1-ad2e-7eb3dd0997c2'],
          propsByKey: {
            '2223bab1-0b27-4ad1-ad2e-7eb3dd0997c2': {
              name: 'bear',
              categories: ['backgrounds']
            }
          }
        };
        const resultingAnimations = instance.loadAnyMissingDefaultAnimations(
          initialAnimationList
        );
        expect(resultingAnimations.orderedKeys.length).to.be.equal(1);
      });

      it('does not modify the list if there is an animation that matches a background', () => {
        instance.isSpritelab = true;
        const initialAnimationList = {
          orderedKeys: ['2223bab1-0b27-4ad1-ad2e-7eb3dd0997c2'],
          propsByKey: {
            '2223bab1-0b27-4ad1-ad2e-7eb3dd0997c2': {
              name: 'cave'
            }
          }
        };
        const resultingAnimations = instance.loadAnyMissingDefaultAnimations(
          initialAnimationList
        );
        expect(resultingAnimations.orderedKeys.length).to.be.equal(1);
      });

      describe('dispatching Blockly events', () => {
        let store, eventSpy, originalMainBlockSpace;
        beforeEach(() => {
          store = getStore();
          instance.setupReduxSubscribers(store);
          originalMainBlockSpace = Blockly.blockly_.mainBlockSpace;
          Blockly.blockly_.mainBlockSpace = {events: {dispatchEvent: () => {}}};
          eventSpy = sinon.stub(Blockly.mainBlockSpace.events, 'dispatchEvent');

          const initialAnimationList = {
            orderedKeys: ['key1'],
            propsByKey: {
              key1: {
                name: 'bear',
                sourceUrl:
                  'https://studio.code.org/api/v1/animation-library/spritelab/wAQoTe9lNAp19q.JxOmT6hRtv1GceGwp/category_animals/bear.png',
                frameSize: {
                  x: 254,
                  y: 333
                },
                frameCount: 1,
                looping: true,
                frameDelay: 2,
                version: 'wAQoTe9lNAp19q.JxOmT6hRtv1GceGwp',
                categories: ['animals']
              }
            }
          };
          store.dispatch(
            setInitialAnimationList(initialAnimationList, false, true)
          );
          eventSpy.reset();
        });

        afterEach(() => {
          eventSpy.restore();
          Blockly.blockly_.mainBlockSpace = originalMainBlockSpace;
        });

        it('dispatches event when animations are added', () => {
          const newAnimation = {
            name: 'purple bunny',
            sourceUrl:
              'https://studio.code.org/api/v1/animation-library/spritelab/kBiszeGACcLTGTrqmS4laPVQKPGQnDln/category_animals/bunny2.png',
            frameSize: {
              x: 152,
              y: 193
            },
            frameCount: 1,
            looping: true,
            frameDelay: 2,
            version: 'kBiszeGACcLTGTrqmS4laPVQKPGQnDln',
            categories: ['animals', 'characters']
          };

          store.dispatch(addAnimation('key2', newAnimation));
          expect(eventSpy).to.have.been.called;
        });

        it('dispatches event when animations change', () => {
          const newProps = {
            name: 'bear',
            sourceUrl:
              'https://studio.code.org/api/v1/animation-library/spritelab/kBiszeGACcLTGTrqmS4laPVQKPGQnDln/category_animals/bunny2.png',
            frameSize: {
              x: 254,
              y: 333
            },
            frameCount: 1,
            looping: true,
            frameDelay: 2,
            version: 'wAQoTe9lNAp19q.JxOmT6hRtv1GceGwp',
            categories: ['animals']
          };
          store.dispatch(editAnimation('key1', newProps));
          expect(eventSpy).to.have.been.called;
        });

        it('does not dispatch event when animations do not change', () => {
          // Dispatch an action so the subscriber gets called
          store.dispatch(setIsRunning(true));
          expect(eventSpy).not.to.have.beenCalled;
        });
      });
    });
  });
});
