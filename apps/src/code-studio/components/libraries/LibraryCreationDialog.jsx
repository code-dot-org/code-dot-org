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
import loadLibrary from './libraryLoader';

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

/**
 * Displays an interactive dialog that can be used to create a library. It
 * includes the following displays:
 * LOADING: Information is still being gathered for the library
 * DONE_LOADING: Information has been gathered for the library and the user can
 *     decide what data to publish from it
 * PUBLISHED: The user has successfully published the library
 * CODE_ERROR: There is an error in the code that the user must repair prior to
 *     publishing the library
 * NO_FUNCTIONS: The user's project is not a valid library and needs functions
 *     before it can be published
 */
class LibraryCreationDialog extends React.Component {
  static propTypes = {
    libraryClientApi: PropTypes.object.isRequired,

    // From Redux
    dialogIsOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
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
    loadLibrary(
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

  displayContent = () => {
    const {libraryClientApi} = this.props;
    const {libraryDetails} = this.state;
    return (
      <LibraryPublisher
        onPublishSuccess={libraryName =>
          this.setState({
            dialogState: DialogState.PUBLISHED,
            libraryName: libraryName
          })
        }
        libraryDetails={libraryDetails}
        libraryClientApi={libraryClientApi}
      />
    );
  };

  render() {
    let bodyContent;
    const {dialogState, libraryName} = this.state;
    const {dialogIsOpen} = this.props;
    switch (dialogState) {
      case DialogState.LOADING:
        bodyContent = <LoadingDisplay />;
        break;
      case DialogState.PUBLISHED:
        bodyContent = <SuccessDisplay libraryName={libraryName} />;
        break;
      case DialogState.CODE_ERROR:
        bodyContent = <ErrorDisplay message={i18n.libraryCodeError()} />;
        break;
      case DialogState.NO_FUNCTIONS:
        bodyContent = <ErrorDisplay message={i18n.libraryNoFunctionsError()} />;
        break;
      default:
        bodyContent = this.displayContent();
    }
    return (
      <Dialog
        isOpen={dialogIsOpen}
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

export class ErrorDisplay extends React.Component {
  static propTypes = {message: PropTypes.string.isRequired};

  render() {
    const {message} = this.props;
    return <div>{message}</div>;
  }
}

export class LoadingDisplay extends React.Component {
  render() {
    return (
      <div style={styles.centerContent}>
        <Spinner />
      </div>
    );
  }
}

export class SuccessDisplay extends React.Component {
  static propTypes = {libraryName: PropTypes.string.isRequired};

  copyChannelId = () => {
    this.channelId.select();
    document.execCommand('copy');
  };

  render = () => {
    const {libraryName} = this.props;
    return (
      <div>
        <Heading2>
          <b>{i18n.libraryPublishTitle()}</b>
          {libraryName}
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
