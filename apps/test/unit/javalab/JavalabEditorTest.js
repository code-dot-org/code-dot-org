import React from 'react';
import sinon from 'sinon';
import {expect} from '../../util/reconfiguredChai';
import {mount} from 'enzyme';
import JavalabEditor from '@cdo/apps/javalab/JavalabEditor';
import {Provider} from 'react-redux';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
var filesApi = require('@cdo/apps/clientApi').files;
import project from '@cdo/apps/code-studio/initApp/project';
import javalab from '@cdo/apps/javalab/javalabRedux';

describe('Java Lab Editor Test', () => {
  let defaultProps, store;

  beforeEach(() => {
    stubRedux();
    registerReducers({javalab});
    store = getStore();
    sinon.stub(filesApi, 'putFile');
    sinon.stub(filesApi, 'renameFile');
    defaultProps = {
      onCommitCode: () => project.autosave()
    };
  });

  afterEach(() => {
    restoreRedux();
    filesApi.putFile.restore();
    filesApi.renameFile.restore();
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
    it('renames file after save clicked', () => {
      const editor = createWrapper();

      // find 'Rename' button and click it (enables rename)
      const activateRenameBtn = editor.find('.active-rename-button').at(0);
      expect(activateRenameBtn.contains('Rename')).to.be.true;
      activateRenameBtn.simulate('click');

      // rename input
      const renameFileInput = editor.find('.rename-file-input').at(0);
      renameFileInput.simulate('change', {target: {value: 'NewFilename.java'}});

      // calling autosave at this point should not trigger file put
      project.autosave();
      expect(filesApi.putFile).not.to.have.been.called;

      // submit form, should trigger file rename but not file put
      const form = editor.find('form').at(0);
      form.simulate('submit');
      expect(filesApi.renameFile).to.have.been.calledOnce;
      expect(filesApi.putFile).to.not.have.been.called;
    });
  });
});
