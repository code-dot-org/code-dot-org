import {Typography} from '@mui/material';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import i18n from '@cdo/locale';

import LearningGoals from './LearningGoals';
import {
  aiEvaluationShape,
  reportingDataShape,
  rubricShape,
  studentLevelInfoShape,
} from './rubricShapes';
import SectionSelector from './SectionSelector';
import StudentSelector from './StudentSelector';

import style from './rubrics.module.scss';

const formatTimeSpent = timeSpent => {
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;

  return i18n.timeSpent({minutes, seconds});
};

const formatLastAttempt = lastAttempt => {
  const date = new Date(lastAttempt);
  return i18n.levelLastUpdated({
    lastUpdatedDate: date.toLocaleDateString(),
  });
};

export default function RubricContent({
  productTour,
  studentLevelInfo,
  rubric,
  open,
  teacherHasEnabledAi,
  canProvideFeedback,
  onLevelForEvaluation,
  reportingData,
  visible,
  aiEvaluations,
  feedbackAdded,
  setFeedbackAdded,
  sectionId,
  reloadOnStudentChange = true,
}) {
  const {lesson} = rubric;
  const rubricLevel = rubric.level;

  let infoText = null;
  if (!onLevelForEvaluation) {
    infoText = i18n.rubricCanOnlyBeEvaluatedOnProjectLevelAlert();
  } else if (!sectionId) {
    infoText = i18n.selectASectionToEvaluateAlert();
  } else if (!studentLevelInfo) {
    infoText = i18n.selectAStudentToEvaluateAlert();
  }

  return (
    <div
      id="uitest-rubric-content"
      className={classnames({
        [style.visibleRubricContent]: visible,
        [style.hiddenRubricContent]: !visible,
      })}
    >
      {infoText && <InfoAlert text={infoText} />}
      <div className={style.studentInfoGroup}>
        <Typography variant="h3" gutterBottom>
          {lesson?.title}
        </Typography>

        <div className={style.selectors}>
          <SectionSelector reloadOnChange={true} />
          <StudentSelector
            styleName={style.studentSelector}
            selectedUserId={studentLevelInfo ? studentLevelInfo.user_id : null}
            reloadOnChange={reloadOnStudentChange}
            sectionId={sectionId}
            reportingData={reportingData}
          />
        </div>

        {!!studentLevelInfo && (
          <div className={style.studentInfo}>
            <div className={style.levelAndStudentDetails}>
              {onLevelForEvaluation && (
                <div className={style.studentMetadata}>
                  {studentLevelInfo.timeSpent && (
                    <Typography
                      className={style.singleMetadatum}
                      variant="body3"
                      gutterBottom
                    >
                      <FontAwesome icon="clock" />
                      <span>{formatTimeSpent(studentLevelInfo.timeSpent)}</span>
                    </Typography>
                  )}
                  <Typography
                    className={style.singleMetadatum}
                    variant="body3"
                    gutterBottom
                  >
                    <FontAwesome icon="rocket" />
                    {i18n.numAttempts({
                      numAttempts: studentLevelInfo.attempts || 0,
                    })}
                  </Typography>
                  {studentLevelInfo.lastAttempt && (
                    <Typography
                      className={style.singleMetadatum}
                      variant="body3"
                      gutterBottom
                    >
                      <FontAwesome icon="calendar" />
                      <span>
                        {formatLastAttempt(studentLevelInfo.lastAttempt)}
                      </span>
                    </Typography>
                  )}
                </div>
              )}
              {!onLevelForEvaluation && rubricLevel?.position && (
                <Typography variant="body3" gutterBottom>
                  {i18n.feedbackAvailableOnLevel({
                    levelPosition: rubricLevel.position,
                  })}
                </Typography>
              )}
            </div>
          </div>
        )}
      </div>
      <div className={style.learningGoalsWrapper}>
        <Typography variant="h4" gutterBottom>
          {i18n.rubric()}
        </Typography>
        <LearningGoals
          productTour={productTour}
          open={open}
          learningGoals={rubric.learningGoals}
          teacherHasEnabledAi={teacherHasEnabledAi}
          canProvideFeedback={canProvideFeedback}
          reportingData={reportingData}
          studentLevelInfo={studentLevelInfo}
          isStudent={false}
          feedbackAdded={feedbackAdded}
          setFeedbackAdded={setFeedbackAdded}
          aiEvaluations={aiEvaluations}
        />
      </div>
    </div>
  );
}

RubricContent.propTypes = {
  productTour: PropTypes.bool,
  onLevelForEvaluation: PropTypes.bool,
  canProvideFeedback: PropTypes.bool,
  rubric: rubricShape.isRequired,
  open: PropTypes.bool,
  reportingData: reportingDataShape,
  studentLevelInfo: studentLevelInfoShape,
  teacherHasEnabledAi: PropTypes.bool,
  visible: PropTypes.bool,
  aiEvaluations: PropTypes.arrayOf(aiEvaluationShape),
  feedbackAdded: PropTypes.bool,
  setFeedbackAdded: PropTypes.func,
  sectionId: PropTypes.number,
  reloadOnStudentChange: PropTypes.bool,
};

export const InfoAlert = ({text, dismissable}) => {
  const [closed, setClosed] = useState(false);
  const closeButtonCallback = () => {
    setClosed(true);
  };

  return (
    <div
      className={classnames('uitest-info-alert', {
        [style.infoAlert]: !closed,
        [style.infoAlertClosed]: !!closed,
      })}
      // eslint-disable-next-line react/forbid-dom-props
      data-testid="info-alert"
    >
      <div className={style.infoAlertLeft}>
        <FontAwesome
          icon="info-circle"
          className={style.infoAlertIcon}
          title="info circle icon"
        />
        <Typography variant="body2" gutterBottom>
          {text}
        </Typography>
      </div>
      {!!dismissable && (
        <button
          type="button"
          onClick={closeButtonCallback}
          className={classnames('close', style.infoAlertRight)}
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      )}
    </div>
  );
};

InfoAlert.propTypes = {
  text: PropTypes.string.isRequired,
  dismissable: PropTypes.bool,
};
