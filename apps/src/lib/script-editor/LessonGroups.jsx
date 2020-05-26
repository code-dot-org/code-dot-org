import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import color from '../../util/color';
import {borderRadius, ControlTypes} from './constants';
import OrderControls from './OrderControls';
import LessonCard from './LessonCard';
import {NEW_LEVEL_ID, addLesson, addGroup} from './editorRedux';
import NewLessonGroupInput from './NewLessonGroupInput';

const styles = {
  groupHeader: {
    fontSize: 18,
    color: 'white',
    background: color.cyan,
    borderTopLeftRadius: borderRadius,
    borderTopRightRadius: borderRadius,
    padding: 10
  },
  groupBody: {
    background: color.lightest_cyan,
    borderBottomLeftRadius: borderRadius,
    borderBottomRightRadius: borderRadius,
    padding: 10,
    marginBottom: 20
  },
  addGroup: {
    fontSize: 14,
    color: 'white',
    background: color.cyan,
    border: `1px solid ${color.cyan}`,
    boxShadow: 'none',
    margin: '0 0 30px 0'
  },
  addLesson: {
    fontSize: 14,
    color: '#5b6770',
    background: 'white',
    border: '1px solid #ccc',
    boxShadow: 'none',
    margin: '0 10px 10px 10px'
  }
};

// Replace ' with \'
const escape = str => str.replace(/'/, "\\'");

class LessonGroups extends Component {
  static propTypes = {
    addGroup: PropTypes.func.isRequired,
    addLesson: PropTypes.func.isRequired,
    lessonGroups: PropTypes.array.isRequired,
    levelKeyList: PropTypes.object.isRequired
  };

  state = {
    addingLessonGroup: false,
    // Which lesson a level is currently being dragged to.
    targetLessonPos: null
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

  handleAddLesson = lessonGroupPosition => {
    const newLessonName = prompt('Enter new lesson name');
    if (newLessonName) {
      this.props.addLesson(lessonGroupPosition, newLessonName);
    }
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
    lesson.levels.forEach(level => {
      if (level.ids.length > 1) {
        s.push('variants');
        level.ids.forEach(id => {
          s = s.concat(this.serializeLevel(id, level, level.activeId === id));
        });
        s.push('endvariants');
      } else {
        s = s.concat(this.serializeLevel(level.ids[0], level));
      }
    });
    s.push('');
    return s.join('\n');
  };

  serializeLevel(id, level, active) {
    if (id === NEW_LEVEL_ID) {
      return;
    }

    const s = [];
    const key = this.props.levelKeyList[id];
    if (/^blockly:/.test(key)) {
      if (level.skin) {
        s.push(`skin '${escape(level.skin)}'`);
      }
      if (level.videoKey) {
        s.push(`video_key_for_next_level '${escape(level.videoKey)}'`);
      }
      if (level.concepts) {
        // concepts is a comma-separated list of single-quoted strings, so do
        // not escape its single quotes.
        s.push(`concepts ${level.concepts}`);
      }
      if (level.conceptDifficulty) {
        s.push(`level_concept_difficulty '${escape(level.conceptDifficulty)}'`);
      }
    }
    let l = `level '${escape(key)}'`;
    if (active === false) {
      l += ', active: false';
    }
    if (level.progression) {
      l += `, progression: '${escape(level.progression)}'`;
    }
    if (level.named) {
      l += `, named: true`;
    }
    if (level.assessment) {
      l += `, assessment: true`;
    }
    if (level.challenge) {
      l += `, challenge: true`;
    }
    s.push(l);
    return s;
  }

  // To be populated with the bounding client rect of each LessonCard element.
  lessonMetrics = {};

  render() {
    const {lessonGroups} = this.props;

    return (
      <div>
        {lessonGroups.map((lessonGroup, index) => (
          <div key={lessonGroup.key}>
            <div style={styles.groupHeader}>
              Lesson Group: {lessonGroup.key || '(none)'}: "
              {lessonGroup.display_name || 'Content'}"
              <OrderControls
                type={ControlTypes.Group}
                position={index + 1}
                total={lessonGroups.length}
                name={lessonGroup.key || '(none)'}
              />
            </div>
            <div style={styles.groupBody}>
              {lessonGroup.lessons.map((lesson, index) => {
                return (
                  <LessonCard
                    key={`lesson-${index}`}
                    lessonsCount={lessonGroup.lessons.length}
                    lesson={lesson}
                    lessonGroupPosition={lessonGroup.position}
                    ref={lessonCard => {
                      if (lessonCard) {
                        const metrics = ReactDOM.findDOMNode(
                          lessonCard
                        ).getBoundingClientRect();
                        this.lessonMetrics[lesson.position] = metrics;
                      }
                    }}
                    lessonMetrics={this.lessonMetrics}
                    setTargetLesson={this.setTargetLesson}
                    targetLessonPos={this.state.targetLessonPos}
                  />
                );
              })}
              <button
                onMouseDown={this.handleAddLesson.bind(null, index + 1)}
                className="btn"
                style={styles.addLesson}
                type="button"
              >
                <i style={{marginRight: 7}} className="fa fa-plus-circle" />
                Add Lesson
              </button>
            </div>
          </div>
        ))}
        {!this.state.addingLessonGroup && (
          <button
            onMouseDown={this.handleAddLessonGroup}
            className="btn"
            style={styles.addGroup}
            type="button"
          >
            <i style={{marginRight: 7}} className="fa fa-plus-circle" />
            Add Lesson Group
          </button>
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

export default connect(
  state => ({
    levelKeyList: state.levelKeyList,
    lessonGroups: state.lessonGroups
  }),
  dispatch => ({
    addGroup(position, groupKey, groupName) {
      dispatch(addGroup(position, groupKey, groupName));
    },
    addLesson(position, lessonName) {
      dispatch(addLesson(position, lessonName));
    }
  })
)(LessonGroups);
