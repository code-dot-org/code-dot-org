import React from 'react';
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
import javalab from '@cdo/apps/javalab/javalabRedux';

describe('Java Lab Editor Test', () => {
  let defaultProps, store, appOptions;

  beforeEach(() => {
    stubRedux();
    registerReducers({javalab});
    store = getStore();
    defaultProps = {
      onCommitCode: () => {}
    };
    appOptions = window.appOptions;
    window.appOptions = {level: {}};
  });

  afterEach(() => {
    restoreRedux();
    window.appOptions = appOptions;
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

    it('updates state on Rename save', () => {
      const editor = createWrapper();
      const oldFilename = 'MyClass.java'; // default filename
      const newFilename = 'NewFilename.java';

      // should have default file in redux
      expect(store.getState().javalab.sources[oldFilename]).to.not.be.undefined;

      const activateRenameBtn = editor.find('button').first();
      activateRenameBtn.invoke('onClick')();

      // first input should be file rename text input
      const renameInput = editor.find('input').first();
      renameInput.invoke('onChange')({target: {value: newFilename}});

      // save button not clicked, should not yet have changed filename in redux
      expect(store.getState().javalab.sources[newFilename]).to.be.undefined;
      expect(store.getState().javalab.sources[oldFilename]).to.not.be.undefined;

      // submit form, should trigger file rename
      const form = editor.find('form').first();
      // stub preventDefault function
      form.invoke('onSubmit')({preventDefault: () => {}});
      expect(store.getState().javalab.sources[newFilename]).to.not.be.undefined;
      expect(store.getState().javalab.sources[oldFilename]).to.be.undefined;
    });
  });
});
