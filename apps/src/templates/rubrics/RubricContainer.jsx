import React, {useCallback, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import style from './rubrics.module.scss';
import i18n from '@cdo/locale';
import classnames from 'classnames';
import {Heading6} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {
  reportingDataShape,
  rubricShape,
  studentLevelInfoShape,
} from './rubricShapes';
import RubricContent from './RubricContent';
import RubricSettings from './RubricSettings';
import RubricTabButtons from './RubricTabButtons';
import RubricSubmitFooter from './RubricSubmitFooter';
import {tryGetSessionStorage, trySetSessionStorage} from '@cdo/apps/utils';
import Draggable from 'react-draggable';
import {TAB_NAMES} from './rubricHelpers';
import aiBotOutlineIcon from '@cdo/static/ai-bot-outline.png';

export default function RubricContainer({
  rubric,
  studentLevelInfo,
  teacherHasEnabledAi,
  currentLevelName,
  reportingData,
  open,
  closeRubric,
  sectionId,
}) {
  const onLevelForEvaluation = currentLevelName === rubric.level.name;
  const canProvideFeedback = !!studentLevelInfo && onLevelForEvaluation;
  const rubricTabSessionKey = 'rubricFABTabSessionKey';
  const rubricPositionX = 'rubricFABPositionX';
  const rubricPositionY = 'rubricFABPositionY';

  const [selectedTab, setSelectedTab] = useState(
    tryGetSessionStorage(rubricTabSessionKey, TAB_NAMES.RUBRIC) ||
      TAB_NAMES.RUBRIC
  );

  const [positionX, setPositionX] = useState(
    parseInt(tryGetSessionStorage(rubricPositionX, 0)) || 0
  );

  const [positionY, setPositionY] = useState(
    parseInt(tryGetSessionStorage(rubricPositionY, 0)) || 0
  );

  const [aiEvaluations, setAiEvaluations] = useState(null);

  const [feedbackAdded, setFeedbackAdded] = useState(false);

  const tabSelectCallback = tabSelection => {
    setSelectedTab(tabSelection);
  };

  const fetchAiEvaluations = useCallback(() => {
    if (!!studentLevelInfo && teacherHasEnabledAi) {
      const studentId = studentLevelInfo.user_id;
      const rubricId = rubric.id;
      const dataUrl = `/rubrics/${rubricId}/get_ai_evaluations?student_id=${studentId}`;

      fetch(dataUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          setAiEvaluations(data);
        })
        .catch(error => {
          console.log(
            'There was a problem with the fetch operation:',
            error.message
          );
        });
    }
  }, [studentLevelInfo, teacherHasEnabledAi, rubric.id]);

  useEffect(() => {
    fetchAiEvaluations();
  }, [fetchAiEvaluations]);

  useEffect(() => {
    trySetSessionStorage(rubricTabSessionKey, selectedTab);
  }, [selectedTab]);

  useEffect(() => {
    trySetSessionStorage(rubricPositionX, positionX);
  }, [positionX]);

  useEffect(() => {
    trySetSessionStorage(rubricPositionY, positionY);
  }, [positionY]);

  const onStopHandler = (event, dragElement) => {
    setPositionX(dragElement.x);
    setPositionY(dragElement.y);
  };

  // Currently the settings tab only provides a way to manually run AI.
  // In the future, we should update or remove this conditional when we
  // add more functionality to the settings tab.
  const showSettings = onLevelForEvaluation && teacherHasEnabledAi;

  return (
    <Draggable
      defaultPosition={{x: positionX, y: positionY}}
      onStop={onStopHandler}
    >
      <div
        data-testid="draggable-test-id"
        id="draggable-id"
        className={classnames(style.rubricContainer, {
          [style.hiddenRubricContainer]: !open,
        })}
      >
        <div className={style.rubricHeaderRedesign}>
          <div className={style.rubricHeaderLeftSide}>
            <img
              src={aiBotOutlineIcon}
              className={style.aiBotOutlineIcon}
              alt={i18n.rubricAiHeaderText()}
            />
            <span>{i18n.rubricAiHeaderText()}</span>
          </div>
          <div className={style.rubricHeaderRightSide}>
            <button
              type="button"
              onClick={closeRubric}
              className={classnames(style.buttonStyle, style.closeButton)}
            >
              <FontAwesome icon="xmark" />
            </button>
          </div>
        </div>

        <div className={style.fabBackground}>
          <RubricTabButtons
            tabSelectCallback={tabSelectCallback}
            selectedTab={selectedTab}
            showSettings={showSettings}
            canProvideFeedback={canProvideFeedback}
            teacherHasEnabledAi={teacherHasEnabledAi}
            studentUserId={studentLevelInfo && studentLevelInfo['user_id']}
            refreshAiEvaluations={fetchAiEvaluations}
            rubric={rubric}
            studentName={studentLevelInfo && studentLevelInfo.name}
            reportingData={reportingData}
          />

          <RubricContent
            rubric={rubric}
            open={open}
            studentLevelInfo={studentLevelInfo}
            teacherHasEnabledAi={teacherHasEnabledAi}
            canProvideFeedback={canProvideFeedback}
            onLevelForEvaluation={onLevelForEvaluation}
            reportingData={reportingData}
            visible={selectedTab === TAB_NAMES.RUBRIC}
            aiEvaluations={aiEvaluations}
            feedbackAdded={feedbackAdded}
            setFeedbackAdded={setFeedbackAdded}
            sectionId={sectionId}
          />
          {showSettings && (
            <RubricSettings
              visible={selectedTab === TAB_NAMES.SETTINGS}
              refreshAiEvaluations={fetchAiEvaluations}
              rubric={rubric}
              sectionId={sectionId}
              tabSelectCallback={tabSelectCallback}
              reportingData={reportingData}
            />
          )}
        </div>
        {canProvideFeedback && (
          <RubricSubmitFooter
            open={open}
            rubric={rubric}
            reportingData={reportingData}
            studentLevelInfo={studentLevelInfo}
            feedbackAdded={feedbackAdded}
            setFeedbackAdded={setFeedbackAdded}
          />
        )}
      </div>
    </Draggable>
  );
}

RubricContainer.propTypes = {
  rubric: rubricShape,
  reportingData: reportingDataShape,
  studentLevelInfo: studentLevelInfoShape,
  teacherHasEnabledAi: PropTypes.bool,
  currentLevelName: PropTypes.string,
  closeRubric: PropTypes.func,
  open: PropTypes.bool,
  sectionId: PropTypes.number,
};

const HeaderTab = ({text, isSelected, onClick}) => {
  return (
    <button
      className={classnames(
        'uitest-rubric-header-tab',
        style.rubricHeaderTab,
        style.buttonStyle,
        {
          [style.selectedTab]: isSelected,
          [style.unselectedTab]: !isSelected,
        }
      )}
      onClick={onClick}
      type="button"
    >
      <Heading6>{text}</Heading6>
    </button>
  );
};

HeaderTab.propTypes = {
  text: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};
