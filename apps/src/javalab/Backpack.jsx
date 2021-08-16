import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '@cdo/apps/util/color';
import onClickOutside from 'react-onclickoutside';
import JavalabButton from './JavalabButton';
import msg from '@cdo/locale';
import javalabMsg from '@cdo/javalab/locale';
import {connect} from 'react-redux';
import {setSource} from './javalabRedux';
import {makeEnum} from '@cdo/apps/utils';
import JavalabDialog from './JavalabDialog';

const Dialog = makeEnum('IMPORT_WARNING', 'IMPORT_ERROR');

/**
 * A button that drops down to a set of importable files, and closes itself if
 * you click on the import button, or outside of the dropdown.
 */
class Backpack extends Component {
  static propTypes = {
    isDarkMode: PropTypes.bool.isRequired,
    isDisabled: PropTypes.bool.isRequired,
    onImport: PropTypes.func.isRequired,
    // populated by redux
    backpackApi: PropTypes.object,
    sources: PropTypes.object
  };

  state = {
    dropdownOpen: false,
    backpackFilenames: [],
    backpackFilesLoading: false,
    backpackLoadError: false,
    selectedFiles: [],
    openDialog: null,
    fileImportMessage: ''
  };

  expandDropdown = () => {
    this.setState({
      dropdownOpen: true,
      backpackLoadError: false,
      selectedFiles: [],
      backpackFilenames: []
    });
    if (this.props.backpackApi.hasBackpack()) {
      this.setState({backpackFilesLoading: true});
      this.props.backpackApi.getFileList(
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

  importFiles = selectedFiles => {
    selectedFiles.forEach(filename => {
      this.props.backpackApi.fetchFile(
        filename,
        () => {} /* onError, currently do nothing */,
        fileContents =>
          this.props.onImport(filename, fileContents) /* onSuccess */
      );
    });
    this.collapseDropdown();
  };

  showImportWarning = files => {
    this.setState({
      openDialog: Dialog.IMPORT_WARNING,
      fileImportMessage: this.getFileImportMessage(false, files)
    });
  };

  showImportError = files => {
    this.setState({
      openDialog: Dialog.IMPORT_ERROR,
      fileImportMessage: this.getFileImportMessage(true, files)
    });
  };

  validateAndImportFiles = (successCallback, warnCallback, errorCallback) => {
    let hiddenFilenamesUsed = [];
    let visibleFilenamesUsed = [];
    const {selectedFiles} = this.state;
    const {sources} = this.props;

    selectedFiles.forEach(filename => {
      const source = sources[filename];
      if (source) {
        if (source.isVisible) {
          visibleFilenamesUsed.push(filename);
        } else {
          hiddenFilenamesUsed.push(filename);
        }
      }
    });

    if (hiddenFilenamesUsed.length > 0) {
      errorCallback(hiddenFilenamesUsed);
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
      openDialog: null
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
      backpackFilesLoading: false
    });
  };

  onFileListLoadSuccess = filenames => {
    this.setState({
      backpackFilenames: filenames,
      backpackFilesLoading: false,
      backpackLoadError: false
    });
  };

  handleFileCheckboxChange = event => {
    const filename = event.target.name;
    const filenameIndex = this.state.selectedFiles.indexOf(filename);
    if (event.target.checked && filenameIndex < 0) {
      this.setState({
        selectedFiles: [...this.state.selectedFiles, filename]
      });
    } else if (!event.target.checked && filenameIndex >= 0) {
      const newFileList = [...this.state.selectedFiles];
      newFileList.splice(filenameIndex, 1);
      this.setState({
        selectedFiles: newFileList
      });
    }
  };

  getFileImportMessage = (isError, overwriteFileList) => {
    return (
      <div>
        <p>
          {isError
            ? javalabMsg.fileImportError()
            : javalabMsg.fileImportWarning()}
        </p>
        <ul style={styles.importMessageList}>
          {overwriteFileList.map(filename => {
            return <li key={filename}>{filename}</li>;
          })}
        </ul>
        {!isError && (
          <p style={styles.importWarningConfirm}>
            {javalabMsg.fileImportWarningConfirm()}
          </p>
        )}
      </div>
    );
  };

  render() {
    const {isDarkMode, isDisabled} = this.props;
    const {
      dropdownOpen,
      backpackFilenames,
      backpackFilesLoading,
      backpackLoadError,
      selectedFiles,
      openDialog,
      fileImportMessage
    } = this.state;

    const showFiles =
      backpackFilenames.length > 0 &&
      !backpackFilesLoading &&
      !backpackLoadError;
    const showNoFiles =
      !backpackFilesLoading &&
      !backpackLoadError &&
      backpackFilenames.length === 0;

    return (
      <div>
        <JavalabButton
          icon={
            <img
              src="/blockly/media/javalab/backpack.png"
              alt="backpack icon"
              style={styles.backpackIcon}
            />
          }
          text={javalabMsg.backpackLabel()}
          style={{
            ...styles.buttonStyles,
            ...(dropdownOpen && styles.dropdownOpenButton)
          }}
          isHorizontal
          onClick={this.toggleDropdown}
          isDisabled={isDisabled}
        />
        {dropdownOpen && (
          <div
            style={{...styles.dropdown, ...(isDarkMode && styles.dropdownDark)}}
            ref={ref => (this.dropdownList = ref)}
          >
            {showFiles && (
              <div>
                {backpackFilenames.map((filename, index) => (
                  <div
                    style={{
                      ...styles.fileListItem,
                      ...(isDarkMode && styles.fileListItemDark)
                    }}
                    key={`backpack-file-${index}`}
                  >
                    <input
                      type="checkbox"
                      id={`backpack-file-${index}`}
                      name={filename}
                      onChange={this.handleFileCheckboxChange}
                    />
                    <label
                      htmlFor={`backpack-file-${index}`}
                      style={styles.fileListLabel}
                    >
                      {filename}
                    </label>
                  </div>
                ))}
                <JavalabButton
                  text={javalabMsg.import()}
                  style={styles.importButton}
                  onClick={this.handleImport}
                  isDisabled={selectedFiles.length === 0}
                />
              </div>
            )}
            {backpackFilesLoading && (
              <span className="fa fa-spin fa-spinner" style={styles.spinner} />
            )}
            {backpackLoadError && (
              <div style={styles.message}>
                {javalabMsg.backpackListLoadError()}
              </div>
            )}
            {showNoFiles && (
              <div style={styles.message}>
                {javalabMsg.emptyBackpackMessage()}
              </div>
            )}
          </div>
        )}
        <JavalabDialog
          isOpen={openDialog === Dialog.IMPORT_WARNING}
          handleConfirm={() => this.importFiles(selectedFiles)}
          handleClose={() => this.setState({openDialog: null})}
          message={fileImportMessage}
          isDarkMode={isDarkMode}
          confirmButtonText={javalabMsg.replace()}
          closeButtonText={javalabMsg.cancel()}
        />
        <JavalabDialog
          isOpen={openDialog === Dialog.IMPORT_ERROR}
          handleConfirm={() => this.setState({openDialog: null})}
          message={fileImportMessage}
          isDarkMode={isDarkMode}
          confirmButtonText={msg.dialogOK()}
        />
      </div>
    );
  }
}

const styles = {
  dropdown: {
    position: 'absolute',
    marginTop: 30,
    backgroundColor: color.lightest_gray,
    color: color.darkest_gray,
    zIndex: 20,
    paddingTop: 5,
    paddingBottom: 5,
    borderRadius: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 150
  },
  dropdownDark: {
    backgroundColor: color.darkest_gray,
    color: color.light_gray
  },
  buttonStyles: {
    cursor: 'pointer',
    float: 'right',
    backgroundColor: color.light_purple,
    margin: '3px 3px 3px 0px',
    height: 24,
    borderRadius: 4,
    borderWidth: 0,
    fontSize: 13,
    color: color.white,
    padding: '0px 12px',
    fontFamily: '"Gotham 5r", sans-serif',
    lineHeight: '18px',
    ':hover': {
      backgroundColor: color.cyan
    }
  },
  dropdownOpenButton: {
    backgroundColor: color.cyan
  },
  fileListItem: {
    display: 'flex',
    flexDirection: 'row',
    padding: '5px 10px 5px 10px',
    width: '90%',
    ':hover': {
      backgroundColor: color.lighter_gray
    }
  },
  fileListItemDark: {
    ':hover': {
      backgroundColor: color.black
    }
  },
  fileListLabel: {
    marginLeft: 5
  },
  importButton: {
    backgroundColor: color.orange,
    color: color.white,
    fontSize: 13,
    padding: '5px 16px'
  },
  backpackIcon: {
    height: 15,
    opacity: 1
  },
  spinner: {
    fontSize: 22
  },
  message: {
    fontStyle: 'italic',
    fontSize: 10,
    lineHeight: '12px',
    padding: 10
  },
  importMessageList: {
    marginBottom: 0
  },
  importWarningConfirm: {
    marginTop: 10,
    marginBottom: 0
  }
};

export const UnconnectedBackpack = Backpack;
export default connect(
  state => ({
    backpackApi: state.javalab.backpackApi,
    sources: state.javalab.sources
  }),
  dispatch => ({
    setSource: (filename, source) => dispatch(setSource(filename, source))
  })
)(onClickOutside(Radium(UnconnectedBackpack)));
