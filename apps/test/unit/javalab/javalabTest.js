import sinon from 'sinon';
import {expect, assert} from '../../util/reconfiguredChai';
import Javalab from '@cdo/apps/javalab/Javalab';
import project from '@cdo/apps/code-studio/initApp/project';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import javalabRedux, {setEditorText} from '@cdo/apps/javalab/javalabRedux';
var filesApi = require('@cdo/apps/clientApi').files;

describe('Javalab', () => {
  let javalab;

  beforeEach(() => {
    javalab = new Javalab();
    sinon.stub(project, 'autosave');
  });

  afterEach(() => {
    project.autosave.restore();
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

  describe('getCodeAsync', () => {
    let store;

    beforeEach(() => {
      sinon.stub(filesApi, 'putFile');
      stubRedux();
      registerReducers({javalabRedux});
      store = getStore();
    });

    afterEach(() => {
      filesApi.putFile.restore();
      restoreRedux();
    });

    it('triggers file put if there are changes', () => {
      // set editor text
      store.dispatch(setEditorText('New Text'));

      // getCodeAsync is called on autosave/save
      javalab.getCodeAsync(
        () => {
          expect(filesApi.putFile).to.have.been.calledOnce;
        },
        () => {
          assert.fail('getCodeAsync failed');
        }
      );
    });

    it('does not trigger file put if there are no changes', () => {
      // getCodeAsync is called on autosave/save
      javalab.getCodeAsync(
        () => {
          // if there were no changes putFile should not be called
          expect(filesApi.putFile).to.not.have.been.called;
        },
        () => {
          assert.fail('getCodeAsync failed');
        }
      );
    });
  });
});
