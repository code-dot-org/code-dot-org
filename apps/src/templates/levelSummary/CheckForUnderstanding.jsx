import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import getScriptData from '@cdo/apps/util/getScriptData';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import SectionSelector from '@cdo/apps/code-studio/components/progress/SectionSelector';
import i18n from '@cdo/locale';
import styles from './check-for-understanding.module.scss';

const SUMMARY_PARAM = 'view=summary';
const FREE_RESPONSE = 'FreeResponse';

const CheckForUnderstanding = ({
  isRtl,
  viewAs,
  selectedSection,
  students,
  currentLevelId,
  levels
}) => {
  const currentLevel = levels.find(l => l.activeId === currentLevelId);
  const nextLevel = levels.find(l => l.position === currentLevel.position + 1);

  // To avoid confusion, if a teacher tries to view the summary as a student,
  // send them back to the level in Participant mode instead.
  if (viewAs === ViewType.Participant) {
    const paramString = document.location.search
      .replace(SUMMARY_PARAM, '')
      .replace('&&', '&')
      .replace('?&', '?');
    document.location.replace(currentLevel.url + paramString);
  }

  const data = getScriptData('summary');

  const questionMarkdown = data.level.properties.long_instructions;
  const teacherMarkdown = data.teacher_markdown;
  const height = data.level.height || '80';

  return (
    <div className={styles.summaryContainer}>
      {/* Top Nav Links */}
      <p className={styles.navLinks}>
        <a href={currentLevel.url}>&lt; {i18n.backToLevel()}</a>
        {nextLevel && (
          <a
            className={isRtl ? styles.navLinkLeft : styles.navLinkRight}
            href={`${nextLevel.url}${document.location.search}`}
          >
            {i18n.nextLevelLink()} &gt;
          </a>
        )}
      </p>

      {/* Question Title */}
      {data.level.properties.title && (
        <h1 className={styles.levelTitle}>{data.level.properties.title}</h1>
      )}

      {/* Question Body */}
      <SafeMarkdown className={styles.markdown} markdown={questionMarkdown} />

      {/* Question Inputs */}
      {data.level.type === FREE_RESPONSE && (
        <textarea
          className={styles.freeResponse}
          id={`level_${data.level.id}`}
          aria-label={i18n.yourAnswer()}
          placeholder={
            data.level.properties.placeholder || i18n.enterYourAnswerHere()
          }
          style={{height: height + 'px'}}
          readOnly={true}
          defaultValue={data.last_attempt}
        />
      )}

      {/* Student Responses */}
      <div className={styles.studentResponses}>
        <h2>{i18n.studentResponses()}</h2>

        <div
          className={
            isRtl ? styles.studentsSubmittedLeft : styles.studentsSubmittedRight
          }
        >
          <p>
            <i className="fa fa-user" />
            <span>
              {i18n.studentsSubmitted({
                numSubmissions: data.responses.length,
                numStudents: students.length
              })}
            </span>
          </p>
        </div>

        <label>
          {i18n.responsesForClassSection()}
          <SectionSelector reloadOnChange={true} />
        </label>

        <div className={styles.studentResponsesColumns}>
          {data.responses.map(response => (
            <div key={response.user_id} className={styles.studentAnswer}>
              <p>{response.text}</p>
            </div>
          ))}
        </div>
      </div>

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
