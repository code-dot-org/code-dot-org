import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import _ from 'lodash';
import {getStore} from '@cdo/apps/redux';
import color from '@cdo/apps/util/color';
import javalabMsg from '@cdo/javalab/locale';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import {currentLocation, navigateToHref} from '@cdo/apps/utils';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import Comment from './codeReview/Comment';
import CommentEditor from './codeReview/CommentEditor';
import CodeReviewDataApi from './codeReview/CodeReviewDataApi';
import ReviewNavigator from './codeReview/ReviewNavigator';

export const VIEWING_CODE_REVIEW_URL_PARAM = 'viewingCodeReview';

const FLASH_ERROR_TIME_MS = 5000;

class ReviewTab extends Component {
  static propTypes = {
    onLoadComplete: PropTypes.func,
    // Populated by redux
    codeReviewEnabled: PropTypes.bool,
    viewAsCodeReviewer: PropTypes.bool.isRequired,
    viewAsTeacher: PropTypes.bool
  };

  state = {
    initialLoadCompleted: false,
    reviewCheckboxEnabled: false,
    isReadyForReview: false,
    reviewableProjectId: '',
    loadingReviewableState: false,
    errorSavingReviewableProject: false,
    errorLoadingReviewablePeers: false,
    comments: [],
    forceRecreateEditorKey: 0,
    reviewablePeers: [],
    projectOwnerName: '',
    authorizationError: false,
    commentSaveError: false,
    commentSaveInProgress: false,
    dataApi: {}
  };

  onSelectPeer = peer => {
    if (!peer.id) {
      return;
    }

    navigateToHref(
      this.generateLevelUrlWithCodeReviewParam() + `&user_id=${peer.id}`
    );
  };

  onClickBackToProject = () => {
    navigateToHref(this.generateLevelUrlWithCodeReviewParam());
  };

  generateLevelUrlWithCodeReviewParam = () =>
    currentLocation().origin +
    currentLocation().pathname +
    `?${VIEWING_CODE_REVIEW_URL_PARAM}=true`;

