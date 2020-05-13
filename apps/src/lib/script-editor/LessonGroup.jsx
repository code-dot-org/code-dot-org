import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import _ from 'lodash';
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

class LessonGroup extends Component {
  static propTypes = {
    addGroup: PropTypes.func.isRequired,
    addLesson: PropTypes.func.isRequired,
    lessons: PropTypes.array.isRequired,
    levelKeyList: PropTypes.object.isRequired,
    lessonGroupMap: PropTypes.object.isRequired
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

  createLessonGroup = newLessonGroup => {
    this.hideLessonGroupCreate();
    const newLessonName = prompt('Enter new lesson name');
    if (newLessonName) {
      this.props.addGroup(newLessonName, newLessonGroup);
    }
  };

  hideLessonGroupCreate = () => {
    this.setState({addingLessonGroup: false});
  };

  handleAddLesson = position => {
    const newLessonName = prompt('Enter new lesson name');
    if (newLessonName) {
      this.props.addLesson(position, newLessonName);
    }
  };

  setTargetLesson = targetLessonPos => {
    this.setState({targetLessonPos});
  };

  serializeLessonGroups = lessons => {
    let s = [];
    /*
    lessonGroups.forEach(lessonGroup => {
      if (lessonGroup.user_facing && !lessonGroup.lessons) {
        let t = `lesson_group '#{escape(lessonGroup.key)}'`;
        t += ', display_name: \'#{escape(lesson_group.localized_display_name)}\'';
        s.push(t);
      } */
    lessons.forEach(lesson => {
      s = s.concat(this.serializeLesson(lesson));
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
    const groups = _.groupBy(
      this.props.lessons,
      lesson => lesson.lesson_group_display_name || ''
    );
    let afterLesson = 1;
    const {lessonGroupMap} = this.props;

    return (
      <div>
        {_.keys(lessonGroupMap).map(group => (
          <div key={group}>
            <div style={styles.groupHeader}>
              Lesson Group: {group || '(none)'}: "
              {lessonGroupMap[group] || 'Content'}"
              <OrderControls
                type={ControlTypes.Group}
                position={afterLesson}
                total={Object.keys(groups).length}
                name={group || '(none)'}
              />
            </div>
            <div style={styles.groupBody}>
              {groups[lessonGroupMap[group]].map((lesson, index) => {
                afterLesson++;
                return (
                  <LessonCard
                    key={`lesson-${index}`}
                    lessonsCount={this.props.lessons.length}
                    lesson={lesson}
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
                onMouseDown={this.handleAddLesson.bind(null, afterLesson - 1)}
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
            confirmButtonText="Create"
            onConfirm={this.createLessonGroup}
            onCancel={this.hideLessonGroupCreate}
          />
        )}
        <input
          type="hidden"
          name="script_text"
          value={this.serializeLessonGroups(this.props.lessons)}
        />
      </div>
    );
  }
}

export default connect(
  state => ({
    levelKeyList: state.levelKeyList,
    lessons: state.lessons,
    lessonGroupMap: state.lessonGroupMap
  }),
  dispatch => ({
    addGroup(lessonName, groupName) {
      dispatch(addGroup(lessonName, groupName));
    },
    addLesson(position, lessonName) {
      dispatch(addLesson(position, lessonName));
    }
  })
)(LessonGroup);
