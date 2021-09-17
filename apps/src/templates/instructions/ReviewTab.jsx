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
    onLoadComplete: PropTypes.func,
    // Populated by redux
    codeReviewEnabled: PropTypes.bool,
    viewAsCodeReviewer: PropTypes.bool.isRequired,
    viewAs: PropTypes.oneOf(Object.keys(ViewType))
  };

  state = {
    initialLoadCompleted: false,
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
    projectOwnerName: '',
    authorizationError: false
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
      this.setState({initialLoadCompleted: true});
      return;
    }

    const initialLoadPromises = [];

    initialLoadPromises.push(
      new Promise((resolve, reject) => {
        codeReviewDataApi
          .getCodeReviewCommentsForProject(channelId)
          .done((data, _, request) => {
            this.setState({
              comments: data,
              token: request.getResponseHeader('csrf-token')
            });
            resolve();
          });
      })
    );

    initialLoadPromises.push(
      new Promise((resolve, reject) => {
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
            resolve();
          })
          .fail(() => {
            this.setState({
              reviewCheckboxEnabled: false,
              isReadyForReview: false
            });
            reject();
          });
      })
    );

    if (
      !this.props.viewAsCodeReviewer &&
      this.props.viewAs !== ViewType.Teacher
    ) {
      initialLoadPromises.push(
        new Promise((resolve, reject) => {
          codeReviewDataApi
            .getReviewablePeers(channelId, serverLevelId, serverScriptId)
            .done(data => {
              this.setState({
                reviewablePeers: _.chain(data)
                  .filter(peerEntry => peerEntry && peerEntry.length === 2)
                  .map(peerEntry => ({id: peerEntry[0], name: peerEntry[1]}))
                  .value()
              });
              resolve();
            })
            .fail(() => {
              this.setState({
                errorLoadingReviewblePeers: true
              });
              reject();
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

  onNewCommentSubmit = commentText => {
    const {
      channelId,
      serverScriptId,
      serverLevelId
    } = getStore().getState().pageConstants;
    const {token} = this.state;

    codeReviewDataApi
      .submitNewCodeReviewComment(
        commentText,
        channelId,
        serverScriptId,
        serverLevelId,
        token
      )
      .done(newComment => {
        const comments = this.state.comments;
        comments.push(newComment);

        this.setState({
          comments: comments,
          forceRecreateEditorKey: this.state.forceRecreateEditorKey + 1
        });
      })
      .fail(result => {
        if (result.status === 404) {
          this.setState({authorizationError: true});
        }
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
      !this.props.codeReviewEnabled ||
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
    if (
      !this.state.authorizationError &&
      (this.state.isReadyForReview || this.props.viewAs === ViewType.Teacher)
    ) {
      return (
        <CommentEditor
          onNewCommentSubmit={this.onNewCommentSubmit}
          key={forceRecreateEditorKey}
        />
      );
    }
    if (this.state.authorizationError) {
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

  renderPeerDropdown(reviewablePeers, onSelectPeer) {
    const {codeReviewEnabled, viewAsCodeReviewer, viewAs} = this.props;
    const {errorLoadingReviewblePeers} = this.state;

    if (
      viewAs === ViewType.Teacher ||
      errorLoadingReviewblePeers ||
      !codeReviewEnabled ||
      viewAsCodeReviewer ||
      reviewablePeers.length === 0
    ) {
      return null;
    }

    return (
      <PeerSelectDropdown
        text={javalabMsg.reviewClassmateProject()}
        peers={reviewablePeers}
        onSelectPeer={onSelectPeer}
      />
    );
  }

  renderBackToMyProject(onClickBackToProject) {
    const {codeReviewEnabled, viewAsCodeReviewer, viewAs} = this.props;
    const {errorLoadingReviewblePeers} = this.state;

    if (
      viewAs === ViewType.Teacher ||
      errorLoadingReviewblePeers ||
      !codeReviewEnabled ||
      !viewAsCodeReviewer
    ) {
      return null;
    }
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
      initialLoadCompleted,
      comments,
      forceRecreateEditorKey,
      isReadyForReview,
      errorSavingReviewableProject,
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
            {this.renderBackToMyProject(this.onClickBackToProject)}
            {this.renderPeerDropdown(reviewablePeers, this.onSelectPeer)}
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
  codeReviewEnabled: state.sectionData.section.codeReviewEnabled,
  viewAsCodeReviewer: state.pageConstants.isCodeReviewing,
  viewAs: state.viewAs
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
  },
  reviewDisabledText: {
    fontStyle: 'italic'
  }
};