  componentDidMount() {
    const {
      channelId,
      serverLevelId,
      serverScriptId
    } = getStore().getState().pageConstants;
    const {viewAsCodeReviewer, viewAsTeacher} = this.props;

    // If there's no channelId (happens when a teacher is viewing as a student who has not done any work on a level),
    // do not make API calls that require a channelId
    if (!channelId) {
      this.setState({initialLoadCompleted: true});
      return;
    }

    this.dataApi = new CodeReviewDataApi(
      channelId,
      serverLevelId,
      serverScriptId
    );

    const initialLoadPromises = [];

    const setComments = data => this.setState({comments: data});
    initialLoadPromises.push(
      this.dataApi.getCodeReviewCommentsForProject(setComments)
    );

    initialLoadPromises.push(
      this.dataApi
        .getPeerReviewStatus()
        .done(data => {
          const id = (data && data.id) || null;
          this.setState({
            reviewCheckboxEnabled: data.canMarkReviewable,
            isReadyForReview: data.reviewEnabled,
            projectOwnerName: data.name,
            reviewableProjectId: id
          });
        })
        .fail(() => {
          this.setState({
            reviewCheckboxEnabled: false,
            isReadyForReview: false
          });
        })
    );

    if (!(viewAsCodeReviewer || viewAsTeacher)) {
      initialLoadPromises.push(
        this.dataApi
          .getReviewablePeers()
          .done(data => this.setState({reviewablePeers: data}))
          .fail(() => {
            this.setState({
              errorLoadingReviewablePeers: true
            });
          })
      );
    }

    Promise.all(initialLoadPromises).finally(() => {
      this.setState({initialLoadCompleted: true});
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.initialLoadCompleted && this.state.initialLoadCompleted) {
      this.props.onLoadComplete();
    }
  }

  onNewCommentCancel = () => {
    this.setState({
      commentSaveError: false,
      commentSaveInProgress: false
    });
  };

  onNewCommentSubmit = commentText => {
    this.setState({
      commentSaveError: false,
      commentSaveInProgress: true
    });
    const {comments, forceRecreateEditorKey} = this.state;

    this.dataApi
      .submitNewCodeReviewComment(commentText)
      .done(newComment => {
        const newComments = comments;
        newComments.push(newComment);

        this.setState({
          comments: newComments,
          forceRecreateEditorKey: forceRecreateEditorKey + 1,
          commentSaveInProgress: false
        });
      })
      .fail(result => {
        if (result.status === 404) {
          this.setState({
            authorizationError: true,
            commentSaveInProgress: false
          });
        } else {
          this.setState({commentSaveError: true, commentSaveInProgress: false});
        }
      });
  };

  onCommentDelete = deletedCommentId => {
    const {comments} = this.state;
    this.dataApi
      .deleteCodeReviewComment(deletedCommentId)
      .done(() => {
        const updatedComments = [...comments];
        _.remove(updatedComments, comment => comment.id === deletedCommentId);

        this.setState({comments: updatedComments});
      })
      .fail(() => this.flashErrorOnComment(deletedCommentId));
  };

  onCommentResolveStateToggle = (resolvedCommentId, newResolvedStatus) => {
    const {comments} = this.state;
    this.dataApi
      .resolveCodeReviewComment(resolvedCommentId, newResolvedStatus)
      .done(() => {
        const updatedComments = [...comments];
        const resolvedCommentIndex = comments.findIndex(
          comment => comment.id === resolvedCommentId
        );
        updatedComments[resolvedCommentIndex].isResolved = !updatedComments[
          resolvedCommentIndex
        ].isResolved;

        this.setState({comments: updatedComments});
      })
      .fail(() => this.flashErrorOnComment(resolvedCommentId));
  };

  flashErrorOnComment = commentId => {
    this.setCommentErrorStatus(commentId, true);
    setTimeout(
      () => this.setCommentErrorStatus(commentId, false),
      FLASH_ERROR_TIME_MS
    );
  };

  setCommentErrorStatus = (commentId, newErrorStatus) => {
    const {comments} = this.state;
    const updatedComments = [...comments];
    const resolvedCommentIndex = updatedComments.findIndex(
      comment => comment.id === commentId
    );
    updatedComments[resolvedCommentIndex].hasError = newErrorStatus;

    this.setState({comments: updatedComments});
  };

  renderReadyForReviewCheckbox() {
    const {isReadyForReview, loadingReviewableState} = this.state;

    return (
      <div style={styles.checkboxContainer}>
        <div style={styles.reviewCheckboxRow}>
          <label>
            {loadingReviewableState ? (
              <Spinner size="small" style={styles.checkbox} />
            ) : (
              <input
                type="checkbox"
                checked={isReadyForReview}
                onChange={() => {
                  this.setReadyForReview(!isReadyForReview);
                }}
                style={styles.checkbox}
              />
            )}
            {javalabMsg.enablePeerReview()}
          </label>
        </div>
      </div>
    );
  }

  setReadyForReview(isReadyForReview) {
    this.setState({
      loadingReviewableState: true,
      errorSavingReviewableProject: false
    });

    if (isReadyForReview) {
      this.dataApi
        .enablePeerReview()
        .done(data => {
          this.setState({
            reviewableProjectId: data.id,
            isReadyForReview: true,
            errorSavingReviewableProject: false,
            loadingReviewableState: false
          });
        })
        .fail(() => {
          this.setState({
            isReadyForReview: false,
            errorSavingReviewableProject: true,
            loadingReviewableState: false
          });
        });
    } else {
      this.dataApi
        .disablePeerReview(this.state.reviewableProjectId)
        .done(() => {
          this.setState({
            isReadyForReview: false,
            errorSavingReviewableProject: false,
            loadingReviewableState: false
          });
        })
        .fail(() => {
          this.setState({
            isReadyForReview: true,
            errorSavingReviewableProject: true,
            loadingReviewableState: false
          });
        });
    }
  }

  renderComments(comments, canShowNoCommentsMessage) {
    if (comments.length === 0 && canShowNoCommentsMessage) {
      return (
        <div style={styles.messageText}>
          {javalabMsg.noCodeReviewComments()}
        </div>
      );
    }

    return comments.map(comment => {
      return (
        <Comment
          comment={comment}
          key={`code-review-comment-${comment.id}`}
          onResolveStateToggle={() =>
            this.onCommentResolveStateToggle(comment.id, !comment.isResolved)
          }
          onDelete={() => this.onCommentDelete(comment.id)}
          viewAsCodeReviewer={this.props.viewAsCodeReviewer}
        />
      );
    });
  }

  renderCommentEditor(forceRecreateEditorKey) {
    const {
      authorizationError,
      isReadyForReview,
      commentSaveInProgress,
      commentSaveError
    } = this.state;
    if (!authorizationError && (isReadyForReview || this.props.viewAsTeacher)) {
      return (
        <CommentEditor
          onNewCommentSubmit={this.onNewCommentSubmit}
          onNewCommentCancel={this.onNewCommentCancel}
          key={forceRecreateEditorKey}
          saveInProgress={commentSaveInProgress}
          saveError={commentSaveError}
        />
      );
    }
    if (authorizationError) {
      // this error messages is displayed if a student is trying to write a comment
      // on a peer's project and the project has peer review disabled.
      return (
        <div style={{...styles.reviewDisabledText, ...styles.messageText}}>
          {javalabMsg.errorPeerReviewDisabled()}
        </div>
      );
    } else {
      // this message is displayed if a student is viewing their own project that has
      // peer review disabled
      return (
        <div style={styles.messageText}>
          {javalabMsg.disabledPeerReviewMessage()}
        </div>
      );
    }
  }

  render() {
    const {viewAsCodeReviewer, viewAsTeacher, codeReviewEnabled} = this.props;
    const {
      initialLoadCompleted,
      comments,
      forceRecreateEditorKey,
      isReadyForReview,
      errorSavingReviewableProject,
      projectOwnerName,
      reviewCheckboxEnabled,
      reviewablePeers,
      errorLoadingReviewablePeers
    } = this.state;

    // channelId is not available on projects where the student has not edited the starter code.
    // comments cannot be made on projects in this tate.
    const projectOwnerHasNotEditedCode = !getStore().getState().pageConstants
      .channelId;

    if (projectOwnerHasNotEditedCode) {
      return (
        <div style={{...styles.reviewsContainer, ...styles.messageText}}>
          {javalabMsg.noCodeReviewUntilStudentEditsCode()}
        </div>
      );
    }

    if (!initialLoadCompleted) {
      return (
        <div style={styles.loadingContainer}>
          <Spinner size="large" />
        </div>
      );
    }

    return (
      <div style={styles.reviewsContainer}>
        <div style={styles.reviewHeader}>
          {codeReviewEnabled && !viewAsTeacher && (
            <>
              <ReviewNavigator
                peers={reviewablePeers}
                onSelectPeer={this.onSelectPeer}
                onReturnToProject={this.onClickBackToProject}
                viewPeerList={!viewAsCodeReviewer}
                loadError={errorLoadingReviewablePeers}
              />
              {reviewCheckboxEnabled &&
                !viewAsCodeReviewer &&
                this.renderReadyForReviewCheckbox()}
            </>
          )}
        </div>
        {errorSavingReviewableProject && (
          <div style={styles.peerReviewErrorMessage}>
            {javalabMsg.togglePeerReviewError()}
          </div>
        )}
        <div style={styles.commentsSection}>
          <div style={styles.messageText}>
            {viewAsCodeReviewer || viewAsTeacher
              ? javalabMsg.feedbackBeginningPeer({
                  peerName: projectOwnerName
                })
              : javalabMsg.feedbackBeginning()}
          </div>
          {this.renderComments(comments, !(isReadyForReview || viewAsTeacher))}
          {this.renderCommentEditor(forceRecreateEditorKey)}
        </div>
      </div>
    );
  }
}

export const UnconnectedReviewTab = ReviewTab;
export default connect(state => ({
  codeReviewEnabled: state.sectionData.section.codeReviewEnabled,
  viewAsCodeReviewer: state.pageConstants.isCodeReviewing,
  viewAsTeacher: state.viewAs === ViewType.Teacher
}))(ReviewTab);

const styles = {
  loadingContainer: {
    display: 'flex',
    margin: '25px',
    justifyContent: 'center'
  },
  reviewsContainer: {
    margin: '25px 5%'
  },
  reviewCheckboxRow: {
    margin: 0,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  checkbox: {margin: '0 7px 0 0'},
  checkboxContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    flexDirection: 'column',
    flexGrow: 1
  },
  peerReviewErrorMessage: {
    fontStyle: 'italic',
    textAlign: 'center',
    fontSize: 12,
    marginBottom: '25px'
  },
  messageText: {
    fontSize: 13,
    marginBottom: '25px',
    color: color.light_gray
  },
  reviewHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '25px',
    flexWrap: 'wrap'
  },
  commentsSection: {
    display: 'flex',
    flexDirection: 'column'
  },
  reviewDisabledText: {
    fontStyle: 'italic'
  }
};
