import sinon from 'sinon';
import {expect} from '../../util/reconfiguredChai';
import Javalab from '@cdo/apps/javalab/Javalab';
import project from '@cdo/apps/code-studio/initApp/project';

describe('Javalab', () => {
  let javalab;

  beforeEach(() => {
    javalab = new Javalab();
  });

  describe('beforeUnload', () => {
    let eventStub;

    beforeEach(() => {
      sinon.stub(project, 'autosave');
      eventStub = {
        preventDefault: sinon.stub(),
        returnValue: undefined
      };
    });

    afterEach(() => {
      project.autosave.restore();
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

  describe('autosave', () => {
    // things to test here:
    // writes to files and projects if there are changes
    // rename triggers save but not an additional file write
  });

  // other tests?
  // rename won't trigger until after save is clicked, even if autosave called
  //
});
