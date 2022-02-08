import sinon from 'sinon';
import ReactDOM from 'react-dom';
import {expect} from '../../util/reconfiguredChai';
import Javalab from '@cdo/apps/javalab/Javalab';
import project from '@cdo/apps/code-studio/initApp/project';
import {
  singleton as studioApp,
  stubStudioApp,
  restoreStudioApp
} from '@cdo/apps/StudioApp';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import {
  setAllSources,
  setDisableFinishButton
} from '@cdo/apps/javalab/javalabRedux';

describe('Javalab', () => {
  let javalab;
  let config;

  beforeEach(() => {
    javalab = new Javalab();
    stubRedux();
    registerReducers(commonReducers);
    sinon.stub(project, 'autosave');
    sinon.stub(ReactDOM, 'render');
    sinon.stub(getStore(), 'dispatch');
    stubStudioApp();
    javalab.studioApp_ = studioApp();
    config = {
      level: {},
      skin: {}
    };
  });

  afterEach(() => {
    sinon.restore();
    restoreRedux();
    restoreStudioApp();
  });

  describe('beforeUnload', () => {
    let eventStub;

    beforeEach(() => {
      eventStub = {
        preventDefault: sinon.stub(),
        returnValue: undefined
      };
    });

    it('triggers an autosave if there are unsaved changes', () => {
      sinon.stub(project, 'hasOwnerChangedProject').returns(true);

      javalab.beforeUnload(eventStub);

      expect(project.autosave).to.have.been.calledOnce;
      expect(eventStub.preventDefault).to.have.been.calledOnce;
      expect(eventStub.returnValue).to.equal('');

      project.hasOwnerChangedProject.restore();
    });
  });

  describe('finish button', () => {
    it('is disabled when reviewing code', () => {
      config.isCodeReviewing = true;
      javalab.init(config);
      expect(getStore().dispatch).to.have.been.calledWith(
        setDisableFinishButton(true)
      );
    });

    it('is disabled on readonly workspaces', () => {
      config.readonlyWorkspace = true;
      javalab.init(config);
      expect(getStore().dispatch).to.have.been.calledWith(
        setDisableFinishButton(true)
      );
    });

    it('is disabled when reviewing code on submittable levels', () => {
      config.isCodeReviewing = true;
      config.level.submittable = true;
      javalab.init(config);
      expect(getStore().dispatch).to.have.been.calledWith(
        setDisableFinishButton(true)
      );
    });

    it('is enabled on submitted levels', () => {
      config.readonlyWorkspace = true;
      config.level.submittable = true;
      javalab.init(config);
      expect(getStore().dispatch).to.have.been.calledWith(
        setDisableFinishButton(false)
      );
    });

    it('is enabled by default', () => {
      javalab.init(config);
      expect(getStore().dispatch).to.have.been.calledWith(
        setDisableFinishButton(false)
      );
    });
  });

  describe('populates sources', () => {
    it('with start_sources if there are any and there is no lastAttempt', () => {
      config.level = {
        startSources: {
          'File.java': {
            text: 'Some code',
            visible: true
          }
        }
      };

      javalab.init(config);

      expect(getStore().dispatch).to.have.been.calledWith(
        setAllSources(config.level.startSources)
      );
    });

    it('with lastAttempt if there is one', () => {
      config.level = {
        startSources: {
          'File.java': {
            text: 'Some code',
            visible: true
          }
        },
        lastAttempt: {
          'MyClass.java': {
            text: 'Some code 2',
            visible: true
          }
        }
      };
      javalab.init(config);

      expect(getStore().dispatch).to.have.been.calledWith(
        setAllSources(config.level.lastAttempt)
      );
    });

    it('does not populate if start sources are empty', () => {
      config.level = {
        startSources: {}
      };
      javalab.init(config);

      expect(getStore().getState().javalab.sources).to.not.equal(
        config.level.startSources
      );
    });
  });
});
