import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/javalab/locale';
import color from '@cdo/apps/util/color';
import StylizedBaseDialog, {
  FooterButton
} from '@cdo/apps/componentLibrary/StylizedBaseDialog';
import {connect} from 'react-redux';
import _ from 'lodash';
import CommitDialogBody from './CommitDialogBody';
import {setCommitSaveStatus} from '@cdo/apps/javalab/javalabRedux';

const PADDING = 8;

export class UnconnectedCommitDialog extends React.Component {
  state = {
    filesToBackpack: [],
    existingBackpackFiles: [],
    commitNotes: '',
    backpackSaveInProgress: false,
    hasBackpackLoadError: false,
    hasBackpackSaveError: false
  };

  componentDidMount() {
    if (this.props.backpackEnabled) {
      this.updateBackpackFileList();
    }
  }

  // Get updated backpack file list every time we open the modal
  componentDidUpdate(prevProps) {
    if (this.props.backpackEnabled && this.props.isOpen && !prevProps.isOpen) {
      this.updateBackpackFileList();
    }
  }

  updateBackpackFileList() {
    if (this.props.backpackEnabled && this.props.backpackApi.hasBackpack()) {
      this.props.backpackApi.getFileList(
        () => this.setState({hasBackpackLoadError: true}),
        filenames => this.setState({existingBackpackFiles: filenames})
      );
    }
  }

  renderFooter = () => {
    const {
      backpackSaveInProgress,
      commitNotes,
      hasBackpackLoadError,
      hasBackpackSaveError,
      filesToBackpack
    } = this.state;
    const {isCommitSaveInProgress, hasCommitSaveError} = this.props;
    let footerIcon = '';
    let footerMessageTitle = '';
    let footerMessageText = '';
    let commitText = i18n.commit();
    const saveInProgress = backpackSaveInProgress || isCommitSaveInProgress;
    const hasError =
      hasBackpackSaveError || hasCommitSaveError || hasBackpackLoadError;
    const isCommitButtonDisabled =
      !commitNotes || saveInProgress || hasBackpackLoadError;
    if (filesToBackpack.length > 0) {
      commitText = i18n.commitAndSave();
    }

    // TODO: Add compile status here
    if (saveInProgress) {
      footerIcon = (
        <span className="fa fa-spin fa-spinner" style={styles.spinner} />
      );
      footerMessageTitle = i18n.saving();
    } else if (hasError) {
      footerIcon = (
        <span className="fa fa-exclamation-circle" style={styles.iconError} />
      );
      footerMessageTitle = i18n.backpackErrorTitle();
      footerMessageText = hasBackpackLoadError
        ? i18n.backpackListLoadErrorMessageCommitDialog()
        : i18n.backpackSaveErrorMessage();
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
    if (this.props.backpackEnabled) {
      this.saveToBackpack();
    }
  };

  getConflictingBackpackFiles = () => {
    return _.intersection(
      this.state.filesToBackpack,
      this.state.existingBackpackFiles
    );
  };

  saveCommit = () => {
    this.props.setCommitSaveStatus({
      isCommitSaveInProgress: true,
      hasCommitSaveError: false
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
      !this.props.isCommitSaveInProgress && !this.props.hasCommitSaveError;

    this.setState({
      hasBackpackSaveError: false,
      backpackSaveInProgress: false,
      filesToBackpack: []
    });
    this.updateBackpackFileList();

    if (canClose) {
      this.props.handleClose();
    }
  };

  handleBackpackLoadError = () => this.setState({hasBackpackLoadError: true});

  handleCommitSaveError = () => {
    this.props.setCommitSaveStatus({
      isCommitSaveInProgress: false,
      hasCommitSaveError: true
    });
  };

  handleCommitSaveSuccess = () => {
    const canClose =
      !this.state.backpackSaveInProgress && !this.state.hasBackpackSaveError;
    this.setState({
      commitNotes: ''
    });
    this.props.setCommitSaveStatus({
      isCommitSaveInProgress: false,
      hasCommitSaveError: false
    });
    if (canClose) {
      this.props.handleClose();
    }
  };

  clearSaveStateAndClose = () => {
    this.setState({
      hasBackpackSaveError: false,
      hasBackpackLoadError: false,
      backpackSaveInProgress: false
    });
    this.props.setCommitSaveStatus({
      isCommitSaveInProgress: false,
      hasCommitSaveError: false
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
              )
            }))}
            notes={commitNotes}
            onToggleFile={this.toggleFileToBackpack}
            onChangeNotes={this.updateNotes}
            showSaveToBackpackSection={this.props.backpackEnabled}
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
  backpackApi: PropTypes.object,
  backpackEnabled: PropTypes.bool,
  isCommitSaveInProgress: PropTypes.bool,
  hasCommitSaveError: PropTypes.bool,
  setCommitSaveStatus: PropTypes.func
};

const styles = {
  footerStatus: {
    display: 'flex',
    alignItems: 'center'
  },
  iconSuccess: {
    color: color.level_perfect,
    marginRight: 5
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

export default connect(
  state => ({
    sources: state.javalab.sources,
    backpackApi: state.javalab.backpackApi,
    backpackEnabled: state.javalab.backpackEnabled,
    isCommitSaveInProgress: state.javalab.isCommitSaveInProgress,
    hasCommitSaveError: state.javalab.hasCommitSaveError
  }),
  dispatch => ({
    setCommitSaveStatus: ({
      isCommitSaveInProgress: isSaveInProgress,
      hasCommitSaveError: hasError
    }) => dispatch(setCommitSaveStatus(isSaveInProgress, hasError))
  })
)(UnconnectedCommitDialog);
