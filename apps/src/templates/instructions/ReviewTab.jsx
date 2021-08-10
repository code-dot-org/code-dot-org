import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import _ from 'lodash';
import {getStore} from '@cdo/apps/redux';
import color from '@cdo/apps/util/color';
import javalabMsg from '@cdo/javalab/locale';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import Button from '@cdo/apps/templates/Button';
import {currentLocation, navigateToHref} from '@cdo/apps/utils';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import Comment from './codeReview/Comment';
import CommentEditor from './codeReview/CommentEditor';
import * as codeReviewDataApi from './codeReview/codeReviewDataApi';
import PeerSelectDropdown from './codeReview/PeerSelectDropdown';

export const VIEWING_CODE_REVIEW_URL_PARAM = 'viewingCodeReview';

const FLASH_ERROR_TIME_MS = 5000;

class ReviewTab extends Component {
  static propTypes = {
    // Populated by redux
    viewAsCodeReviewer: PropTypes.bool.isRequired,
    viewAs: PropTypes.oneOf(Object.keys(ViewType))
  };

  state = {
    reviewCheckboxEnabled: false,
    isReadyForReview: false,
    reviewableProjectId: '',
    loadingReviewableState: false,
    errorSavingReviewableProject: false,
    errorLoadingReviewblePeers: false,
    comments: [],
    token: '',
    forceRecreateEditorKey: 0,
    reviewablePeers: [],
    projectOwnerName: ''
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

    // If there's no channelId (happens when a teacher is viewing as a student who has not done any work on a level),
    // do not make API calls that require a channelId
    if (!channelId) {
      return;
    }

    codeReviewDataApi
      .getCodeReviewCommentsForProject(channelId)
      .done((data, _, request) => {
        this.setState({
          comments: data,
          token: request.getResponseHeader('csrf-token')
        });
      });

    codeReviewDataApi
      .getPeerReviewStatus(channelId, serverLevelId, serverScriptId)
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
      });

    if (
      !this.props.viewAsCodeReviewer &&
      this.props.viewAs !== ViewType.Teacher
    ) {
      codeReviewDataApi
        .getReviewablePeers(channelId, serverLevelId, serverScriptId)
        .done(data => {
          this.setState({
            reviewablePeers: _.chain(data)
              .filter(peerEntry => peerEntry && peerEntry.length === 2)
              .map(peerEntry => ({id: peerEntry[0], name: peerEntry[1]}))
              .value()
          });
        })
        .fail(() => {
          this.setState({
            errorLoadingReviewblePeers: true
          });
        });
    }
  }

  onNewCommentSubmit = commentText => {
    const channelId = getStore().getState().pageConstants.channelId;
    const {token} = this.state;

    codeReviewDataApi
      .submitNewCodeReviewComment(commentText, channelId, token)
      .done(newComment => {
        const comments = this.state.comments;
        comments.push(newComment);

        this.setState({
          comments: comments,
          forceRecreateEditorKey: this.state.forceRecreateEditorKey + 1
        });
      });
  };

  onCommentDelete = deletedCommentId => {
    const {token} = this.state;

    codeReviewDataApi
      .deleteCodeReviewComment(deletedCommentId, token)
      .done(() => {
        const comments = [...this.state.comments];
        _.remove(comments, comment => comment.id === deletedCommentId);

        this.setState({comments: comments});
      })
      .fail(() => this.flashErrorOnComment(deletedCommentId));
  };

  onCommentResolveStateToggle = (resolvedCommentId, newResolvedStatus) => {
    const {token} = this.state;

    codeReviewDataApi
      .resolveCodeReviewComment(resolvedCommentId, newResolvedStatus, token)
      .done(() => {
        const comments = [...this.state.comments];
        const resolvedCommentIndex = comments.findIndex(
          comment => comment.id === resolvedCommentId
        );
        comments[resolvedCommentIndex].isResolved = !comments[
          resolvedCommentIndex
        ].isResolved;

        this.setState({comments: comments});
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
    const comments = [...this.state.comments];
    const resolvedCommentIndex = comments.findIndex(
      comment => comment.id === commentId
    );
    comments[resolvedCommentIndex].hasError = newErrorStatus;

    this.setState({comments: comments});
  };

  renderReadyForReviewCheckbox() {
    const {
      reviewCheckboxEnabled,
      token,
      isReadyForReview,
      loadingReviewableState
    } = this.state;

    if (
      this.props.viewAsCodeReviewer ||
      this.props.viewAs === ViewType.Teacher ||
      !reviewCheckboxEnabled ||
      !token ||
      token.length === 0
    ) {
      return null;
    }

    return (
      <div style={styles.checkboxContainer}>
        <label style={styles.label}>
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
    );
  }

  setReadyForReview(isReadyForReview) {
    this.setState({
      loadingReviewableState: true,
      errorSavingReviewableProject: false
    });

    if (isReadyForReview) {
      const {
        channelId,
        serverLevelId,
        serverScriptId
      } = getStore().getState().pageConstants;
      codeReviewDataApi
        .enablePeerReview(
          channelId,
          serverLevelId,
          serverScriptId,
          this.state.token
        )
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
      codeReviewDataApi
        .disablePeerReview(this.state.reviewableProjectId, this.state.token)
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
    if (this.state.isReadyForReview || this.props.viewAs === ViewType.Teacher) {
      return (
        <CommentEditor
          onNewCommentSubmit={this.onNewCommentSubmit}
          key={forceRecreateEditorKey}
        />
      );
    }

    return (
      <div style={styles.messageText}>
        {javalabMsg.disabledPeerReviewMessage()}
      </div>
    );
  }

  renderPeerDropdown(reviewablePeers, onSelectPeer) {
    return (
      <PeerSelectDropdown
        text={javalabMsg.reviewClassmateProject()}
        peers={reviewablePeers}
        onSelectPeer={onSelectPeer}
      />
    );
  }

  renderBackToMyProject(onClickBackToProject) {
    return (
      <Button
        text={javalabMsg.returnToMyProject()}
        color={Button.ButtonColor.white}
        icon={'caret-left'}
        size={Button.ButtonSize.default}
        iconStyle={styles.backToProjectIcon}
        onClick={onClickBackToProject}
        style={styles.backToProjectButton}
      />
    );
  }

  render() {
    const {viewAsCodeReviewer, viewAs} = this.props;

    const {
      comments,
      forceRecreateEditorKey,
      isReadyForReview,
      errorSavingReviewableProject,
      errorLoadingReviewblePeers,
      reviewablePeers,
      projectOwnerName
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
    } else {
      return (
        <div style={styles.reviewsContainer}>
          <div style={styles.reviewHeader}>
            {viewAs !== ViewType.Teacher &&
              !errorLoadingReviewblePeers &&
              (viewAsCodeReviewer
                ? this.renderBackToMyProject(this.onClickBackToProject)
                : this.renderPeerDropdown(reviewablePeers, this.onSelectPeer))}
            {this.renderReadyForReviewCheckbox()}
          </div>
          {errorSavingReviewableProject && (
            <div style={styles.peerReviewErrorMessage}>
              {javalabMsg.togglePeerReviewError()}
            </div>
          )}
          <div style={styles.commentsSection}>
            <div style={styles.messageText}>
              {viewAsCodeReviewer || viewAs === ViewType.Teacher
                ? javalabMsg.feedbackBeginningPeer({
                    peerName: projectOwnerName
                  })
                : javalabMsg.feedbackBeginning()}
            </div>
            {this.renderComments(
              comments,
              !isReadyForReview && viewAs !== ViewType.Teacher
            )}
            {this.renderCommentEditor(forceRecreateEditorKey)}
          </div>
        </div>
      );
    }
  }
}

export const UnconnectedReviewTab = ReviewTab;
export default connect(state => ({
  viewAsCodeReviewer: state.pageConstants.isCodeReviewing,
  viewAs: state.viewAs
}))(ReviewTab);

const styles = {
  reviewsContainer: {
    margin: '25px 5%'
  },
  label: {
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
    fontSize: '12px',
    marginBottom: '25px'
  },
  messageText: {
    fontSize: '18px',
    marginBottom: '25px',
    textAlign: 'center',
    fontStyle: 'italic',
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
  backToProjectIcon: {
    // The back to project icon is styled to be the same size and placement
    // as the dropdown icon (see Dropdown.js)
    fontSize: 24,
    position: 'relative',
    top: 3
  },
  backToProjectButton: {
    margin: 0,
    paddingTop: 0
  }
};
