import React, {Component} from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import onClickOutside from 'react-onclickoutside';
import classNames from 'classnames';
import JavalabButton from './JavalabButton';
import msg from '@cdo/locale';
import javalabMsg from '@cdo/javalab/locale';
import {connect} from 'react-redux';
import moduleStyles from './backpack.module.scss';
import {DisplayTheme} from './DisplayTheme';
import {makeEnum} from '@cdo/apps/utils';
import JavalabDialog from './JavalabDialog';
import {PaneButton} from '@cdo/apps/templates/PaneHeader';
import CloseOnEscape from '@cdo/apps/templates/CloseOnEscape';
import {BackpackAPIContext} from './BackpackAPIContext';

const Dialog = makeEnum(
  'IMPORT_WARNING',
  'IMPORT_ERROR',
  'DELETE_CONFIRM',
  'DELETE_ERROR'
);

/**
 * A button that drops down to a set of importable files, and closes itself if
 * you click on the import button, or outside of the dropdown.
 */
class Backpack extends Component {
  static propTypes = {
    displayTheme: PropTypes.oneOf(Object.values(DisplayTheme)).isRequired,
    isButtonDisabled: PropTypes.bool.isRequired,
    onImport: PropTypes.func.isRequired,
    // populated by redux
    sources: PropTypes.object.isRequired,
    validation: PropTypes.object.isRequired,
    backpackEnabled: PropTypes.bool,
  };

  static contextType = BackpackAPIContext;

  state = {
    dropdownOpen: false,
    backpackFilenames: [],
    backpackFilesLoading: false,
    backpackLoadError: false,
    selectedFiles: [],
    openDialog: null,
    fileImportMessage: '',
    fileDeleteMessage: '',
    isDeleting: false,
  };

  expandDropdown = () => {
    this.setState({
      dropdownOpen: true,
      backpackLoadError: false,
      selectedFiles: [],
      backpackFilenames: [],
    });
    if (this.context.hasBackpack()) {
      this.setState({backpackFilesLoading: true});
      this.context.getFileList(
        this.onFileListLoadError,
        this.onFileListLoadSuccess
      );
    }
  };

  handleImport = () => {
    const {selectedFiles} = this.state;
    if (selectedFiles.length > 0) {
      this.validateAndImportFiles(
        this.importFiles,
        this.showImportWarning,
        this.showImportError
      );
    }
  };

  confirmAndDeleteFiles = () => {
    const {selectedFiles} = this.state;
    if (selectedFiles.length === 0) {
      this.collapseDropdown();
    }
    this.setState({
      openDialog: Dialog.DELETE_CONFIRM,
      fileDeleteMessage: this.getFileListMessage(
        javalabMsg.fileDeleteConfirm(),
        selectedFiles
      ),
    });
  };

  handleDelete = () => {
    const {selectedFiles} = this.state;
    this.setState({isDeleting: true});
    this.context.deleteFiles(
      selectedFiles,
      (_, failedFileList) => this.onDeleteFailed(failedFileList, selectedFiles),
      this.collapseDropdown
    );
  };

  onDeleteFailed = (failedFileList, expectedFilesDeleted) => {
    this.setState({
      openDialog: Dialog.DELETE_ERROR,
      fileDeleteMessage: this.getFileListMessage(
        javalabMsg.fileDeleteError(),
        failedFileList
      ),
      isDeleting: false,
    });
    const {backpackFilenames, selectedFiles} = this.state;
    // remove correctly deleted files from backpackFilenames and selectedFiles
    const filesDeleted = this.removeFromFileList(
      expectedFilesDeleted,
      failedFileList
    );
    if (filesDeleted.length > 0) {
      const newBackpackFilenames = this.removeFromFileList(
        backpackFilenames,
        filesDeleted
      );
      const newSelectedFiles = this.removeFromFileList(
        selectedFiles,
        filesDeleted
      );
      this.setState({
        backpackFilenames: newBackpackFilenames,
        selectedFiles: newSelectedFiles,
      });
    }
  };

  importFiles = selectedFiles => {
    let failedServerImportFiles = [];
    selectedFiles.forEach(filename => {
      this.context.fetchFile(
        filename,
        () => failedServerImportFiles.push(filename),
        fileContents =>
          this.props.onImport(filename, fileContents) /* onSuccess */
      );
    });

    if (failedServerImportFiles.length > 0) {
      this.showImportError(failedServerImportFiles, false);
    } else {
      this.collapseDropdown();
    }
  };

  showImportWarning = files => {
    this.setState({
      openDialog: Dialog.IMPORT_WARNING,
      fileImportMessage: this.getFileListMessage(
        javalabMsg.fileImportWarning(),
        files,
        javalabMsg.fileImportWarningConfirm()
      ),
    });
  };

