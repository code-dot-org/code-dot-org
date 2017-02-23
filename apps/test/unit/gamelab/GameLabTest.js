import $ from 'jquery';
import sinon from 'sinon';
import {expect} from '../../util/configuredChai';
import GameLab from '@cdo/apps/gamelab/GameLab';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import {getStore, registerReducers, stubRedux, restoreRedux} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import reducers from '@cdo/apps/gamelab/reducers';
import {setExternalGlobals} from '../../util/testUtils';

describe("GameLab", () => {
  before(setExternalGlobals);

  before(() => sinon.stub(studioApp, 'handleEditCode_', () => undefined));
  after(() => studioApp.handleEditCode_.restore());

  before(() => sinon.stub(studioApp, 'getCode', () => ''));
  after(() => studioApp.getCode.restore());

  beforeEach(stubRedux);
  afterEach(restoreRedux);

  describe("initialization flow", () => {
    let instance, container, config;

    beforeEach(() => {
      container = document.createElement('div');
      container.id = 'container';
      document.body.appendChild(container);
      config = {
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

    beforeEach(() => {
      registerReducers({...commonReducers, ...reducers});
      instance = new GameLab();
      studioApp.configure(config);
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
      });
    });
  });
});
