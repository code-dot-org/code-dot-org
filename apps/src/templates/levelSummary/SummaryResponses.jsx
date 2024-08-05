import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useState, useMemo} from 'react';
import {connect} from 'react-redux';

import SectionSelector from '@cdo/apps/code-studio/components/progress/SectionSelector';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import Toggle from '@cdo/apps/componentLibrary/toggle';
import DCDO from '@cdo/apps/dcdo';
import {PredictQuestionType} from '@cdo/apps/lab2/levelEditors/types';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/utils/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/utils/AnalyticsReporter';
import i18n from '@cdo/locale';

import FreeResponseResponses from './FreeResponseResponses';
import MultiResponses from './MultiResponses';

import styles from './summary.module.scss';

const FREE_RESPONSE = 'FreeResponse';
const MULTI = 'Multi';

const SummaryResponses = ({
  scriptData,
  // redux
  isRtl,
  viewAs,
  hasSections,
  selectedSection,
  students,
  currentLevelId,
  levels,
}) => {
  const currentLevel = levels.find(l => l.activeId === currentLevelId);
  const predictSettings = scriptData.level.properties?.predict_settings;
  const isFreeResponse =
    scriptData.level.type === FREE_RESPONSE ||
    predictSettings?.questionType === PredictQuestionType.FreeResponse;
  const isMulti =
    scriptData.level.type === MULTI ||
    predictSettings?.questionType === PredictQuestionType.MultipleChoice;

  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [showStudentNames, setShowStudentNames] = useState(false);

  // To avoid confusion, if a teacher tries to view the summary as a student,
  // send them back to the level in Participant mode instead.
  if (viewAs === ViewType.Participant) {
    document.location.replace(currentLevel.url + document.location.search);
  }

  const logEvent = useCallback(
    eventName => {
      const {level} = scriptData;
      analyticsReporter.sendEvent(
        eventName,
        {
          levelId: level.id,
          levelName: level.name,
          levelType: level.type,
          sectionSelected: !!selectedSection,
          ...scriptData.reportingData,
        },
        PLATFORMS.BOTH
      );
    },
    [scriptData, selectedSection]
  );

  const eventData = useMemo(() => {
    return {
      levelId: scriptData.level.id,
      levelName: scriptData.level.name,
      curriculumUmbrella: scriptData.reportingData.curriculumUmbrella,
      unitId: scriptData.reportingData.unitId,
    };
  }, [scriptData]);

  useEffect(() => {
    logEvent(EVENTS.SUMMARY_PAGE_LOADED);
  }, [logEvent]);

  useEffect(() => {
    const correctAnswerElement = document.getElementById(
      'summary-correct-answer'
    );
    const predictAnswerElement = document.getElementById(
      'summary-predict-correct-answer'
    );
    const showOrHideAnswer = answerElement => {
      if (answerElement) {
        if (showCorrectAnswer) {
          answerElement.classList.add(styles.correctAnswersContainer);
          answerElement.classList.remove('hide');
        } else {
          answerElement.classList.add('hide');
          answerElement.classList.remove(styles.correctAnswersContainer);
        }
      }
    };

    showOrHideAnswer(correctAnswerElement);
    showOrHideAnswer(predictAnswerElement);
  }, [showCorrectAnswer]);

  // "Show correct answer" toggle is only shown for some level types, and
  // only when the policy allows it for that user.
  const showAnswerToggle = scriptData.answer_is_visible && isMulti;

  const toggleNames = () => {
    if (showStudentNames) {
      logEvent(EVENTS.CFU_NAMES_TOGGLED_OFF);
    } else {
      logEvent(EVENTS.CFU_NAMES_TOGGLED_ON);
    }
    setShowStudentNames(prevShowStudentNames => !prevShowStudentNames);
  };

  return (
    <div className={styles.summaryContainer} id="summary-container">
      {/* Student Responses */}
      <div className={styles.studentResponses}>
        <h2>{i18n.studentResponses()}</h2>

        {selectedSection && (
          <div
            className={
              isRtl
                ? styles.studentsSubmittedLeft
                : styles.studentsSubmittedRight
            }
          >
            <p>
              <i className="fa fa-user" />
              <span>
                {scriptData.responses.length}/{students.length}{' '}
                {i18n.studentsAnswered()}
              </span>
            </p>
          </div>
        )}

        <div className={styles.headerContainer}>
          {/* Section dropdown */}
          {hasSections && (
            <label className={styles.sectionSelector}>
              {i18n.responsesForClassSection()}
              <SectionSelector reloadOnChange={true} />
            </label>
          )}

          {/* Correct answer toggle */}
          {showAnswerToggle && (
            <div className={styles.toggleContainer}>
              <Toggle
                onChange={() => {
                  setShowCorrectAnswer(!showCorrectAnswer);
                }}
                checked={showCorrectAnswer}
                label={i18n.showAnswer()}
                position={'right'}
                size={'s'}
                name={'summary-correct-answer'}
              />
            </div>
          )}
          {isFreeResponse && DCDO.get('cfu-pin-hide-enabled', false) && (
            <Toggle
              onChange={toggleNames}
              checked={showStudentNames}
              label={i18n.showStudentNames()}
              position={'right'}
              size={'s'}
              name={'showStudentNames'}
            />
          )}
        </div>

        {/* Free response visualization */}
        {isFreeResponse && (
          <FreeResponseResponses
            responses={scriptData.responses}
            showStudentNames={showStudentNames}
            eventData={eventData}
          />
        )}

        {/* Multi visualization */}
        {isMulti && (
          <MultiResponses
            scriptData={scriptData}
            showCorrectAnswer={showCorrectAnswer}
          />
        )}
      </div>
    </div>
  );
};

SummaryResponses.propTypes = {
  scriptData: PropTypes.object,
  isRtl: PropTypes.bool,
  viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
  hasSections: PropTypes.bool,
  selectedSection: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  }),
  students: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string,
    })
  ),
  currentLevelId: PropTypes.string,
  levels: PropTypes.arrayOf(
    PropTypes.shape({
      activeId: PropTypes.string.isRequired,
      position: PropTypes.number.isRequired,
    })
  ),
};

export default connect(
  // NOTE: Some of this state data is loaded in by the teacher panel. If you
  // remove the teacher panel, or try to use this component on a page without
  // the teacher panel, it will require extra steps to load in the data.
  state => {
    const currentLesson = state.progress.lessons.find(
      l => l.id === state.progress.currentLessonId
    );

    return {
      isRtl: state.isRtl,
      viewAs: state.viewAs,
      hasSections: state.teacherSections.sectionIds.length > 0,
      selectedSection:
        state.teacherSections.sections[state.teacherSections.selectedSectionId],
      students: state.teacherSections.selectedStudents,
      currentLevelId: state.progress.currentLevelId,
      levels: currentLesson.levels,
    };
  }
)(SummaryResponses);
