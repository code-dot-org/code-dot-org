import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import {
  BodyThreeText,
  BodyTwoText,
  Heading3,
  Heading4,
} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
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
        <Heading3>
          {i18n.lessonNumbered({
            lessonNumber: lesson?.position,
            lessonName: lesson?.name,
          })}
        </Heading3>

        <div className={style.selectors}>
          <SectionSelector reloadOnChange={true} />
          <StudentSelector
            styleName={style.studentSelector}
            selectedUserId={studentLevelInfo ? studentLevelInfo.user_id : null}
            reloadOnChange={true}
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
                    <BodyThreeText className={style.singleMetadatum}>
                      <FontAwesome icon="clock" />
                      <span>{formatTimeSpent(studentLevelInfo.timeSpent)}</span>
                    </BodyThreeText>
                  )}
                  <BodyThreeText className={style.singleMetadatum}>
                    <FontAwesome icon="rocket" />
                    {i18n.numAttempts({
                      numAttempts: studentLevelInfo.attempts || 0,
                    })}
                  </BodyThreeText>
                  {studentLevelInfo.lastAttempt && (
                    <BodyThreeText className={style.singleMetadatum}>
                      <FontAwesome icon="calendar" />
                      <span>
                        {formatLastAttempt(studentLevelInfo.lastAttempt)}
                      </span>
                    </BodyThreeText>
                  )}
                </div>
              )}
              {!onLevelForEvaluation && rubricLevel?.position && (
                <BodyThreeText>
                  {i18n.feedbackAvailableOnLevel({
                    levelPosition: rubricLevel.position,
                  })}
                </BodyThreeText>
              )}
            </div>
          </div>
        )}
      </div>
      <div className={style.learningGoalsWrapper}>
        <Heading4>{i18n.rubric()}</Heading4>
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
      data-testid="info-alert"
    >
      <div className={style.infoAlertLeft}>
        <FontAwesome
          icon="info-circle"
          className={style.infoAlertIcon}
          title="info circle icon"
        />
        <BodyTwoText>{text}</BodyTwoText>
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
