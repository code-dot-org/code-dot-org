import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import color from '@cdo/apps/util/color';
import {addGroup} from '@cdo/apps/lib/levelbuilder/script-editor/editorRedux';
import NewLessonGroupInput from '@cdo/apps/lib/levelbuilder/script-editor/NewLessonGroupInput';
import LessonGroupCard from '@cdo/apps/lib/levelbuilder/script-editor/LessonGroupCard';

const styles = {
  addGroupWithWarning: {
    margin: '0 0 30px 0',
    display: 'flex',
    alignItems: 'center'
  },
  addGroup: {
    fontSize: 14,
    color: 'white',
    background: color.cyan,
    border: `1px solid ${color.cyan}`,
    boxShadow: 'none'
  },
  displayNameWarning: {
    marginLeft: 5,
    marginTop: 5
  }
};

// Replace ' with \'
const escape = str => str.replace(/'/, "\\'");

class LessonGroups extends Component {
  static propTypes = {
    addGroup: PropTypes.func.isRequired,
    lessonGroups: PropTypes.array.isRequired
  };

  state = {
    addingLessonGroup: false
  };

  handleAddLessonGroup = () => {
    this.setState({
      addingLessonGroup: true
    });
  };

  createLessonGroup = (newLessonGroupKey, newLessonGroupName) => {
    this.hideLessonGroupCreate();
    this.props.addGroup(
      this.props.lessonGroups.length,
      newLessonGroupKey,
      newLessonGroupName
    );
  };

  hideLessonGroupCreate = () => {
    this.setState({addingLessonGroup: false});
  };

  setTargetLesson = targetLessonPos => {
    this.setState({targetLessonPos});
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

  // To be populated with the bounding client rect of each LessonCard element.
  lessonMetrics = {};

  setLessonMetrics = (metrics, lessonPosition) => {
    this.lessonMetrics[lessonPosition] = metrics;
  };

  render() {
    const {lessonGroups} = this.props;

    return (
      <div>
        {lessonGroups.map(lessonGroup => (
          <LessonGroupCard
            key={lessonGroup.key}
            lessonGroup={lessonGroup}
            lessonGroupsCount={lessonGroups.length}
            setLessonMetrics={this.setLessonMetrics}
            setTargetLesson={this.setTargetLesson}
            targetLessonPos={this.state.targetLessonPos}
            lessonMetrics={this.lessonMetrics}
          />
        ))}
        {!this.state.addingLessonGroup && (
          <div style={styles.addGroupWithWarning}>
            <button
              onMouseDown={this.handleAddLessonGroup}
              className="btn"
              style={styles.addGroup}
              type="button"
              disabled={!this.props.lessonGroups[0].user_facing}
            >
              <i style={{marginRight: 7}} className="fa fa-plus-circle" />
              Add Lesson Group
            </button>
            {!this.props.lessonGroups[0].user_facing && (
              <span style={styles.displayNameWarning}>
                You must set the display name of the existing lesson group
                before adding more.
              </span>
            )}
          </div>
        )}
        {this.state.addingLessonGroup && (
          <NewLessonGroupInput
            onConfirm={this.createLessonGroup}
            onCancel={this.hideLessonGroupCreate}
          />
        )}
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

export default connect(
  state => ({
    lessonGroups: state.lessonGroups
  }),
  dispatch => ({
    addGroup(position, groupKey, groupName) {
      dispatch(addGroup(position, groupKey, groupName));
    }
  })
)(LessonGroups);
