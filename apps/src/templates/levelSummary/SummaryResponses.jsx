import React, {useCallback, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import SectionSelector from '@cdo/apps/code-studio/components/progress/SectionSelector';
import i18n from '@cdo/locale';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import ToggleSwitch from '@cdo/apps/code-studio/components/ToggleSwitch';
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

  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  // To avoid confusion, if a teacher tries to view the summary as a student,
  // send them back to the level in Participant mode instead.
  if (viewAs === ViewType.Participant) {
    document.location.replace(currentLevel.url + document.location.search);
  }

  const logEvent = useCallback(
    eventName => {
      const {level} = scriptData;
      analyticsReporter.sendEvent(eventName, {
        levelId: level.id,
        levelName: level.name,
        levelType: level.type,
        sectionSelected: !!selectedSection,
        ...scriptData.reportingData,
      });
    },
    [scriptData, selectedSection]
  );

  useEffect(() => {
    logEvent(EVENTS.SUMMARY_PAGE_LOADED);
  }, [logEvent]);

  useEffect(() => {
    const correctAnswerElement = document.getElementById(
      'summary-correct-answer'
    );
    if (correctAnswerElement) {
      if (showCorrectAnswer) {
        correctAnswerElement.classList.add(styles.correctAnswersContainer);
        correctAnswerElement.classList.remove('hide');
      } else {
        correctAnswerElement.classList.add('hide');
        correctAnswerElement.classList.remove(styles.correctAnswersContainer);
      }
    }
  }, [showCorrectAnswer]);

  // "Show correct answer" toggle is only shown for some level types, and
  // only when the policy allows it for that user.
  const showAnswerToggle =
    scriptData.answer_is_visible && scriptData.level.type === MULTI;

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
            <ToggleSwitch
              isToggledOn={showCorrectAnswer}
              onToggle={() => {
                setShowCorrectAnswer(!showCorrectAnswer);
              }}
              label={i18n.showAnswer()}
              expands="summary-correct-answer"
            />
          </div>
        )}

        {/* Free response visualization */}
        {scriptData.level.type === FREE_RESPONSE && (
          <FreeResponseResponses responses={scriptData.responses} />
        )}

        {/* Multi visualization */}
        {scriptData.level.type === MULTI && (
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