  showImportError = (files, isValidationError) => {
    this.setState({
      openDialog: Dialog.IMPORT_ERROR,
      dropdownOpen: false,
      fileImportMessage: this.getFileListMessage(
        isValidationError
          ? javalabMsg.fileImportError()
          : javalabMsg.fileImportServerError(),
        files
      ),
    });
  };

  validateAndImportFiles = (successCallback, warnCallback, errorCallback) => {
    let hiddenFilenamesUsed = [];
    let visibleFilenamesUsed = [];
    const {selectedFiles} = this.state;
    const {sources, validation} = this.props;

    selectedFiles.forEach(filename => {
      const source = sources[filename];
      if (source) {
        if (source.isVisible) {
          visibleFilenamesUsed.push(filename);
        } else {
          hiddenFilenamesUsed.push(filename);
        }
      }

      if (Object.keys(validation).includes(filename)) {
        hiddenFilenamesUsed.push(filename);
      }
    });

    if (hiddenFilenamesUsed.length > 0) {
      errorCallback(hiddenFilenamesUsed, true);
    } else if (visibleFilenamesUsed.length > 0) {
      warnCallback(visibleFilenamesUsed);
    } else {
      successCallback(selectedFiles);
    }
  };

  collapseDropdown = () => {
    this.setState({
      dropdownOpen: false,
      fileImportMessage: '',
      openDialog: null,
      isDeleting: false,
    });
  };

  handleClickOutside = () => {
    if (this.state.dropdownOpen) {
      this.collapseDropdown();
    }
  };

  toggleDropdown = () => {
    if (this.state.dropdownOpen) {
      this.collapseDropdown();
    } else {
      this.expandDropdown();
    }
  };

  onFileListLoadError = () => {
    this.setState({
      backpackLoadError: true,
      backpackFilesLoading: false,
    });
  };

  onFileListLoadSuccess = filenames => {
    this.setState({
      backpackFilenames: filenames,
      backpackFilesLoading: false,
      backpackLoadError: false,
    });
  };

  handleFileCheckboxChange = event => {
    const filename = event.target.name;
    const filenameIndex = this.state.selectedFiles.indexOf(filename);
    if (event.target.checked && filenameIndex < 0) {
      this.setState({
        selectedFiles: [...this.state.selectedFiles, filename],
      });
    } else if (!event.target.checked && filenameIndex >= 0) {
      const newFileList = [...this.state.selectedFiles];
      newFileList.splice(filenameIndex, 1);
      this.setState({
        selectedFiles: newFileList,
      });
    }
  };

  getFileListMessage = (message, fileList, confirmationMessage) => {
    return (
      <div>
        <p>{message}</p>
        <ul className={moduleStyles.fileList}>
          {fileList.map(filename => {
            return <li key={filename}>{filename}</li>;
          })}
        </ul>
        {confirmationMessage && (
          <p className={moduleStyles.confirmationMessage}>
            {confirmationMessage}
          </p>
        )}
      </div>
    );
  };

  removeFromFileList = (fileList, filesToRemove) => {
    return fileList.filter(filename => !filesToRemove.includes(filename));
  };

