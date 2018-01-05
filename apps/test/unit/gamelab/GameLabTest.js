import ReactDOM from 'react-dom';
import sinon from 'sinon';
import {expect} from '../../util/configuredChai';
import GameLab from '@cdo/apps/gamelab/GameLab';
import {getStore, registerReducers, stubRedux, restoreRedux} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import reducers from '@cdo/apps/gamelab/reducers';
import {isOpen as isDebuggerOpen} from '@cdo/apps/lib/tools/jsdebugger/redux';
import {setExternalGlobals} from '../../util/testUtils';
import "script-loader!@code-dot-org/p5.play/examples/lib/p5";
import "script-loader!@code-dot-org/p5.play/lib/p5.play";

describe("GameLab", () => {
  setExternalGlobals();

  before(() => sinon.stub(ReactDOM, 'render'));
  after(() => ReactDOM.render.restore());

  beforeEach(stubRedux);
  afterEach(restoreRedux);

  describe("initialization flow", () => {
    let instance, container, config;

    beforeEach(() => {
      container = document.createElement('div');
      container.id = 'container';
      document.body.appendChild(container);
      config = {
        channel: 'bar',
        baseUrl: 'foo',
        skin: {},
        level:{
          editCode: "foo",
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
        setCheckForEmptyBlocks: sinon.spy(),
        showRateLimitAlert: sinon.spy(),
        setPageConstants: sinon.spy(),
        init: sinon.spy(),
      };
    });


    it("Must have studioApp injected first", () => {
      expect(() => instance.init({})).to.throw("GameLab requires a StudioApp");
    });

    describe("After being injected with a studioApp instance", () => {
      beforeEach(() => instance.injectStudioApp(studioApp));

      describe("The init method", () => {
        it("requires droplet to be in the config", () => {
          expect(() => instance.init({level:{}}))
            .to.throw("Game Lab requires Droplet");
          expect(() => instance.init(config))
            .not.to.throw;
        });

        describe("the expandDebugger level option", () => {
          it("will leave the debugger closed when false", () => {
            expect(config.level.expandDebugger).not.to.be.true;
            instance.init(config);
            expect(isDebuggerOpen(getStore().getState())).to.be.false;
          });
          it("will open the debugger when true", () => {
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
