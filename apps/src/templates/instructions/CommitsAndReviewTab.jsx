import React, {useState, useEffect, useCallback, useMemo} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import color from '@cdo/apps/util/color';
import javalabMsg from '@cdo/javalab/locale';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import CodeReviewDataApi from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewDataApi';
import ReviewNavigator from '@cdo/apps/templates/instructions/codeReviewV2/ReviewNavigator';
import CodeReviewTimeline from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewTimeline';
import Button from '@cdo/apps/templates/Button';

export const VIEWING_CODE_REVIEW_URL_PARAM = 'viewingCodeReview';

const CommitsAndReviewTab = props => {
  const {
    channelId,
    serverLevelId,
    serverScriptId,
    viewAsCodeReviewer,
    viewAsTeacher,
    userIsTeacher,
    codeReviewEnabled
  } = props;

  const [loadingReviewData, setLoadingReviewData] = useState(false);
  const [reviewData, setReviewData] = useState([]);
  const [commitsData, setCommitsData] = useState([]);
  const [hasOpenCodeReview, setHasOpenCodeReview] = useState(null);

  const dataApi = useMemo(
    () => new CodeReviewDataApi(channelId, serverLevelId, serverScriptId),
    [channelId, serverLevelId, serverScriptId]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const refresh = useCallback(async () => {
    setLoadingReviewData(true);
    try {
      const [codeReviews, commits] = await Promise.all([
        dataApi.getCodeReviews(),
        dataApi.getCommits()
      ]);
      setCommitsData(commits);
      setReviewData(codeReviews);
      setIsCodeReviewOpen(codeReviews);
    } catch (err) {
      // TODO: display error message TBD
      console.log(err);
    }
    setLoadingReviewData(false);
  }, [dataApi]);

  const setIsCodeReviewOpen = reviewData => {
    if (reviewData.length) {
      const mostRecentReview = reviewData[reviewData.length - 1];
      setHasOpenCodeReview(!mostRecentReview.isClosed);
    }
  };

  const loadPeers = async (onSuccess, onFailure) => {
    try {
      const response = await dataApi.getReviewablePeers();
      onSuccess(response);
    } catch (err) {
      onFailure(err);
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

  if (loadingReviewData) {
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
      <CodeReviewTimeline reviewData={reviewData} commitsData={commitsData} />
      {!hasOpenCodeReview && (
        <Button
          icon="comment"
          onClick={() => {}}
          text={javalabMsg.startReview()}
          color={Button.ButtonColor.blue}
          style={styles.openCodeReview}
        />
      )}
    </div>
  );
};

export const UnconnectedCommitsAndReviewTab = CommitsAndReviewTab;
export default connect(state => ({
  codeReviewEnabled: state.instructions.codeReviewEnabledForLevel,
  viewAsCodeReviewer: state.pageConstants.isCodeReviewing,
  viewAsTeacher: state.viewAs === ViewType.Instructor,
  userIsTeacher: state.currentUser.userType === 'teacher',
  channelId: state.pageConstants.channelId,
  serverLevelId: state.pageConstants.serverLevelId,
  serverScriptId: state.pageConstants.serverScriptId
}))(CommitsAndReviewTab);

CommitsAndReviewTab.propTypes = {
  // Populated by redux
  codeReviewEnabled: PropTypes.bool,
  viewAsCodeReviewer: PropTypes.bool.isRequired,
  viewAsTeacher: PropTypes.bool,
  userIsTeacher: PropTypes.bool,
  channelId: PropTypes.string,
  serverLevelId: PropTypes.number,
  serverScriptId: PropTypes.number
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
    marginBottom: '25px',
    color: color.light_gray
  },
  refreshButtonStyle: {
    fontSize: 13,
    margin: 0
  },
  openCodeReview: {
    marginLeft: '30px'
  }
};
