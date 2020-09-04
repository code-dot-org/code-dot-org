import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {borderRadius} from '@cdo/apps/lib/levelbuilder/constants';
import OrderControls from '@cdo/apps/lib/levelbuilder/OrderControls';
import {
  setLessonLockable,
  setLessonGroup,
  moveLesson,
  removeLesson
} from '@cdo/apps/lib/levelbuilder/script-editor/editorRedux';
import LessonGroupSelector from '@cdo/apps/lib/levelbuilder/script-editor/LessonGroupSelector';

const styles = {
  checkbox: {
    margin: '0 0 0 7px'
  },
  lessonCard: {
    fontSize: 18,
    background: 'white',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#ccc',
    borderRadius: borderRadius,
    padding: 20,
    margin: 10
  },
  lessonCardHeader: {
    color: '#5b6770',
    marginBottom: 15
  },
  lessonLockable: {
    fontSize: 13,
    marginTop: 3
  },
  bottomControls: {
    height: 30
  },
  addButton: {
    fontSize: 14,
    background: '#eee',
    border: '1px solid #ddd',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
    margin: '0 5px 0 0'
  }
};

export class UnconnectedLessonCard extends Component {
  static propTypes = {
    setLessonLockable: PropTypes.func.isRequired,
    lessonsCount: PropTypes.number.isRequired,
    lesson: PropTypes.object.isRequired,
    lessonGroupPosition: PropTypes.number.isRequired,
    setLessonGroup: PropTypes.func.isRequired,
    moveLesson: PropTypes.func.isRequired,
    removeLesson: PropTypes.func.isRequired,
    lessonGroupsCount: PropTypes.number.isRequired
  };

  state = {
    editingLessonGroup: false
  };

  handleEditLessonDetails = () => {
    window.open(`/lessons/${this.props.lesson.id}/edit`, '_blank');
  };

  handleEditLessonGroup = () => {
    this.setState({
      editingLessonGroup: true
    });
  };

  handleSetLessonGroup = newLessonGroupPosition => {
    this.setState({editingLessonGroup: false});
    if (this.props.lessonGroupPosition !== newLessonGroupPosition + 1) {
      this.props.setLessonGroup(
        this.props.lesson.position,
        this.props.lessonGroupPosition,
        newLessonGroupPosition + 1
      );
    }
  };

  hideLessonGroupSelector = () => {
    this.setState({editingLessonGroup: false});
  };

  toggleLockable = () => {
    this.props.setLessonLockable(
      this.props.lessonGroupPosition,
      this.props.lesson.position,
      !this.props.lesson.lockable
    );
  };

  handleMoveLesson = direction => {
    if (
      (this.props.lesson.position !== 1 && direction === 'up') ||
      (this.props.lesson.position !== this.props.lessonsCount &&
        direction === 'down')
    ) {
      this.props.moveLesson(
        this.props.lessonGroupPosition,
        this.props.lesson.position,
        direction
      );
    }
  };

  handleRemoveLesson = () => {
    this.props.removeLesson(
      this.props.lessonGroupPosition,
      this.props.lesson.position
    );
  };

  render() {
    const {lesson} = this.props;
    return (
      <div style={styles.lessonCard}>
        <div style={styles.lessonCardHeader}>
          {!lesson.lockable && (
            <span>Lesson {lesson.relativePosition}:&nbsp;</span>
          )}
          {lesson.name}
          <OrderControls
            name={this.props.lesson.name}
            move={this.handleMoveLesson}
            remove={this.handleRemoveLesson}
          />
          <label style={styles.lessonLockable}>
            Require teachers to unlock this lesson before students in their
            section can access it
            <input
              checked={lesson.lockable}
              onChange={this.toggleLockable}
              type="checkbox"
              style={styles.checkbox}
            />
          </label>
        </div>
        <div style={styles.bottomControls}>
          {!this.state.editingLessonGroup && (
            <span>
              <button
                onMouseDown={this.handleEditLessonDetails}
                className="btn"
                style={styles.addButton}
                type="button"
              >
                <i style={{marginRight: 7}} className="fa fa-pencil" />
                Edit Lesson Details
              </button>
              {this.props.lessonGroupsCount > 1 && (
                <button
                  onMouseDown={this.handleEditLessonGroup}
                  className="btn"
                  style={styles.addButton}
                  type="button"
                >
                  <i style={{marginRight: 7}} className="fa fa-pencil" />
                  Edit Lesson Group
                </button>
              )}
            </span>
          )}
          {this.state.editingLessonGroup && (
            <LessonGroupSelector
              labelText="Lesson Group"
              confirmButtonText="Save"
              onConfirm={this.handleSetLessonGroup}
              onCancel={this.hideLessonGroupSelector}
            />
          )}
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({}),
  {
    setLessonLockable,
    setLessonGroup,
    moveLesson,
    removeLesson
  }
)(UnconnectedLessonCard);
