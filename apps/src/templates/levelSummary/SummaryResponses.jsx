import React, {useCallback, useEffect} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import SectionSelector from '@cdo/apps/code-studio/components/progress/SectionSelector';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import i18n from '@cdo/locale';
import styles from './check-for-understanding.module.scss';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

const SummaryResponses = ({
  scriptData,
  // redux
  isRtl,
  viewAs,
  selectedSection,
  students,
  currentLevelId,
  levels,
}) => {
  const currentLevel = levels.find(l => l.activeId === currentLevelId);

  // To avoid confusion, if a teacher tries to view the summary as a student,
  // send them back to the level in Participant mode instead.
  if (viewAs === ViewType.Participant) {
    document.location.replace(currentLevel.url + document.location.search);
  }

  const logEvent = useCallback(eventName => {
    const {level} = scriptData;
    analyticsReporter.sendEvent(eventName, {
      levelId: level.id,
      levelName: level.name,
      levelType: level.type,
      sectionSelected: !!selectedSection,
      ...scriptData.reportingData,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    logEvent(EVENTS.SUMMARY_PAGE_LOADED);
  }, [logEvent]);

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

        <label>
          {i18n.responsesForClassSection()}
          <SectionSelector reloadOnChange={true} />
        </label>

        <div className={styles.studentResponsesColumns}>
          {scriptData.responses.map(response => (
            <div key={response.user_id} className={styles.studentAnswer}>
              <p>{response.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback sharing banner */}
      <Notification
        type={NotificationType.feedback}
        notice={i18n.feedbackShareBannerTitle()}
        details={i18n.feedbackShareBannerDesc()}
        buttonText={i18n.feedbackShareBannerButton()}
        buttonLink={'https://forms.gle/XsjRL9L3Mo5aC3KbA'}
        dismissible={false}
      />
    </div>
  );
};

SummaryResponses.propTypes = {
  scriptData: PropTypes.object,
  isRtl: PropTypes.bool,
  viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
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
      selectedSection:
        state.teacherSections.sections[state.teacherSections.selectedSectionId],
      students: state.teacherSections.selectedStudents,
      currentLevelId: state.progress.currentLevelId,
      levels: currentLesson.levels,
    };
  }
)(SummaryResponses);
