import React, {useState, useEffect, useCallback, useMemo} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import color from '@cdo/apps/util/color';
import {updateQueryParam} from '@cdo/apps/code-studio/utils';
import javalabMsg from '@cdo/javalab/locale';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import CodeReviewDataApi from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewDataApi';
import ReviewNavigator from '@cdo/apps/templates/instructions/codeReviewV2/ReviewNavigator';
import CodeReviewTimeline from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewTimeline';
import Button from '@cdo/apps/templates/Button';
import {setIsReadOnlyWorkspace} from '@cdo/apps/javalab/javalabRedux';
import project from '@cdo/apps/code-studio/initApp/project';
import CodeReviewError from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewError';

// Duplicated in ProgressBubble because of import issue,
// update there as well if changed.
export const SHOW_REVIEW_TAB_URL_PARAM = 'showReviewTab';

const CommitsAndReviewTab = props => {
  const {
    channelId,
    serverLevelId,
    serverProjectLevelId,
    serverScriptId,
    viewAsCodeReviewer,
    viewAsTeacher,
    userIsTeacher,
    codeReviewEnabled,
    locale,
    isReadOnlyWorkspace,
    setIsReadOnlyWorkspace
  } = props;

  const [isLoadingTimelineData, setIsLoadingTimelineData] = useState(false);
  const [openReviewData, setOpenReviewData] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [timelineLoadingError, setTimelineLoadingError] = useState(null);
  const [openReviewError, setOpenReviewError] = useState(null);

  const dataApi = useMemo(
    () =>
      new CodeReviewDataApi(
        channelId,
        serverLevelId,
        serverProjectLevelId,
        serverScriptId,
        locale
      ),
    [channelId, serverLevelId, serverProjectLevelId, serverScriptId, locale]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Explicitly remove URL param that opens review tab so that when users navigate between
  // levels via the bubble navigation in the header,
  // the review tab does not auto-open instead of the instructions.
  useEffect(() => {
    updateQueryParam(SHOW_REVIEW_TAB_URL_PARAM, undefined, true);
  }, []);

  const refresh = useCallback(async () => {
    setIsLoadingTimelineData(true);
    try {
      const {timelineData, openReview} = await dataApi.getInitialTimelineData();
      setTimelineData(timelineData);
      setOpenReviewData(openReview);
      setTimelineLoadingError(false);
    } catch (err) {
      console.log(err);
      setTimelineLoadingError(true);
    }
    setIsLoadingTimelineData(false);
  }, [dataApi]);

  const loadPeers = async (onSuccess, onFailure) => {
    try {
      const response = await dataApi.getReviewablePeers();
      onSuccess(response);
    } catch (err) {
      onFailure(err);
    }
  };

  const addCodeReviewComment = async (
    commentText,
    reviewId,
    onSuccess,
    onFailure
  ) => {
    try {
      const newComment = await dataApi.submitNewCodeReviewComment(
        commentText,
        reviewId
      );
      setOpenReviewData({
        ...openReviewData,
        comments: [...openReviewData.comments, newComment]
      });
      onSuccess();
    } catch (err) {
      console.log(err);
      onFailure();
    }
  };

  const toggleResolveComment = async (
    commentId,
    isResolved,
    onSuccess,
    onFailure
  ) => {
    try {
      const comment = await dataApi.toggleResolveComment(commentId, isResolved);
      onSuccess(comment);
    } catch (err) {
      console.log(err);
      onFailure();
    }
  };

  const deleteCodeReviewComment = async (commentId, onSuccess, onFailure) => {
    try {
      await dataApi.deleteCodeReviewComment(commentId);
      onSuccess();
    } catch (err) {
      console.log(err);
      onFailure();
    }
  };

  const handleCloseReview = async (onSuccess, onFailure) => {
    try {
      const closedReview = await dataApi.closeReview(openReviewData.id);
      setTimelineData([...timelineData, closedReview]);
      setOpenReviewData(null);
      setIsReadOnlyWorkspace(false);
      onSuccess();
    } catch (err) {
      console.log(err);
      onFailure();
    }
  };

  const handleOpenReview = async () => {
    try {
      await project.save(true);
      const currentVersion = project.getCurrentSourceVersionId();
      const newReview = await dataApi.openNewCodeReview(currentVersion);
      setOpenReviewData(newReview);
      setIsReadOnlyWorkspace(true);
      setOpenReviewError(false);
    } catch (err) {
      console.log(err);
      setOpenReviewError(true);
    }
  };

  // channelId is not available on projects where the student has not edited the starter code.
  // comments cannot be made on projects in this state.
  if (!channelId) {
    return (
      <div style={{...styles.reviewsContainer, ...styles.messageText}}>
        {javalabMsg.noCodeReviewUntilStudentEditsCode()}
      </div>
    );
  }

  if (isLoadingTimelineData) {
    return (
      <div style={styles.loadingContainer}>
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div style={styles.reviewsContainer}>
      <div style={styles.header}>
        <div style={styles.navigator}>
          {codeReviewEnabled && !viewAsTeacher && (
            <ReviewNavigator
              viewPeerList={!viewAsCodeReviewer}
              loadPeers={loadPeers}
              dropdownText={javalabMsg.youHaveProjectsToReview()}
              teacherAccountViewingAsParticipant={
                userIsTeacher && !viewAsTeacher
              }
            />
          )}
        </div>
        <div style={styles.refreshButtonContainer}>
          <Button
            key="refresh"
            icon="refresh"
            text={javalabMsg.refresh()}
            onClick={refresh}
            color={Button.ButtonColor.blue}
            style={styles.refreshButtonStyle}
            className="review-refresh-button"
          />
        </div>
      </div>
      {timelineLoadingError ? (
        <CodeReviewError />
      ) : (
        <>
          <CodeReviewTimeline
            timelineData={[
              ...timelineData,
              ...(openReviewData ? [openReviewData] : [])
            ]}
            addCodeReviewComment={addCodeReviewComment}
            closeReview={handleCloseReview}
            toggleResolveComment={toggleResolveComment}
            deleteCodeReviewComment={deleteCodeReviewComment}
          />
          {!openReviewData && !isReadOnlyWorkspace && (
            <div style={styles.timelineAligned}>
              <Button
                icon="comment"
                onClick={handleOpenReview}
                text={javalabMsg.startReview()}
                color={Button.ButtonColor.blue}
                disabled={!codeReviewEnabled}
              />
              {openReviewError && <CodeReviewError />}
            </div>
          )}
          {!codeReviewEnabled && (
            <div
              style={{
                ...styles.timelineAligned,
                ...styles.reviewDisabledMsg
              }}
            >
              {javalabMsg.codeReviewDisabledMessage()}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export const UnconnectedCommitsAndReviewTab = CommitsAndReviewTab;
export default connect(
  state => ({
    codeReviewEnabled: state.instructions.codeReviewEnabledForLevel,
    viewAsCodeReviewer: state.pageConstants.isCodeReviewing,
    viewAsTeacher: state.viewAs === ViewType.Instructor,
    userIsTeacher: state.currentUser.userType === 'teacher',
    channelId: state.pageConstants.channelId,
    serverLevelId: state.pageConstants.serverLevelId,
    serverProjectLevelId: state.pageConstants.serverProjectLevelId,
    serverScriptId: state.pageConstants.serverScriptId,
    locale: state.pageConstants.locale,
    isReadOnlyWorkspace: state.javalab.isReadOnlyWorkspace
  }),
  dispatch => ({
    setIsReadOnlyWorkspace: isReadOnly =>
      dispatch(setIsReadOnlyWorkspace(isReadOnly))
  })
)(CommitsAndReviewTab);

CommitsAndReviewTab.propTypes = {
  // Populated by redux
  codeReviewEnabled: PropTypes.bool,
  viewAsCodeReviewer: PropTypes.bool.isRequired,
  viewAsTeacher: PropTypes.bool,
  userIsTeacher: PropTypes.bool,
  channelId: PropTypes.string,
  serverLevelId: PropTypes.number,
  serverProjectLevelId: PropTypes.number,
  serverScriptId: PropTypes.number,
  locale: PropTypes.string,
  isReadOnlyWorkspace: PropTypes.bool,
  setIsReadOnlyWorkspace: PropTypes.func.isRequired
};

const styles = {
  loadingContainer: {
    display: 'flex',
    margin: '25px',
    justifyContent: 'center'
  },
  reviewsContainer: {
    margin: '0px 5px 25px 16px'
  },
  header: {
    display: 'flex',
    flexWrap: 'wrap-reverse',
    justifyContent: 'space-between',
    margin: '5px 0'
  },
  refreshButtonContainer: {
    margin: '5px 0'
  },
  navigator: {
    margin: '5px 0'
  },
  messageText: {
    fontSize: 13,
    margin: '15px 5px 25px 16px',
    color: color.light_gray
  },
  refreshButtonStyle: {
    fontSize: 13,
    margin: 0
  },
  timelineAligned: {
    marginLeft: '30px'
  },
  reviewDisabledMsg: {
    padding: '12px 6px',
    fontStyle: 'italic',
    color: color.charcoal,
    lineHeight: '22px'
  }
};
