import React from 'react';
import {expect} from '../../util/reconfiguredChai';
import {shallow, mount} from 'enzyme';
import sinon from 'sinon';
import {Provider} from 'react-redux';
import {
  getStore,
  registerReducers,
  __testing_stubRedux,
  __testing_restoreRedux,
} from '@cdo/apps/redux';
import javalabMsg from '@cdo/javalab/locale';
import {DisplayTheme} from '@cdo/apps/javalab/DisplayTheme';
import JavalabEditorDialogManager, {
  DEFAULT_FILE_NAME,
  UnconnectedJavalabEditorDialogManager,
} from '@cdo/apps/javalab/JavalabEditorDialogManager';
import JavalabDialog from '@cdo/apps/javalab/JavalabDialog';
import NameFileDialog from '@cdo/apps/javalab/NameFileDialog';
import CommitDialog from '@cdo/apps/javalab/CommitDialog';
import VersionHistoryWithCommitsDialog from '@cdo/apps/templates/VersionHistoryWithCommitsDialog';
import javalabEditor, {
  setAllSourcesAndFileMetadata,
} from '@cdo/apps/javalab/redux/editorRedux';
import javalab from '@cdo/apps/javalab/redux/javalabRedux';
import javalabView from '@cdo/apps/javalab/redux/viewRedux';
import {JavalabEditorDialog} from '@cdo/apps/javalab/types';

