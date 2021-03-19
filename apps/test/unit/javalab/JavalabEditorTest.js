import React from 'react';
import sinon from 'sinon';
import {expect} from '../../util/reconfiguredChai';
import {mount} from 'enzyme';
import JavalabEditor from '@cdo/apps/javalab/JavalabEditor';
import JavalabFileManagement from '@cdo/apps/javalab/JavalabFileManagement';
import {Provider} from 'react-redux';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import javalab from '@cdo/apps/javalab/javalabRedux';

describe('Java Lab Editor Test', () => {
  let defaultProps, store;

  beforeEach(() => {
    stubRedux();
    registerReducers({javalab});
    store = getStore();
    sinon.stub(JavalabFileManagement, 'renameProjectFile');
    sinon.stub(JavalabFileManagement, 'onProjectChanged');
    defaultProps = {
      onCommitCode: () => {}
    };
  });

  afterEach(() => {
    restoreRedux();
    JavalabFileManagement.renameProjectFile.restore();
    JavalabFileManagement.onProjectChanged.restore();
  });

  const createWrapper = overrideProps => {
    const combinedProps = {...defaultProps, ...overrideProps};
    return mount(
      <Provider store={store}>
        <JavalabEditor {...combinedProps} />
      </Provider>
    );
  };

  describe('Rename', () => {
    it('Rename button changes to save button after it is clicked', () => {
      const editor = createWrapper();

      // find 'Rename' button and click it (enables rename)
      const activateRenameBtn = editor.find('button').first();
      expect(activateRenameBtn.contains('Rename')).to.be.true;
      activateRenameBtn.invoke('onClick')();

      // save button should now be second input (first is file name input)
      const submitBtn = editor.find('input').at(1);
      expect(submitBtn.prop('value')).to.equal('Save');
    });

    it('calls JavalabFileManagement functions and updates state on Rename save', () => {
      const editor = createWrapper();

      const activateRenameBtn = editor.find('button').first();
      activateRenameBtn.invoke('onClick')();

      // first input should be file rename text input
      const renameInput = editor.find('input').first();
      renameInput.invoke('onChange')({target: {value: 'NewFilename.java'}});

      // save button not clicked, should not yet have set project changed
      // or change filename in redux
      expect(JavalabFileManagement.onProjectChanged).to.not.have.been.called;
      expect(store.getState().javalab.filename).to.not.equal(
        'NewFilename.java'
      );

      // submit form, should trigger file rename
      const form = editor.find('form').first();
      // stub preventDefault function
      form.invoke('onSubmit')({preventDefault: () => {}});
      expect(JavalabFileManagement.renameProjectFile).to.have.been.calledOnce;
      // should have called project changed and updated redux
      expect(JavalabFileManagement.onProjectChanged).to.have.been.calledOnce;
      expect(store.getState().javalab.filename).to.equal('NewFilename.java');
    });
  });
});
