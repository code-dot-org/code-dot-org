import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/javalab/locale';
import color from '@cdo/apps/util/color';
import StylizedBaseDialog, {
  FooterButton
} from '@cdo/apps/componentLibrary/StylizedBaseDialog';
import {connect} from 'react-redux';
import _ from 'lodash';

const fileShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  commit: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  hasConflictingName: PropTypes.bool.isRequired
});

export class UnconnectedCommitDialog extends React.Component {
  constructor(props) {
    super(props);

    let existingBackpackFiles = [];
    let hasBackpackLoadError = false;
    if (props.backpackApi.hasBackpack()) {
      props.backpackApi.getFileList(
        () => (hasBackpackLoadError = true),
        filenames => (existingBackpackFiles = filenames)
      );
    }

    this.state = {
      filesToBackpack: [],
      existingBackpackFiles: existingBackpackFiles,
      commitNotes: '',
      backpackSaveInProgress: false,
      commitSaveInProgress: false,
      hasBackpackLoadError: hasBackpackLoadError,
      hasBackpackSaveError: false,
      hasCommitSaveError: false
    };
  }

  // Get updated backpack file list every time we open the modal
  componentDidUpdate(prevProps) {
    if (this.props.isOpen !== prevProps.isOpen && this.props.isOpen) {
      if (this.props.backpackApi.hasBackpack()) {
        this.props.backpackApi.getFileList(
          this.handleBackpackLoadError,
          filenames => this.setState({existingBackpackFiles: filenames})
        );
      }
    }
  }

  renderFooter = () => {
    let footerIcon = '';
    let footerMessageTitle = '';
    let footerMessageText = '';
    let commitText = i18n.commit();
    const saveInProgress =
      this.state.backpackSaveInProgress || this.state.commitSaveInProgress;
    const isCommitButtonDisabled =
      !this.state.commitNotes ||
      saveInProgress ||
      this.state.hasBackpackLoadError;
    if (this.state.filesToBackpack.length > 0) {
      commitText = i18n.commitAndSave();
    }

    // TODO: Add compile status here
    if (this.state.saveInProgress) {
      footerIcon = (
        <span className="fa fa-spin fa-spinner" style={styles.spinner} />
      );
      footerMessageTitle = i18n.saving();
    } else if (
      this.state.hasBackpackSaveError ||
      this.state.hasCommitSaveError
    ) {
      footerIcon = (
        <span className="fa fa-exclamation-circle" style={styles.iconError} />
      );
      footerMessageTitle = i18n.backpackErrorTitle();
      footerMessageText = i18n.backpackSaveErrorMessage();
    } else if (this.state.hasBackpackLoadError) {
      footerIcon = (
        <span className="fa fa-exclamation-circle" style={styles.iconError} />
      );
      footerMessageTitle = i18n.backpackErrorTitle();
      footerMessageText = i18n.backpackListLoadErrorMessageCommitDialog();
    }

    return [
      <div key="footer-status" style={styles.footerStatus}>
        <div style={styles.footerIcon}>{footerIcon}</div>
        <div style={styles.footerMessage}>
          <div style={styles.footerMessageTitle}>{footerMessageTitle}</div>
          <div style={styles.footerMessageText}>{footerMessageText}</div>
        </div>
      </div>,
      <div key="buttons">
        <FooterButton
          key="cancel"
          type="cancel"
          text={i18n.cancel()}
          disabled={saveInProgress}
          onClick={this.clearSaveStateAndClose}
        />
        <FooterButton
          id="confirmationButton"
          key="confirm"
          text={commitText}
          disabled={isCommitButtonDisabled}
          color="green"
          onClick={this.commitAndSaveToBackpack}
        />
      </div>
    ];
  };

  commitAndSaveToBackpack = () => {
    this.saveCommit();
    this.saveToBackpack();
  };

  getConflictingBackpackFiles = () => {
    return _.intersection(
      this.state.filesToBackpack,
      this.state.existingBackpackFiles
    );
  };

  saveCommit = () => {
    this.setState({
      hasCommitSaveError: false,
      commitSaveInProgress: true
    });
    this.props.handleCommit(
      this.state.commitNotes,
      this.handleCommitSaveSuccess
    );
  };

  saveToBackpack = () => {
    this.setState({
      hasBackpackSaveError: false,
      backpackSaveInProgress: true
    });

    // TODO: Compile before saving and show error if compile fails
    this.props.backpackApi.saveFiles(
      this.props.sources,
      this.state.filesToBackpack,
      this.handleBackpackSaveError,
      this.handleBackpackSaveSuccess
    );
  };

  handleBackpackSaveError = () => {
    this.setState({
      hasBackpackSaveError: true,
      backpackSaveInProgress: false
    });
  };

  handleBackpackSaveSuccess = () => {
    const canClose =
      !this.state.commitSaveInProgress && !this.state.hasCommitSaveError;

    this.props.backpackApi.getFileList(
      this.handleBackpackLoadError,
      filenames => {
        this.setState({
          hasBackpackSaveError: false,
          hasBackpackLoadError: false,
          backpackSaveInProgress: false,
          filesToBackpack: [],
          existingBackpackFiles: filenames
        });
      }
    );

    if (canClose) {
      this.props.handleClose();
    }
  };

  handleBackpackLoadError = () => this.setState({hasBackpackLoadError: true});

  handleCommitSaveError = () => {
    this.setState({
      hasCommitSaveError: true,
      commitSaveInProgress: false
    });
  };

