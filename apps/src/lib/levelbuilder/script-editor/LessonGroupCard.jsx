import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import color from '@cdo/apps/util/color';
import {borderRadius} from '@cdo/apps/lib/levelbuilder/constants';
import OrderControls from '@cdo/apps/lib/levelbuilder/OrderControls';
import LessonCard from '@cdo/apps/lib/levelbuilder/script-editor/LessonCard';
import {
  addLesson,
  removeGroup,
  moveGroup,
  convertGroupToUserFacing
} from '@cdo/apps/lib/levelbuilder/script-editor/editorRedux';

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
    lessonGroupsCount: PropTypes.number.isRequired,
    setLessonMetrics: PropTypes.func.isRequired,
    setTargetLesson: PropTypes.func.isRequired,
    targetLessonPos: PropTypes.number,
    lessonMetrics: PropTypes.object.isRequired,

    //redux
    addLesson: PropTypes.func.isRequired,
    moveGroup: PropTypes.func.isRequired,
    removeGroup: PropTypes.func.isRequired,
    convertGroupToUserFacing: PropTypes.func.isRequired
  };

  handleAddLesson = lessonGroupPosition => {
    const newLessonName = prompt('Enter new lesson name');
    if (newLessonName) {
      this.props.addLesson(lessonGroupPosition, newLessonName);
    }
  };

  handleMakeUserFacing = lessonGroupPosition => {
    const newLessonGroupKey = prompt('Enter new lesson group key');
    const newLessonGroupDisplayName = prompt(
      'Enter new lesson group display name'
    );
    if (newLessonGroupKey && newLessonGroupDisplayName) {
      this.props.convertGroupToUserFacing(
        lessonGroupPosition,
        newLessonGroupKey,
        newLessonGroupDisplayName
      );
    }
  };

  handleMoveLessonGroup = direction => {
    if (
      (this.props.lessonGroup.position !== 1 && direction === 'up') ||
      (this.props.lessonGroup.position !== this.props.lessonGroupsCount &&
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
          {lessonGroup.user_facing
            ? `Lesson Group: ${lessonGroup.key}: "${lessonGroup.display_name}"`
            : 'Lesson Group: Not User Facing (No Display Name)'}
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
                lessonGroupsCount={this.props.lessonGroupsCount}
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
          {!this.props.lessonGroup.user_facing && (
            <button
              onMouseDown={this.handleMakeUserFacing.bind(
                null,
                lessonGroup.position
              )}
              className="btn"
              style={styles.addLesson}
              type="button"
            >
              <i style={{marginRight: 7}} className="fa fa-plus-circle" />
              Set Display Name
            </button>
          )}
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
    },
    convertGroupToUserFacing(position, key, displayName) {
      dispatch(convertGroupToUserFacing(position, key, displayName));
    }
  })
)(LessonGroupCard);
