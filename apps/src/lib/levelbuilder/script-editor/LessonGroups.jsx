import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import UnitCard from '@cdo/apps/lib/levelbuilder/script-editor/UnitCard';

// Replace ' with \'
const escape = str => str.replace(/'/, "\\'");

class LessonGroups extends Component {
  static propTypes = {
    lessonGroups: PropTypes.array.isRequired
  };

  serializeLessonGroups = lessonGroups => {
    let s = [];
    lessonGroups.forEach(lessonGroup => {
      if (lessonGroup.user_facing && lessonGroup.lessons.length > 0) {
        let t = `lesson_group '${lessonGroup.key}'`;
        t += `, display_name: '${escape(lessonGroup.display_name)}'`;
        s.push(t);
      }
      lessonGroup.lessons.forEach(lesson => {
        s = s.concat(this.serializeLesson(lesson));
      });
    });

    s.push('');
    return s.join('\n');
  };

  /**
   * Generate the ScriptDSL format.
   * @param lesson
   * @return {string}
   */
  serializeLesson = lesson => {
    let s = [];
    let t = `stage '${escape(lesson.name)}'`;
    if (lesson.lockable) {
      t += ', lockable: true';
    }
    s.push(t);
    return s.join('\n');
  };

  render() {
    const {lessonGroups} = this.props;
    return (
      <div>
        <UnitCard />
        <input
          type="hidden"
          name="script_text"
          value={this.serializeLessonGroups(lessonGroups)}
        />
      </div>
    );
  }
}

export const UnconnectedLessonGroups = LessonGroups;

export default connect(state => ({lessonGroups: state.lessonGroups}))(
  LessonGroups
);
