import React, { PropTypes, Component } from 'react';
import ProgressBubbleSet from '@cdo/apps/templates/progress/ProgressBubbleSet';
import { levelsByLesson } from '@cdo/apps/code-studio/progressRedux';

const styles = {
  bubbles: {
    overflowX: 'scroll',
    whiteSpace: 'nowrap',
  }
};

/**
 * Displays a section's progress for a particular script once we have data
 */
export default class SectionScriptProgress extends Component {
  static propTypes = {
    section: PropTypes.shape({
      id: PropTypes.number.isRequired,
      students: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      })).isRequired
    }).isRequired,
    // The data we get from the server's call to script.summarize. The format
    // ends up being similar to that which we send to initProgress in progressRedux.
    // The important part is scriptData.stages, which gets used by levelsWithLesson
    scriptData: PropTypes.shape({
      stages: PropTypes.arrayOf(PropTypes.shape({
        levels: PropTypes.arrayOf(PropTypes.object).isRequired
      })),
      id: PropTypes.number.isRequired,
    }).isRequired,
    // For each student id, has a mapping from level id to the student's result
    // on that level
    studentLevelProgress: PropTypes.objectOf(
      PropTypes.objectOf(PropTypes.number)
    ).isRequired,
  };

  /**
   * progressRedux has a helper (levelsByLesson) that looks as the state of the
   * redux store and returns a set of level objects, where the level object includes
   * the student's status. We take advantage of that by creating an equivalent
   * object with the relevant data. This is likely not the right long term solution.
   * @param {string} studentId
   * @returns {object} Level object that includes static data about the level,
   *   and also the student's result
   */
  levelsForStudent(studentId) {
    const { scriptData, studentLevelProgress } = this.props;

    const fakeState = {
      stages: scriptData.stages,
      levelProgress: studentLevelProgress[studentId],
      currentLevelId: null
    };

    return levelsByLesson(fakeState);
  }

  render() {
    const { section, scriptData } = this.props;

    return (
      <div>
        {section.students.map((student, index) => (
          <div key={student.id}>
            <a href={`/teacher-dashboard#/sections/${section.id}/student/${student.id}/script/${scriptData.id}`}>
              {student.name}
            </a>
            <div style={styles.bubbles}>
              {this.levelsForStudent(student.id).map((levels, i) =>
                <ProgressBubbleSet
                  key={i}
                  levels={levels}
                  disabled={false}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
}
