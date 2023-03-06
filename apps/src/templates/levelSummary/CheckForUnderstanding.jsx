import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import getScriptData from '@cdo/apps/util/getScriptData';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import SectionSelector from '@cdo/apps/code-studio/components/progress/SectionSelector';
import styles from './check-for-understanding.module.scss';

const CheckForUnderstanding = ({
  isRtl,
  viewAs,
  selectedSection,
  students,
  sections,
  currentLevelId,
  levels
}) => {
  const currentLevel = levels.find(l => l.activeId === currentLevelId);
  const nextLevel = levels.find(l => l.position === currentLevel.position + 1);

  // To avoid confusion, if a teacher tries to view the summary as a student,
  // send them back to the level in Participant mode instead.
  if (viewAs === ViewType.Participant) {
    const paramString = document.location.search
      .replace('view=summary', '')
      .replace('&&', '&')
      .replace('?&', '?');
    document.location.replace(currentLevel.url + paramString);
  }

  const data = getScriptData('summary');
  console.log(data);

  const questionMarkdown = data.level.properties.long_instructions;
  const teacherMarkdown = data.teacher_markdown;
  const height = data.level.height || '80';

  // Split responses into two arrays for displaying in columns.
  const responseColumns = [
    data.responses.slice(0, Math.ceil(data.responses.length / 2)),
    data.responses.slice(data.responses.length / 2 + 1)
  ];

  return (
    <div className={styles.summaryContainer}>
      {/* Top Nav Links */}
      <div className={styles.navLinks}>
        <a
          className={styles.navLinkBack}
          href={currentLevel.url}
          icon="arrow-left"
        >
          &lt; Back to level
        </a>
        {nextLevel && (
          <a
            className={isRtl ? styles.navLinkLeft : styles.navLinkRight}
            href={nextLevel.url}
            icon="arrow-right"
          >
            Next level &gt;
          </a>
        )}
      </div>

      {/* Question Title */}
      {data.level.properties.title && <h1>{data.level.properties.title}</h1>}

      {/* Question Body */}
      <SafeMarkdown markdown={questionMarkdown} />

      {/* Question Inputs */}
      {data.level.type === 'FreeResponse' && (
        <textarea
          className={styles.freeResponse}
          id={`level_${data.level.id}`}
          placeholder={
            data.level.properties.placeholder || 'Enter your answer here'
          }
          style={{height: height + 'px'}}
          readOnly={true}
          defaultValue={data.last_attempt}
        />
      )}

      {/* Student Responses */}
      <h2>Student Responses</h2>

      <div id="student-submissions">
        <p>
          {data.responses.length}/{students.length} students submitted
        </p>
      </div>

      <label>
        Responses shown for class section:
        <SectionSelector style={{display: 'block'}} reloadOnChange={true} />
      </label>

      <div className={styles.studentAnswerContainer}>
        <div className={styles.column}>
          {responseColumns[0].map((response, index) => (
            <div key={`1${index}`} className={styles.studentAnswer}>
              <p>{response.text}</p>
            </div>
          ))}
        </div>

        <div className={styles.column}>
          {responseColumns[1].map((response, index) => (
            <div key={`2${index}`} className={styles.studentAnswer}>
              <p>{response.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Teacher Instructions */}
      {teacherMarkdown && (
        <div>
          <h2>For Teachers Only</h2>

          <SafeMarkdown markdown={teacherMarkdown} />
        </div>
      )}
    </div>
  );
};

CheckForUnderstanding.propTypes = {
  isRtl: PropTypes.boolean,
  viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
  selectedSection: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired
  }),
  students: PropTypes.arrayOf(PropTypes.object),
  sections: PropTypes.array, // TODO
  currentLevelId: PropTypes.string,
  levels: PropTypes.object // TODO
};

export default connect(
  // NOTE: Some of this state data is loaded in by the teacher panel. If you
  // remove the teacher panel, or try to use this component on a page without
  // the teacher panel, it will require extra steps to load in the data.
  state => {
    const currentLesson = state.progress.lessons.find(
      l => l.id === state.progress.currentLessonId
    );
    console.log(state);

    return {
      isRtl: state.isRtl,
      viewAs: state.viewAs,
      selectedSection:
        state.teacherSections.sections[state.teacherSections.selectedSectionId],
      students: state.teacherSections.selectedStudents,
      sections: state.teacherSections.sections,
      currentLevelId: state.progress.currentLevelId,
      levels: currentLesson.levels
    };
  }
)(CheckForUnderstanding);
