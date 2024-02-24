import React, {useCallback, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import style from './rubrics.module.scss';
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

const TAB_NAMES = {
  RUBRIC: 'rubric',
  SETTINGS: 'settings',
};

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

  const [selectedTab, setSelectedTab] = useState(TAB_NAMES.RUBRIC);
  const [aiEvaluations, setAiEvaluations] = useState(null);

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

  // Currently the settings tab only provides a way to manually run AI.
  // In the future, we should update or remove this conditional when we
  // add more functionality to the settings tab.
  const showSettings = onLevelForEvaluation && teacherHasEnabledAi;

  return (
    <div
      className={classnames(style.rubricContainer, {
        [style.hiddenRubricContainer]: !open,
      })}
    >
      <div className={style.rubricHeaderRedesign}>
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
        />
        {showSettings && (
          <RubricSettings
            visible={selectedTab === TAB_NAMES.SETTINGS}
            rubric={rubric}
            sectionId={sectionId}
          />
        )}
      </div>
    </div>
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
