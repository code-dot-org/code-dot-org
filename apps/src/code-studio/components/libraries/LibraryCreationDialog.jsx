import React from 'react';
import PropTypes from 'prop-types';
import Dialog, {Body} from '@cdo/apps/templates/Dialog';
import {connect} from 'react-redux';
import {hideLibraryCreationDialog} from '../shareDialogRedux';
import i18n from '@cdo/locale';
import PadAndCenter from '@cdo/apps/templates/teacherDashboard/PadAndCenter';
import {Heading1, Heading2} from '@cdo/apps/lib/ui/Headings';
import Spinner from '../../pd/components/spinner';
import PublishSuccessDisplay from './PublishSuccessDisplay';
import ShareTeacherLibraries from './ShareTeacherLibraries';
import LibraryPublisher from './LibraryPublisher';
import loadLibrary from './libraryLoader';
import LibraryClientApi from './LibraryClientApi';
import {getStore} from '@cdo/apps/redux';

const styles = {
  libraryBoundary: {
    padding: 10,
    width: '90%'
  },
  centerContent: {
    display: 'flex',
    justifyContent: 'center'
  },
  info: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 1.2
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
  UNPUBLISHED: 'unpublished',
  SHARE_TEACHER_LIBRARIES: 'share_teacher_libraries',
  CODE_PROFANITY: 'code_profanity',
  ERROR: 'error'
};

/**
 * Displays an interactive dialog that can be used to create a library. It
 * includes the following displays:
 * LOADING: Information is still being gathered for the library
 * DONE_LOADING: Information has been gathered for the library and the user can
 *     decide what data to publish from it
 * PUBLISHED: The user has successfully published the library
 * UNPUBLISHED: The user has successfully unpublished the library
 * ERROR: There was an error loading the library
 * CODE_PROFANITY: There is profanity in the library code
 */
class LibraryCreationDialog extends React.Component {
  static propTypes = {
    channelId: PropTypes.string.isRequired,

    // From Redux
    dialogIsOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
  };

  state = {
    dialogState: DialogState.LOADING,
    libraryName: '',
    libraryDetails: {},
    libraryClientApi: new LibraryClientApi(this.props.channelId),
    errorMessage: ''
  };

  componentDidUpdate(prevProps) {
    if (prevProps.dialogIsOpen === false && this.props.dialogIsOpen === true) {
      this.onOpen();
    }
  }

  onOpen = () => {
    loadLibrary(
      this.state.libraryClientApi,
      error =>
        this.setState({dialogState: DialogState.ERROR, errorMessage: error}),
      this.onLibraryLoaded
    );
  };

  onLibraryLoaded = libraryDetails => {
    this.findProfanity(libraryDetails.librarySource).then(profaneWords => {
      if (profaneWords) {
        this.setState({
          dialogState: DialogState.CODE_PROFANITY,
          errorMessage: i18n.libraryCodeProfanity({
            profanityCount: profaneWords.length,
            profaneWords: profaneWords.join(', ')
          })
        });
      } else {
        this.setState({
          dialogState: DialogState.DONE_LOADING,
          libraryDetails
        });
      }
    });
  };

  findProfanity = text => {
    return $.ajax({
      url: '/profanity/find',
      method: 'POST',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify({text})
    });
  };

  handleClose = () => {
    this.setState({dialogState: DialogState.LOADING});
    this.props.onClose();
  };

  displayPublisherContent = () => {
    const {libraryDetails, libraryClientApi} = this.state;
    return (
      <LibraryPublisher
        onPublishSuccess={libraryName =>
          this.setState({
            dialogState: DialogState.PUBLISHED,
            libraryName: libraryName
          })
        }
        onUnpublishSuccess={() =>
          this.setState({dialogState: DialogState.UNPUBLISHED})
        }
        onShareTeacherLibrary={this.onShareTeacherLibrary()}
        libraryDetails={libraryDetails}
        libraryClientApi={libraryClientApi}
      />
    );
  };

  isTeacher() {
    return getStore().getState().currentUser.userType === 'teacher';
  }

  onShareTeacherLibrary = () => {
    return this.isTeacher()
      ? () => this.setState({dialogState: DialogState.SHARE_TEACHER_LIBRARIES})
      : undefined;
  };

  render() {
    let subtitleContent, bodyContent;
    const {dialogState, libraryName, errorMessage} = this.state;
    const {dialogIsOpen, channelId, onClose} = this.props;
    switch (dialogState) {
      case DialogState.LOADING:
        bodyContent = <LoadingDisplay />;
        break;
      case DialogState.PUBLISHED:
        bodyContent = (
          <PublishSuccessDisplay
            libraryName={libraryName}
            channelId={channelId}
            // Waiting for design guidance prior to enabling this functionality
            // onShareTeacherLibrary={this.onShareTeacherLibrary}
          />
        );
        break;
      case DialogState.UNPUBLISHED:
        bodyContent = <UnpublishSuccessDisplay />;
        break;
      case DialogState.ERROR:
        bodyContent = <ErrorDisplay message={errorMessage} />;
        break;
      case DialogState.DONE_LOADING:
        subtitleContent = i18n.libraryExportSubtitle();
        bodyContent = this.displayPublisherContent();
        break;
      case DialogState.SHARE_TEACHER_LIBRARIES:
        bodyContent = <ShareTeacherLibraries onCancel={onClose} />;
        break;
      case DialogState.CODE_PROFANITY:
        bodyContent = <ErrorDisplay message={errorMessage} />;
        break;
      default:
        // If we get to this state, we've shipped a bug.
        bodyContent = <ErrorDisplay message={i18n.libraryCreatorError()} />;
        break;
    }

    const title =
      dialogState === DialogState.SHARE_TEACHER_LIBRARIES
        ? i18n.manageYourLibraries()
        : i18n.libraryExportTitle();
    return (
      <Dialog
        isOpen={dialogIsOpen}
        handleClose={this.handleClose}
        useUpdatedStyles
        style={{width: 800}}
      >
        <Body>
          <PadAndCenter>
            <div style={styles.libraryBoundary}>
              <Heading1>{title}</Heading1>
              {subtitleContent && (
                <div style={styles.info}>{subtitleContent}</div>
              )}
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

export class UnpublishSuccessDisplay extends React.Component {
  render() {
    return (
      <div>
        <Heading2>
          <b>{i18n.libraryUnPublishTitle()}</b>
        </Heading2>
        <p>{i18n.libraryUnPublishExplanation()}</p>
      </div>
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