  handleCommitSaveSuccess = () => {
    const canClose =
      !this.state.backpackSaveInProgress && !this.state.hasBackpackSaveError;
    this.setState({
      hasCommitSaveError: false,
      commitSaveInProgress: false,
      commitNotes: ''
    });
    console.log(
      `not backpackSaveInProgress: ${!this.state.backpackSaveInProgress}`
    );
    console.log(
      `not hasBackpackSaveError: ${!this.state.hasBackpackSaveError}`
    );
    console.log(`can close: ${canClose}`);
    if (canClose) {
      this.props.handleClose();
    }
  };

  clearSaveStateAndClose = () => {
    this.setState({
      hasBackpackSaveError: false,
      hasBackpackLoadError: false,
      backpackSaveInProgress: false,
      hasCommitSaveError: false,
      commitSaveInProgress: false
    });
    this.props.handleClose();
  };

  toggleFileToBackpack = filename => {
    let filesToBackpack = [...this.state.filesToBackpack];
    const fileIdx = filesToBackpack.indexOf(filename);
    if (fileIdx === -1) {
      filesToBackpack.push(filename);
    } else {
      filesToBackpack.splice(fileIdx, 1);
    }

    this.setState({filesToBackpack});
  };

  updateNotes = commitNotes => {
    this.setState({commitNotes});
  };

  render() {
    const {commitNotes, filesToBackpack} = this.state;
    const {isOpen, files} = this.props;

    return (
      <StylizedBaseDialog
        isOpen={isOpen}
        title={i18n.commitCode()}
        confirmationButtonText={i18n.commit()}
        body={
          <CommitDialogBody
            files={files.map(name => ({
              name,
              commit: filesToBackpack.includes(name),
              hasConflictingName: this.getConflictingBackpackFiles().includes(
                name
              ),
              onToggle: () => this.toggleFileToBackpack(name)
            }))}
            notes={commitNotes}
            onChangeNotes={this.updateNotes}
          />
        }
        renderFooter={this.renderFooter}
        handleClose={this.clearSaveStateAndClose}
        footerJustification="space-between"
      />
    );
  }
}

UnconnectedCommitDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  files: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleClose: PropTypes.func.isRequired,
  handleCommit: PropTypes.func.isRequired,
  // populated by redux
  sources: PropTypes.object,
  backpackApi: PropTypes.object
};

function CommitDialogBody({files, notes, onChangeNotes}) {
  return (
    <div>
      <label htmlFor="commit-notes" style={{...styles.bold, ...styles.notes}}>
        {i18n.commitNotes()}
      </label>
      <textarea
        id="commit-notes"
        placeholder={i18n.commitNotesPlaceholder()}
        onChange={e => onChangeNotes(e.target.value)}
        style={styles.textarea}
        value={notes}
      />
      <div style={{...styles.bold, ...styles.filesHeader}}>
        {i18n.saveToBackpack()}
      </div>
      {files.map(file => {
        return <CommitDialogFile file={file} key={file.name} />;
      })}
    </div>
  );
}

CommitDialogBody.propTypes = {
  files: PropTypes.arrayOf(fileShape).isRequired,
  notes: PropTypes.string,
  onChangeNotes: PropTypes.func.isRequired
};

export function CommitDialogFile({file}) {
  return (
    <div style={styles.fileRow}>
      <div style={styles.fileLabelContainer}>
        <label htmlFor={`commit-${file.name}`} style={styles.fileLabel}>
          {file.name}
        </label>
        {file.hasConflictingName && (
          <div style={styles.fileNameConflictWarning}>
            {i18n.backpackFileNameConflictWarning()}
          </div>
        )}
      </div>
      <input
        id={`commit-${file.name}`}
        type="checkbox"
        checked={file.commit}
        onChange={file.onToggle}
        style={styles.checkbox}
      />
    </div>
  );
}

CommitDialogFile.propTypes = {
  file: fileShape.isRequired
};

const PADDING = 8;
const styles = {
  bold: {
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.dark_charcoal
  },
  footerStatus: {
    display: 'flex',
    alignItems: 'center'
  },
  iconSuccess: {
    color: color.level_perfect,
    marginRight: 5
  },
  filesHeader: {
    fontSize: 14,
    backgroundColor: color.lightest_gray,
    padding: PADDING
  },
  fileRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: PADDING,
    paddingBottom: PADDING / 2,
    borderBottom: `1px solid ${color.lightest_gray}`
  },
  fileLabelContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  fileLabel: {
    flexGrow: 2,
    color: color.default_text
  },
  fileNameConflictWarning: {
    color: color.default_text,
    fontStyle: 'italic',
    fontSize: 12
  },
  checkbox: {
    width: 18,
    height: 18
  },
  notes: {
    paddingTop: PADDING * 2
  },
  textarea: {
    width: '98%',
    height: 75,
    resize: 'none'
  },
  iconError: {
    color: color.light_orange,
    fontSize: 32
  },
  footerMessageTitle: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 14
  },
  footerMessageText: {
    fontStyle: 'italic',
    fontSize: 12
  },
  footerMessage: {
    color: color.dark_charcoal
  },
  spinner: {
    color: color.dark_charcoal,
    fontSize: 28
  },
  footerIcon: {
    paddingRight: PADDING
  }
};

export default connect(state => ({
  sources: state.javalab.sources,
  backpackApi: state.javalab.backpackApi
}))(UnconnectedCommitDialog);