describe('JavalabEditorDialogManager', () => {
  let defaultProps;

  beforeEach(() => {
    defaultProps = {
      onDeleteFile: () => {},
      filenameToDelete: null,
      onRenameFile: () => {},
      filenameToRename: null,
      onCreateFile: () => {},
      onCommitCode: () => {},
      handleClearPuzzle: () => {},
      isProjectTemplateLevel: false,
      newFileError: null,
      clearNewFileError: () => {},
      renameFileError: null,
      clearRenameFileError: () => {},
      editorOpenDialogName: null,
      closeEditorDialog: () => {},
      commitDialogFileNames: [],
      displayTheme: DisplayTheme.DARK,
    };
  });

  function createWrapper(overrideProps) {
    const combinedProps = {...defaultProps, ...overrideProps};
    return shallow(
      <UnconnectedJavalabEditorDialogManager {...combinedProps} />
    );
  }

  describe('Delete File Dialog', () => {
    it('Displays delete file dialog if selected', () => {
      const filenameToDelete = 'fileToDelete';

      const wrapper = createWrapper({
        filenameToDelete,
        editorOpenDialogName: JavalabEditorDialog.DELETE_FILE,
      });

      const deleteFileDialog = wrapper.find(JavalabDialog).first();
      expect(deleteFileDialog).to.exist;
      const deleteProps = deleteFileDialog.props();
      expect(deleteProps.isOpen).to.be.true;
      expect(deleteProps.handleConfirm).to.be.equal(defaultProps.onDeleteFile);
      expect(deleteProps.handleClose).to.be.equal(
        defaultProps.closeEditorDialog
      );
      expect(deleteProps.message).to.be.equal(
        javalabMsg.deleteFileConfirmation({
          filename: filenameToDelete,
        })
      );
      expect(deleteProps.confirmButtonText).to.be.equal(javalabMsg.delete());
      expect(deleteProps.closeButtonText).to.be.equal(javalabMsg.cancel());
      expect(deleteProps.displayTheme).to.be.equal(defaultProps.displayTheme);
    });
  });

  describe('Rename File Dialog', () => {
    it('Displays Rename File Dialog if selected', () => {
      const closeEditorDialog = sinon.stub();
      const clearRenameFileError = sinon.stub();
      const filenameToRename = 'fileToRename';
      const renameFileError = 'error';

      const wrapper = createWrapper({
        closeEditorDialog,
        clearRenameFileError,
        filenameToRename,
        renameFileError,
        editorOpenDialogName: JavalabEditorDialog.RENAME_FILE,
      });

      const renameFileDialog = wrapper.find(NameFileDialog).first();
      expect(renameFileDialog).to.exist;
      const renameProps = renameFileDialog.props();
      expect(renameProps.isOpen).to.be.true;
      expect(renameProps.filename).to.equal(filenameToRename);
      expect(renameProps.handleSave).to.equal(defaultProps.onRenameFile);
      expect(renameProps.displayTheme).to.equal(defaultProps.displayTheme);
      expect(renameProps.inputLabel).to.equal(javalabMsg.renameFile());
      expect(renameProps.saveButtonText).to.equal(javalabMsg.rename());
      expect(renameProps.errorMessage).to.equal(renameFileError);

      // Verify Redux actions are called on close
      const handleClose = renameProps.handleClose;
      handleClose();
      expect(closeEditorDialog).to.have.been.called;
      expect(clearRenameFileError).to.have.been.called;
    });
  });

  describe('Create File Dialog', () => {
    it('Displays the Create File Dialog if selected', () => {
      const closeEditorDialog = sinon.stub();
      const clearNewFileError = sinon.stub();
      const newFileError = 'error';

      const wrapper = createWrapper({
        closeEditorDialog,
        clearNewFileError,
        newFileError,
        editorOpenDialogName: JavalabEditorDialog.CREATE_FILE,
      });

      const createFileDialog = wrapper.find(NameFileDialog).at(1);
      expect(createFileDialog).to.exist;
      const createProps = createFileDialog.props();
      expect(createProps.isOpen).to.be.true;
      expect(createProps.filename).to.equal(DEFAULT_FILE_NAME);
      expect(createProps.handleSave).to.equal(defaultProps.onCreateFile);
      expect(createProps.displayTheme).to.equal(defaultProps.displayTheme);
      expect(createProps.inputLabel).to.equal(javalabMsg.createNewFile());
      expect(createProps.saveButtonText).to.equal(javalabMsg.create());
      expect(createProps.errorMessage).to.equal(newFileError);

      // Verify Redux actions are called on close
      const handleClose = createProps.handleClose;
      handleClose();
      expect(closeEditorDialog).to.have.been.called;
      expect(clearNewFileError).to.have.been.called;
    });
  });

  describe('Commit Dialog', () => {
    beforeEach(() => {
      __testing_stubRedux();
      registerReducers({javalab, javalabEditor, javalabView});
    });

    afterEach(() => {
      __testing_restoreRedux();
    });

    it('Displays Commit Dialog if selected', () => {
      const commitDialogFileNames = ['file1', 'file2'];
      const wrapper = createWrapper({
        commitDialogFileNames,
        editorOpenDialogName: JavalabEditorDialog.COMMIT_FILES,
      });

      const commitDialog = wrapper.find(CommitDialog).first();
      expect(commitDialog).to.exist;
      const commitProps = commitDialog.props();
      expect(commitProps.isOpen).to.be.true;
      expect(commitProps.files).to.equal(commitDialogFileNames);
      expect(commitProps.handleClose).to.equal(defaultProps.closeEditorDialog);
      expect(commitProps.handleCommit).to.equal(defaultProps.onCommitCode);
    });

    it('Filters non-visible sources in Redux', () => {
      // Using Redux for this test case only to verify logic in connect()
      const store = getStore();

      store.dispatch(
        setAllSourcesAndFileMetadata({
          'visible.java': {text: '', isVisible: true, isValidation: false},
          'invisible.java': {text: '', isVisible: false, isValidation: false},
          'validation.java': {text: '', isVisible: true, isValidation: true},
        })
      );

      const wrapper = mount(
        <Provider store={store}>
          <JavalabEditorDialogManager {...defaultProps} />
        </Provider>
      );

      const commitDialog = wrapper.find(CommitDialog).first();
      expect(commitDialog.props().files).to.deep.equal(['visible.java']);
    });
  });

  describe('Version History Dialog', () => {
    it('Displays Version History Dialog if selected', () => {
      const wrapper = createWrapper({
        editorOpenDialogName: JavalabEditorDialog.VERSION_HISTORY,
      });

      const versionHistoryDialog = wrapper
        .find(VersionHistoryWithCommitsDialog)
        .first();
      expect(versionHistoryDialog).to.exist;
      const versionHistoryProps = versionHistoryDialog.props();
      expect(versionHistoryProps.isOpen).to.be.true;
      expect(versionHistoryProps.handleClearPuzzle).to.equal(
        defaultProps.handleClearPuzzle
      );
      expect(versionHistoryProps.isProjectTemplateLevel).to.equal(
        defaultProps.isProjectTemplateLevel
      );
      expect(versionHistoryProps.onClose).to.equal(
        defaultProps.closeEditorDialog
      );
    });
  });
});
