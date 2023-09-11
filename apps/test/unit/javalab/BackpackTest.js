import React from 'react';
import {expect, assert} from '../../util/reconfiguredChai';
import {mount} from 'enzyme';
import {
  registerReducers,
  __testing_stubRedux,
  __testing_restoreRedux,
} from '@cdo/apps/redux';
import javalab from '@cdo/apps/javalab/redux/javalabRedux';
import BackpackClientApi from '@cdo/apps/code-studio/components/backpack/BackpackClientApi';
import sinon from 'sinon';
import {UnconnectedBackpack as Backpack} from '@cdo/apps/javalab/Backpack';
import {DisplayTheme} from '@cdo/apps/javalab/DisplayTheme';
import {BackpackAPIContext} from '../../../src/javalab/BackpackAPIContext';

describe('Java Lab Backpack Test', () => {
  let defaultProps, backpackApiStub;

  beforeEach(() => {
    __testing_stubRedux();
    registerReducers({javalab});
    backpackApiStub = sinon.createStubInstance(BackpackClientApi);
    backpackApiStub.hasBackpack.returns(true);
    defaultProps = {
      displayTheme: DisplayTheme.DARK,
      isButtonDisabled: false,
      onImport: () => {},
      backpackEnabled: true,
      sources: {},
      validation: {},
    };
  });

  afterEach(() => {
    __testing_restoreRedux();
  });

  const renderWithProps = props => {
    return mount(
      <BackpackAPIContext.Provider value={backpackApiStub}>
        <Backpack {...{...defaultProps, ...props}} />
      </BackpackAPIContext.Provider>
    );
  };

  it('updates selected files correctly', () => {
    const wrapper = renderWithProps({});
    wrapper
      .instance()
      .handleFileCheckboxChange({target: {name: 'Class1.java', checked: true}});
    wrapper
      .instance()
      .handleFileCheckboxChange({target: {name: 'Class2.java', checked: true}});
    wrapper
      .instance()
      .handleFileCheckboxChange({target: {name: 'Class3.java', checked: true}});
    wrapper.instance().handleFileCheckboxChange({
      target: {name: 'Class1.java', checked: false},
    });
    const selectedFiles = wrapper.instance().state.selectedFiles;
    expect(selectedFiles.length).to.equal(2);
    expect(selectedFiles[0]).to.equal('Class2.java');
    expect(selectedFiles[1]).to.equal('Class3.java');
  });

  it('expand dropdown triggers getFileList', () => {
    const wrapper = renderWithProps({});
    const getFileListStub = sinon.stub(
      BackpackClientApi.prototype,
      'getFileList'
    );
    wrapper.instance().expandDropdown();
    expect(getFileListStub.calledOnce);
    getFileListStub.restore();
  });

  it('expand dropdown resets state correctly', () => {
    const wrapper = renderWithProps({});
    // set state to something that should be cleared by expandDropdown
    wrapper.instance().setState({
      dropdownOpen: false,
      backpackLoadError: true,
      selectedFiles: ['file1', 'file2'],
      backpackFilenames: ['file1', 'file2', 'file3'],
    });

    wrapper.instance().expandDropdown();
    const state = wrapper.instance().state;
    assert(state.dropdownOpen);
    assert.isFalse(state.backpackLoadError);
    expect(state.selectedFiles.length).to.equal(0);
    expect(state.backpackFilenames.length).to.equal(0);
  });

  it('import shows warning before overwriting files', () => {
    const otherProps = {
      sources: {file1: {isVisible: true}, file2: {isVisible: true}},
    };
    const wrapper = renderWithProps(otherProps);
    // set state to something that should be cleared by expandDropdown
    wrapper.instance().setState({
      dropdownOpen: true,
      backpackFilenames: ['file1', 'file2', 'file3'],
      selectedFiles: ['file1', 'file3'],
    });

    wrapper.instance().handleImport();

    const state = wrapper.instance().state;
    expect(state.openDialog).to.equal('IMPORT_WARNING');
  });

  it('import shows error if hidden file name is used', () => {
    const otherProps = {
      sources: {visibleFile: {isVisible: true}, hiddenFile: {isVisible: false}},
    };
    const wrapper = renderWithProps(otherProps);
    // set state to something that should be cleared by expandDropdown
    wrapper.instance().setState({
      dropdownOpen: true,
      backpackFilenames: ['visibleFile', 'hiddenFile', 'file3'],
      selectedFiles: ['hiddenFile', 'file3'],
    });

    wrapper.instance().handleImport();

    const state = wrapper.instance().state;
    expect(state.openDialog).to.equal('IMPORT_ERROR');
  });

  it('no dialog shown if there are no duplicate file names', () => {
    const wrapper = renderWithProps({});
    // set state to something that should be cleared by expandDropdown
    wrapper.instance().setState({
      dropdownOpen: true,
      backpackFilenames: ['file1', 'file2', 'file3'],
      selectedFiles: ['file2', 'file3'],
    });

    wrapper.instance().handleImport();

    const state = wrapper.instance().state;
    expect(state.openDialog).to.equal(null);
  });

  it('renders nothing if backpack is disabled', () => {
    const wrapper = renderWithProps({backpackEnabled: false});
    expect(wrapper.isEmptyRender()).to.be.true;
  });

  it('delete shows warning before deleting files', () => {
    const otherProps = {
      sources: {file1: {isVisible: true}, file2: {isVisible: true}},
    };
    const wrapper = renderWithProps(otherProps);
    wrapper.instance().setState({
      dropdownOpen: true,
      backpackFilenames: ['file1', 'file2', 'file3'],
      selectedFiles: ['file1', 'file3'],
    });

    wrapper.instance().confirmAndDeleteFiles();

    const state = wrapper.instance().state;
    expect(state.openDialog).to.equal('DELETE_CONFIRM');
  });

  it('dropdown and modal are closed if delete succeeds', () => {
    const otherProps = {
      sources: {file1: {isVisible: true}, file2: {isVisible: true}},
    };
    const wrapper = renderWithProps(otherProps);
    wrapper.instance().setState({
      dropdownOpen: true,
      backpackFilenames: ['file1', 'file2', 'file3'],
      selectedFiles: ['file1', 'file3'],
    });
    // set up delete files to call success callback
    backpackApiStub.deleteFiles.callsArg(2);

    // open modal
    wrapper.instance().confirmAndDeleteFiles();
    // click delete
    wrapper.instance().handleDelete();

    const state = wrapper.instance().state;
    expect(state.openDialog).to.equal(null);
  });

  it('Delete error modal is shown if delete fails', () => {
    const otherProps = {
      sources: {file1: {isVisible: true}, file2: {isVisible: true}},
    };
    const wrapper = renderWithProps(otherProps);
    wrapper.instance().setState({
      dropdownOpen: true,
      backpackFilenames: ['file1', 'file2', 'file3'],
      selectedFiles: ['file1', 'file3'],
    });
    // set up delete files to call failure callback
    backpackApiStub.deleteFiles.callsArgWith(1, null, ['file1', 'file3']);

    // open modal
    wrapper.instance().confirmAndDeleteFiles();
    // click delete
    wrapper.instance().handleDelete();

    const state = wrapper.instance().state;
    expect(state.openDialog).to.equal('DELETE_ERROR');
  });

  it('Deleted files are removed from dropdown on partial delete success', () => {
    const otherProps = {
      sources: {file1: {isVisible: true}, file2: {isVisible: true}},
    };
    const wrapper = renderWithProps(otherProps);
    wrapper.instance().setState({
      dropdownOpen: true,
      backpackFilenames: ['file1', 'file2', 'file3'],
      selectedFiles: ['file1', 'file3'],
    });
    // set up delete files to call failure callback where only file 1 failed to delete
    backpackApiStub.deleteFiles.callsArgWith(1, null, ['file1']);

    // open modal
    wrapper.instance().confirmAndDeleteFiles();
    // click delete
    wrapper.instance().handleDelete();

    const state = wrapper.instance().state;
    const selectedFiles = state.selectedFiles;
    // selected files should only contain the file that failed to delete (file1).
    expect(selectedFiles.length).to.equal(1);
    expect(selectedFiles[0]).to.equal('file1');
    // backpackFilenames should have length 2 (file3 should be gone)
    expect(state.backpackFilenames.length).to.equal(2);
  });
});
