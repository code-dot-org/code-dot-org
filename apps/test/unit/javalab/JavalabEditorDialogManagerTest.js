import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';

import CommitDialog from '@cdo/apps/javalab/CommitDialog';
import {DisplayTheme} from '@cdo/apps/javalab/DisplayTheme';
import JavalabDialog from '@cdo/apps/javalab/JavalabDialog';
import JavalabEditorDialogManager, {
  DEFAULT_FILE_NAME,
  UnconnectedJavalabEditorDialogManager,
} from '@cdo/apps/javalab/JavalabEditorDialogManager';
import NameFileDialog from '@cdo/apps/javalab/NameFileDialog';
import javalabEditor, {
  setAllSourcesAndFileMetadata,
} from '@cdo/apps/javalab/redux/editorRedux';
import javalab from '@cdo/apps/javalab/redux/javalabRedux';
import javalabView from '@cdo/apps/javalab/redux/viewRedux';
import {JavalabEditorDialog} from '@cdo/apps/javalab/types';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import VersionHistoryWithCommitsDialog from '@cdo/apps/templates/VersionHistoryWithCommitsDialog';
import javalabMsg from '@cdo/javalab/locale';

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
      expect(deleteFileDialog).toBeDefined();
      const deleteProps = deleteFileDialog.props();
      expect(deleteProps.isOpen).toBe(true);
      expect(deleteProps.handleConfirm).toBe(defaultProps.onDeleteFile);
      expect(deleteProps.handleClose).toBe(defaultProps.closeEditorDialog);
      expect(deleteProps.message).toBe(
        javalabMsg.deleteFileConfirmation({
          filename: filenameToDelete,
        })
      );
      expect(deleteProps.confirmButtonText).toBe(javalabMsg.delete());
      expect(deleteProps.closeButtonText).toBe(javalabMsg.cancel());
      expect(deleteProps.displayTheme).toBe(defaultProps.displayTheme);
    });
  });

  describe('Rename File Dialog', () => {
    it('Displays Rename File Dialog if selected', () => {
      const closeEditorDialog = jest.fn();
      const clearRenameFileError = jest.fn();
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
      expect(renameFileDialog).toBeDefined();
      const renameProps = renameFileDialog.props();
      expect(renameProps.isOpen).toBe(true);
      expect(renameProps.filename).toBe(filenameToRename);
      expect(renameProps.handleSave).toBe(defaultProps.onRenameFile);
      expect(renameProps.displayTheme).toBe(defaultProps.displayTheme);
      expect(renameProps.inputLabel).toBe(javalabMsg.renameFile());
      expect(renameProps.saveButtonText).toBe(javalabMsg.rename());
      expect(renameProps.errorMessage).toBe(renameFileError);

      // Verify Redux actions are called on close
      const handleClose = renameProps.handleClose;
      handleClose();
      expect(closeEditorDialog).toHaveBeenCalled();
      expect(clearRenameFileError).toHaveBeenCalled();
    });
  });

  describe('Create File Dialog', () => {
    it('Displays the Create File Dialog if selected', () => {
      const closeEditorDialog = jest.fn();
      const clearNewFileError = jest.fn();
      const newFileError = 'error';

      const wrapper = createWrapper({
        closeEditorDialog,
        clearNewFileError,
        newFileError,
        editorOpenDialogName: JavalabEditorDialog.CREATE_FILE,
      });

      const createFileDialog = wrapper.find(NameFileDialog).at(1);
      expect(createFileDialog).toBeDefined();
      const createProps = createFileDialog.props();
      expect(createProps.isOpen).toBe(true);
      expect(createProps.filename).toBe(DEFAULT_FILE_NAME);
      expect(createProps.handleSave).toBe(defaultProps.onCreateFile);
      expect(createProps.displayTheme).toBe(defaultProps.displayTheme);
      expect(createProps.inputLabel).toBe(javalabMsg.createNewFile());
      expect(createProps.saveButtonText).toBe(javalabMsg.create());
      expect(createProps.errorMessage).toBe(newFileError);

      // Verify Redux actions are called on close
      const handleClose = createProps.handleClose;
      handleClose();
      expect(closeEditorDialog).toHaveBeenCalled();
      expect(clearNewFileError).toHaveBeenCalled();
    });
  });

  describe('Commit Dialog', () => {
    beforeEach(() => {
      stubRedux();
      registerReducers({javalab, javalabEditor, javalabView});
    });

    afterEach(() => {
      restoreRedux();
    });

    it('Displays Commit Dialog if selected', () => {
      const commitDialogFileNames = ['file1', 'file2'];
      const wrapper = createWrapper({
        commitDialogFileNames,
        editorOpenDialogName: JavalabEditorDialog.COMMIT_FILES,
      });

      const commitDialog = wrapper.find(CommitDialog).first();
      expect(commitDialog).toBeDefined();
      const commitProps = commitDialog.props();
      expect(commitProps.isOpen).toBe(true);
      expect(commitProps.files).toBe(commitDialogFileNames);
      expect(commitProps.handleClose).toBe(defaultProps.closeEditorDialog);
      expect(commitProps.handleCommit).toBe(defaultProps.onCommitCode);
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
      expect(commitDialog.props().files).toEqual(['visible.java']);
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
      expect(versionHistoryDialog).toBeDefined();
      const versionHistoryProps = versionHistoryDialog.props();
      expect(versionHistoryProps.isOpen).toBe(true);
      expect(versionHistoryProps.handleClearPuzzle).toBe(
        defaultProps.handleClearPuzzle
      );
      expect(versionHistoryProps.isProjectTemplateLevel).toBe(
        defaultProps.isProjectTemplateLevel
      );
      expect(versionHistoryProps.onClose).toBe(defaultProps.closeEditorDialog);
    });
  });
});
