import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {makeEnum} from '@cdo/apps/utils';
import javalabMsg from '@cdo/javalab/locale';
import VersionHistoryWithCommitsDialog from '@cdo/apps/templates/VersionHistoryWithCommitsDialog';
import JavalabDialog from './JavalabDialog';
import NameFileDialog from './NameFileDialog';
import CommitDialog from './CommitDialog';
import {DisplayTheme} from './DisplayTheme';
import {
  clearNewFileError,
  clearRenameFileError,
  closeEditorDialog
} from './javalabRedux';

export const JavalabEditorDialog = makeEnum(
  'RENAME_FILE',
  'DELETE_FILE',
  'CREATE_FILE',
  'COMMIT_FILES',
  'VERSION_HISTORY'
);

const DEFAULT_FILE_NAME = '.java';

/**
 * Handles displaying the various dialogs used in the Javalab editor (New File dialog,
 * Rename File dialog, Delete File dialog, Commit Code dialog, & Version History dialog).
 */
function JavalabEditorDialogManager({
  onDeleteFile,
  filenameToDelete,
  onRenameFile,
  filenameToRename,
  onCreateFile,
  commitDialogFileNames,
  onCommitCode,
  handleClearPuzzle,
  isProjectTemplateLevel,
  // populated by Redux
  newFileError,
  clearNewFileError,
  renameFileError,
  clearRenameFileError,
  editorOpenDialogName,
  closeEditorDialog,
  displayTheme
}) {
  return (
    <>
      <JavalabDialog
        isOpen={editorOpenDialogName === JavalabEditorDialog.DELETE_FILE}
        handleConfirm={onDeleteFile}
        handleClose={() => closeEditorDialog()}
        message={javalabMsg.deleteFileConfirmation({
          filename: filenameToDelete
        })}
        displayTheme={displayTheme}
        confirmButtonText={javalabMsg.delete()}
        closeButtonText={javalabMsg.cancel()}
      />
      <NameFileDialog
        isOpen={editorOpenDialogName === JavalabEditorDialog.RENAME_FILE}
        handleClose={() => {
          closeEditorDialog();
          clearRenameFileError();
        }}
        filename={filenameToRename}
        handleSave={onRenameFile}
        displayTheme={displayTheme}
        inputLabel="Rename the file"
        saveButtonText="Rename"
        errorMessage={renameFileError}
      />
      <NameFileDialog
        isOpen={editorOpenDialogName === JavalabEditorDialog.CREATE_FILE}
        handleClose={() => {
          closeEditorDialog();
          clearNewFileError();
        }}
        handleSave={onCreateFile}
        displayTheme={displayTheme}
        inputLabel="Create new file"
        saveButtonText="Create"
        errorMessage={newFileError}
        filename={DEFAULT_FILE_NAME}
      />
      <CommitDialog
        isOpen={editorOpenDialogName === JavalabEditorDialog.COMMIT_FILES}
        files={commitDialogFileNames}
        handleClose={() => closeEditorDialog()}
        handleCommit={onCommitCode}
      />
      {editorOpenDialogName === JavalabEditorDialog.VERSION_HISTORY && (
        <VersionHistoryWithCommitsDialog
          handleClearPuzzle={handleClearPuzzle}
          isProjectTemplateLevel={isProjectTemplateLevel}
          onClose={() => closeEditorDialog()}
          isOpen={editorOpenDialogName === JavalabEditorDialog.VERSION_HISTORY}
        />
      )}
    </>
  );
}

JavalabEditorDialogManager.propTypes = {
  onDeleteFile: PropTypes.func.isRequired,
  filenameToDelete: PropTypes.string,
  onRenameFile: PropTypes.func.isRequired,
  filenameToRename: PropTypes.string,
  onCreateFile: PropTypes.func.isRequired,
  commitDialogFileNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  onCommitCode: PropTypes.func.isRequired,
  handleClearPuzzle: PropTypes.func.isRequired,
  isProjectTemplateLevel: PropTypes.bool.isRequired,
  // populated by Redux
  newFileError: PropTypes.string,
  clearNewFileError: PropTypes.func.isRequired,
  renameFileError: PropTypes.string,
  clearRenameFileError: PropTypes.func.isRequired,
  editorOpenDialogName: PropTypes.oneOf(Object.values(JavalabEditorDialog)),
  closeEditorDialog: PropTypes.func.isRequired,
  displayTheme: PropTypes.oneOf(Object.values(DisplayTheme))
};

export default connect(
  state => ({
    editorOpenDialogName: state.javalab.editorOpenDialogName,
    displayTheme: state.javalab.displayTheme,
    newFileError: state.javalab.newFileError,
    renameFileError: state.javalab.renameFileError
  }),
  dispatch => ({
    closeEditorDialog: () => dispatch(closeEditorDialog()),
    clearNewFileError: () => dispatch(clearNewFileError()),
    clearRenameFileError: () => dispatch(clearRenameFileError())
  })
)(JavalabEditorDialogManager);
