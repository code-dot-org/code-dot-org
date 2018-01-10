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
    // TODO: better document probably
    scriptData: PropTypes.object.isRequired,
    studentLevelProgress: PropTypes.object.isRequired,
  };

  render() {
    const { section, scriptData, studentLevelProgress } = this.props;

    // Merges levelProgress for a student with our fixed scriptData (i.e. level structure)
    // thus giving us a "levels" object in the desired form
    const progressAndLevelState = (levelProgress) => {
      let state = {
        ...scriptData,
        levelProgress
      };
      return levelsByLesson(state);
    };

    return (
      <div>
        {section.students.map((student, index) => (
          <div key={student.id}>
            <a href={`/teacher-dashboard#/sections/${section.id}/student/${student.id}/script/${scriptData.id}`}>
              {student.name}
            </a>
            <div style={styles.bubbles}>
              {progressAndLevelState(studentLevelProgress[student.id]).map((levels, i) =>
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
