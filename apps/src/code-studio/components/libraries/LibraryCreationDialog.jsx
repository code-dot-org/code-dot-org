/*global dashboard*/
import React from 'react';
import PropTypes from 'prop-types';
import Dialog, {Body} from '@cdo/apps/templates/Dialog';
import {connect} from 'react-redux';
import {hideLibraryCreationDialog} from '../shareDialogRedux';
import i18n from '@cdo/locale';
import PadAndCenter from '@cdo/apps/templates/teacherDashboard/PadAndCenter';
import {Heading1, Heading2} from '@cdo/apps/lib/ui/Headings';
import Spinner from '../../pd/components/spinner';
import Button from '@cdo/apps/templates/Button';
import LibraryPublisher from './LibraryPublisher';
import libraryLoader from './libraryLoader';

const styles = {
  libraryBoundary: {
    padding: 10,
    width: '90%'
  },
  centerContent: {
    display: 'flex',
    justifyContent: 'center'
  },
  copy: {
    cursor: 'copy',
    width: 300,
    height: 25
  },
  button: {
    marginLeft: 10,
    marginRight: 10
  }
};

/**
 * @readonly
 * @enum {string}
 */
export const DialogState = {
  LOADING: 'loading',
  DONE_LOADING: 'done_loading',
  PUBLISHED: 'published',
  CODE_ERROR: 'code_error',
  NO_FUNCTIONS: 'no_functions'
};

class LibraryCreationDialog extends React.Component {
  static propTypes = {
    dialogIsOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    clientApi: PropTypes.object.isRequired
  };

  state = {
    dialogState: DialogState.LOADING,
    libraryName: '',
    libraryDetails: {}
  };

  componentDidUpdate(prevProps) {
    if (prevProps.dialogIsOpen === false && this.props.dialogIsOpen === true) {
      this.onOpen();
    }
  }

  onOpen = () => {
    libraryLoader.load(
      () => this.setState({dialogState: DialogState.CODE_ERROR}),
      () => this.setState({dialogState: DialogState.NO_FUNCTIONS}),
      libraryDetails =>
        this.setState({
          dialogState: DialogState.DONE_LOADING,
          libraryDetails: libraryDetails
        })
    );
  };

  handleClose = () => {
    this.setState({dialogState: DialogState.LOADING});
    this.props.onClose();
  };

  copyChannelId = () => {
    this.channelId.select();
    document.execCommand('copy');
  };

  displayError = errorMessage => {
    return <div>{errorMessage}</div>;
  };

  displayLoadingState = () => {
    return (
      <div style={styles.centerContent}>
        <Spinner />
      </div>
    );
  };

  displaySuccess = () => {
    return (
      <div>
        <Heading2>
          <b>{i18n.libraryPublishTitle()}</b>
          {this.state.libraryName}
        </Heading2>
        <div>
          <p>{i18n.libraryPublishExplanation()}</p>
          <div style={styles.centerContent}>
            <input
              type="text"
              ref={channelId => (this.channelId = channelId)}
              onClick={event => event.target.select()}
              readOnly="true"
              value={dashboard.project.getCurrentId()}
              style={styles.copy}
            />
            <Button
              onClick={this.copyChannelId}
              text={i18n.copyId()}
              style={styles.button}
            />
          </div>
        </div>
      </div>
    );
  };

  displayContent = () => {
    return (
      <LibraryPublisher
        onPublishSuccess={libraryName =>
          this.setState({
            dialogState: DialogState.PUBLISHED,
            libraryName: libraryName
          })
        }
        libraryDetails={this.state.libraryDetails}
        clientApi={this.props.clientApi}
      />
    );
  };

  render() {
    let bodyContent;
    switch (this.state.dialogState) {
      case DialogState.LOADING:
        bodyContent = this.displayLoadingState();
        break;
      case DialogState.PUBLISHED:
        bodyContent = this.displaySuccess();
        break;
      case DialogState.CODE_ERROR:
        bodyContent = this.displayError(i18n.libraryCodeError());
        break;
      case DialogState.NO_FUNCTIONS:
        bodyContent = this.displayError(i18n.libraryNoFunctonsError());
        break;
      default:
        bodyContent = this.displayContent();
    }
    return (
      <Dialog
        isOpen={this.props.dialogIsOpen}
        handleClose={this.handleClose}
        useUpdatedStyles
      >
        <Body>
          <PadAndCenter>
            <div style={styles.libraryBoundary}>
              <Heading1>{i18n.libraryExportTitle()}</Heading1>
              {bodyContent}
            </div>
          </PadAndCenter>
        </Body>
      </Dialog>
    );
  }
}

export const UnconnectedLibraryCreationDialog = LibraryCreationDialog;

export default connect(
  state => ({
    dialogIsOpen: state.shareDialog.libraryDialogIsOpen
  }),
  dispatch => ({
    onClose() {
      dispatch(hideLibraryCreationDialog());
    }
  })
)(LibraryCreationDialog);