  render() {
    // Display nothing if the backpack feature is disabled
    if (!this.props.backpackEnabled) {
      return null;
    }
    const {displayTheme, isButtonDisabled} = this.props;
    const {
      dropdownOpen,
      backpackFilenames,
      backpackFilesLoading,
      backpackLoadError,
      selectedFiles,
      openDialog,
      fileImportMessage,
      fileDeleteMessage,
      isDeleting,
    } = this.state;

    const showFiles =
      backpackFilenames.length > 0 &&
      !backpackFilesLoading &&
      !backpackLoadError;
    const showNoFiles =
      !backpackFilesLoading &&
      !backpackLoadError &&
      backpackFilenames.length === 0;

    const backpackIcon = (
      <i style={{marginRight: 8, fontSize: 13}}>
        {/* TODO: [Phase 2] This is legacy style of backpack image.
         Once we move to new styles, make sure to use backpack_neutraldark.png instead to match colors
         More info here: https://github.com/code-dot-org/code-dot-org/pull/50895 */}
        <img
          src="/blockly/media/javalab/backpack.png"
          alt="backpack icon"
          className={moduleStyles.backpackIcon}
        />
      </i>
    );

    // Use PaneButton as primary Backpack button
    // to align with other buttons in the JavalabEditor header,
    // which all use PaneButton.
    return (
      <CloseOnEscape handleClose={this.handleClickOutside}>
        <PaneButton
          id="javalab-editor-backpack"
          icon={backpackIcon}
          onClick={this.toggleDropdown}
          headerHasFocus
          isLegacyStyles
          isRtl={false}
          label={javalabMsg.backpackLabel()}
          leftJustified
          isDisabled={isButtonDisabled}
          style={{
            ...(dropdownOpen && styles.dropdownOpenButton),
          }}
        />
        {dropdownOpen && (
          <div
            className={classNames(
              'ignore-react-onclickoutside',
              moduleStyles.dropdownContainer,
              displayTheme === DisplayTheme.DARK &&
                moduleStyles.dropdownContainerDark
            )}
          >
            {showFiles && (
              <>
                <div
                  className={moduleStyles.dropdown}
                  ref={ref => (this.dropdownList = ref)}
                >
                  {/* In the case of a very long filename, this div adds styling
                  that maintains highlighting even when scrolled to the right */}
                  <div className={moduleStyles.listContainer}>
                    {backpackFilenames.map(filename => (
                      <div
                        className={classNames(
                          moduleStyles.fileListItem,
                          displayTheme === DisplayTheme.DARK &&
                            moduleStyles.fileListItemDark
                        )}
                        /* key must be based on filename so that in case of partial delete failure
                        we can find any successfully deleted files and remove them from the dropdown */
                        key={`backpack-file-${filename}`}
                      >
                        <input
                          type="checkbox"
                          id={`backpack-file-${filename}`}
                          name={filename}
                          onChange={this.handleFileCheckboxChange}
                        />
                        <label
                          htmlFor={`backpack-file-${filename}`}
                          className={moduleStyles.fileListLabel}
                        >
                          {filename}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={moduleStyles.buttonRow}>
                  <JavalabButton
                    text={javalabMsg.import()}
                    className={moduleStyles.buttonOrange}
                    onClick={this.handleImport}
                    isDisabled={selectedFiles.length === 0}
                  />
                  <JavalabButton
                    text={javalabMsg.delete()}
                    className={moduleStyles.buttonRed}
                    onClick={this.confirmAndDeleteFiles}
                    isDisabled={selectedFiles.length === 0}
                  />
                </div>
              </>
            )}
            {backpackFilesLoading && (
              <div className={moduleStyles.spinnerContainer}>
                <span
                  className={classNames(
                    'fa',
                    'fa-spin',
                    'fa-spinner',
                    moduleStyles.spinner
                  )}
                />
              </div>
            )}
            {backpackLoadError && (
              <div className={moduleStyles.message}>
                {javalabMsg.backpackListLoadError()}
              </div>
            )}
            {showNoFiles && (
              <div className={moduleStyles.message}>
                {javalabMsg.emptyBackpackMessage()}
              </div>
            )}
          </div>
        )}
        <JavalabDialog
          className="ignore-react-onclickoutside"
          isOpen={openDialog === Dialog.IMPORT_WARNING}
          handleConfirm={() => this.importFiles(selectedFiles)}
          handleClose={() => this.setState({openDialog: null})}
          message={fileImportMessage}
          displayTheme={displayTheme}
          confirmButtonText={javalabMsg.replace()}
          closeButtonText={javalabMsg.cancel()}
        />
        <JavalabDialog
          className="ignore-react-onclickoutside"
          isOpen={openDialog === Dialog.IMPORT_ERROR}
          handleConfirm={() => this.setState({openDialog: null})}
          message={fileImportMessage}
          displayTheme={displayTheme}
          confirmButtonText={msg.dialogOK()}
        />
        <JavalabDialog
          className="ignore-react-onclickoutside"
          isOpen={openDialog === Dialog.DELETE_CONFIRM}
          handleConfirm={() => this.handleDelete()}
          handleClose={() => this.setState({openDialog: null})}
          message={fileDeleteMessage}
          displayTheme={displayTheme}
          confirmButtonText={javalabMsg.delete()}
          closeButtonText={javalabMsg.cancel()}
          showSpinner={isDeleting}
          disableButtons={isDeleting}
        />
        <JavalabDialog
          className="ignore-react-onclickoutside"
          isOpen={openDialog === Dialog.DELETE_ERROR}
          handleConfirm={() => this.setState({openDialog: null})}
          message={fileDeleteMessage}
          displayTheme={displayTheme}
          confirmButtonText={msg.dialogOK()}
        />
      </CloseOnEscape>
    );
  }
}

const styles = {
  dropdownOpenButton: {
    backgroundColor: color.cyan,
  },
};

export const UnconnectedBackpack = Backpack;
export default connect(state => ({
  sources: state.javalabEditor.sources,
  validation: state.javalabEditor.validation,
  backpackEnabled: state.javalab.backpackEnabled,
}))(onClickOutside(UnconnectedBackpack));
