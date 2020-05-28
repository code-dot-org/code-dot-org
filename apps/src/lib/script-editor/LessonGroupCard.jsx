import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import color from '../../util/color';
import {borderRadius} from './constants';
import OrderControls from './OrderControls';
import LessonCard from './LessonCard';
import {addLesson, removeGroup, moveGroup} from './editorRedux';

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
  addLesson: {
    fontSize: 14,
    color: '#5b6770',
    background: 'white',
    border: '1px solid #ccc',
    boxShadow: 'none',
    margin: '0 10px 10px 10px'
  }
};

class LessonGroupCard extends Component {
  static propTypes = {
    lessonGroup: PropTypes.object.isRequired,
    lessonGroupCount: PropTypes.number.isRequired,
    setLessonMetrics: PropTypes.func.isRequired,
    setTargetLesson: PropTypes.func.isRequired,
    targetLessonPos: PropTypes.number,
    lessonMetrics: PropTypes.object.isRequired,

    //redux
    addLesson: PropTypes.func.isRequired,
    moveGroup: PropTypes.func.isRequired,
    removeGroup: PropTypes.func.isRequired
  };

  handleAddLesson = lessonGroupPosition => {
    const newLessonName = prompt('Enter new lesson name');
    if (newLessonName) {
      this.props.addLesson(lessonGroupPosition, newLessonName);
    }
  };

  handleMoveLessonGroup = direction => {
    if (
      (this.props.lessonGroup.position !== 1 && direction === 'up') ||
      (this.props.lessonGroup.position !== this.props.lessonGroupCount &&
        direction === 'down')
    ) {
      this.props.moveGroup(this.props.lessonGroup.position, direction);
    }
  };

  handleRemoveLessonGroup = () => {
    this.props.removeGroup(this.props.lessonGroup.position);
  };

  render() {
    const {lessonGroup} = this.props;

    return (
      <div>
        <div style={styles.groupHeader}>
          Lesson Group: {lessonGroup.key || '(none)'}: "
          {lessonGroup.display_name || 'Content'}"
          <OrderControls
            name={lessonGroup.key || '(none)'}
            move={this.handleMoveLessonGroup}
            remove={this.handleRemoveLessonGroup}
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
                    this.props.setLessonMetrics(metrics, lesson.position);
                  }
                }}
                lessonMetrics={this.props.lessonMetrics}
                setTargetLesson={this.props.setTargetLesson}
                targetLessonPos={this.props.targetLessonPos}
              />
            );
          })}
          <button
            onMouseDown={this.handleAddLesson.bind(null, lessonGroup.position)}
            className="btn"
            style={styles.addLesson}
            type="button"
          >
            <i style={{marginRight: 7}} className="fa fa-plus-circle" />
            Add Lesson
          </button>
        </div>
      </div>
    );
  }
}

export const UnconnectedLessonGroupCard = LessonGroupCard;

export default connect(
  state => ({}),
  dispatch => ({
    addLesson(position, lessonName) {
      dispatch(addLesson(position, lessonName));
    },
    removeGroup(position) {
      dispatch(removeGroup(position));
    },
    moveGroup(position, direction) {
      dispatch(moveGroup(position, direction));
    }
  })
)(LessonGroupCard);
