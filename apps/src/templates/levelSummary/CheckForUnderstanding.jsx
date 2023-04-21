import React, {useCallback, useEffect} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import SectionSelector from '@cdo/apps/code-studio/components/progress/SectionSelector';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import i18n from '@cdo/locale';
import styles from './check-for-understanding.module.scss';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

const FREE_RESPONSE = 'FreeResponse';

const CheckForUnderstanding = ({
  scriptData,
  // redux
  isRtl,
  viewAs,
  selectedSection,
  students,
  currentLevelId,
  levels
}) => {
  const currentLevel = levels.find(l => l.activeId === currentLevelId);
  const nextLevel = levels.find(l => l.position === currentLevel.position + 1);
  const sectionParam = selectedSection?.id
    ? `?section_id=${selectedSection.id}`
    : '';

  // To avoid confusion, if a teacher tries to view the summary as a student,
  // send them back to the level in Participant mode instead.
  if (viewAs === ViewType.Participant) {
    document.location.replace(currentLevel.url + document.location.search);
  }

  const questionMarkdown = scriptData.level.properties.long_instructions;
  const teacherMarkdown = scriptData.teacher_markdown;
  const height = scriptData.level.height || '80';

  const logEvent = useCallback(eventName => {
    const {level} = scriptData;
    analyticsReporter.sendEvent(eventName, {
      levelId: level.id,
      levelName: level.name,
      levelType: level.type,
      sectionSelected: !!selectedSection,
      ...scriptData.reportingData
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    logEvent(EVENTS.SUMMARY_PAGE_LOADED);
  }, [logEvent]);

  const onBackToLevelClick = e => {
    e.preventDefault();
    logEvent(EVENTS.SUMMARY_PAGE_BACK_TO_LEVEL_CLICKED);
    window.location.href = currentLevel.url + sectionParam;
  };

  const onNextLevelClick = e => {
    e.preventDefault();
    logEvent(EVENTS.SUMMARY_PAGE_NEXT_LEVEL_CLICKED);
    window.location.href = nextLevel.url + sectionParam;
  };

  return (
    <div className={styles.summaryContainer} id="summary-container">
      {/* Top Nav Links */}
      <p className={styles.navLinks}>
        <a
          href={`${currentLevel.url}${sectionParam}`}
          onClick={onBackToLevelClick}
        >
          &lt; {i18n.backToLevel()}
        </a>
        {nextLevel && (
          <a
            className={isRtl ? styles.navLinkLeft : styles.navLinkRight}
            href={`${nextLevel.url}${sectionParam}`}
            onClick={onNextLevelClick}
          >
            {i18n.nextLevelLink()} &gt;
          </a>
        )}
      </p>

      {/* Question Title */}
      {scriptData.level.properties.title && (
        <h1 className={styles.levelTitle}>
          {scriptData.level.properties.title}
        </h1>
      )}

      {/* Question Body */}
      <SafeMarkdown className={styles.markdown} markdown={questionMarkdown} />

      {/* Question Inputs */}
      {scriptData.level.type === FREE_RESPONSE && (
        <textarea
          className={styles.freeResponse}
          id={`level_${scriptData.level.id}`}
          aria-label={i18n.yourAnswer()}
          placeholder={
            scriptData.level.properties.placeholder ||
            i18n.enterYourAnswerHere()
          }
          style={{height: height + 'px'}}
          readOnly={true}
          defaultValue={scriptData.last_attempt}
        />
      )}

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

      {/* Teacher Instructions */}
      {teacherMarkdown && (
        <div>
          <h2>{i18n.forTeachersOnly()}</h2>

          <SafeMarkdown
            className={styles.markdown}
            markdown={teacherMarkdown}
          />
        </div>
      )}
    </div>
  );
};

CheckForUnderstanding.propTypes = {
  scriptData: PropTypes.object,
  isRtl: PropTypes.bool,
  viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
  selectedSection: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired
  }),
  students: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string
    })
  ),
  currentLevelId: PropTypes.string,
  levels: PropTypes.arrayOf(
    PropTypes.shape({
      activeId: PropTypes.string.isRequired,
      position: PropTypes.number.isRequired
    })
  )
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
      levels: currentLesson.levels
    };
  }
)(CheckForUnderstanding);
