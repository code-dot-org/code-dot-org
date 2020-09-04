import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {
  borderRadius,
  levelTokenMargin
} from '@cdo/apps/lib/levelbuilder/constants';
import OrderControls from '@cdo/apps/lib/levelbuilder/OrderControls';
import LevelToken from '@cdo/apps/lib/levelbuilder/script-editor/LevelToken';
import {
  reorderLevel,
  moveLevelToLesson,
  addLevel,
  setLessonLockable,
  setLessonGroup,
  moveLesson,
  removeLesson
} from '@cdo/apps/lib/levelbuilder/script-editor/editorRedux';
import LessonGroupSelector from '@cdo/apps/lib/levelbuilder/script-editor/LessonGroupSelector';
import color from '@cdo/apps/util/color';
import RemoveLevelDialog from '@cdo/apps/lib/levelbuilder/script-editor/RemoveLevelDialog';

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
  addLevel: {
    fontSize: 14,
    background: '#eee',
    border: '1px solid #ddd',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
    margin: '0 5px 0 0'
  }
};

styles.targetLessonCard = {
  ...styles.lessonCard,
  borderWidth: 5,
  borderColor: color.cyan,
  padding: 16
};

export class UnconnectedLessonCard extends Component {
  static propTypes = {
    reorderLevel: PropTypes.func.isRequired,
    moveLevelToLesson: PropTypes.func.isRequired,
    addLevel: PropTypes.func.isRequired,
    setLessonLockable: PropTypes.func.isRequired,
    lessonsCount: PropTypes.number.isRequired,
    lesson: PropTypes.object.isRequired,
    lessonGroupPosition: PropTypes.number.isRequired,
    lessonMetrics: PropTypes.object.isRequired,
    setLessonGroup: PropTypes.func.isRequired,
    setTargetLesson: PropTypes.func.isRequired,
    targetLessonPos: PropTypes.number,
    moveLesson: PropTypes.func.isRequired,
    removeLesson: PropTypes.func.isRequired,
    lessonGroupsCount: PropTypes.number.isRequired
  };

  /**
   * To be populated with the bounding client rect of each level token element.
   */
  metrics = {};

  state = {
    currentPositions: [],
    draggedLevelPos: null,
    dragHeight: null,
    initialClientY: null,
    newPosition: null,
    startingPositions: null,
    editingLessonGroup: false,
    levelPosToRemove: null
  };

  handleDragStart = (position, {clientY}) => {
    // The bounding boxes in this.metrics will be stale if the user scrolled the
    // page since the last time this component was updated. Therefore, force the
    // component to rerender so that this.metrics will be up to date.
    this.forceUpdate(() => {
      const startingPositions = this.props.lesson.levels.map(level => {
        const metrics = this.metrics[level.position];
        return metrics.top + metrics.height / 2;
      });
      this.setState({
        draggedLevelPos: position,
        dragHeight: this.metrics[position].height + levelTokenMargin,
        initialClientY: clientY,
        newPosition: position,
        startingPositions
      });
      window.addEventListener('selectstart', this.preventSelect);
      window.addEventListener('mousemove', this.handleDrag);
      window.addEventListener('mouseup', this.handleDragStop);
    });
  };

  handleDrag = ({clientY}) => {
    const delta = clientY - this.state.initialClientY;
    const dragPosition = this.metrics[this.state.draggedLevelPos].top;
    let newPosition = this.state.draggedLevelPos;
    const currentPositions = this.state.startingPositions.map(
      (midpoint, index) => {
        const position = index + 1;
        if (position === this.state.draggedLevelPos) {
          return delta;
        }
        if (position < this.state.draggedLevelPos && dragPosition < midpoint) {
          newPosition--;
          return this.state.dragHeight;
        }
        if (
          position > this.state.draggedLevelPos &&
          dragPosition + this.state.dragHeight > midpoint
        ) {
          newPosition++;
          return -this.state.dragHeight;
        }
        return 0;
      }
    );
    this.setState({currentPositions, newPosition});
    const targetLessonPos = this.getTargetLesson(clientY);
    this.props.setTargetLesson(targetLessonPos);
  };

  // Given a clientY value of a location on the screen, find the LessonCard
  // corresponding to that location, and return the position of the
  // corresponding lesson within the script.
  getTargetLesson = y => {
    const {lessonMetrics} = this.props;
    const lessonPos = Object.keys(lessonMetrics).find(lessonPos => {
      const lessonRect = lessonMetrics[lessonPos];
      return y > lessonRect.top && y < lessonRect.top + lessonRect.height;
    });
    return lessonPos ? Number(lessonPos) : null;
  };

  handleDragStop = () => {
    const {lesson, lessonGroupPosition, targetLessonPos} = this.props;
    if (targetLessonPos === lesson.position) {
      // When dragging within a lesson, reorder the level within that lesson.
      if (this.state.draggedLevelPos !== this.state.newPosition) {
        this.props.reorderLevel(
          lessonGroupPosition,
          lesson.position,
          this.state.draggedLevelPos,
          this.state.newPosition
        );
      }
    } else if (targetLessonPos) {
      // When dragging between lessons, move it to the end of the new lesson.
      this.props.moveLevelToLesson(
        lessonGroupPosition,
        lesson.position,
        this.state.draggedLevelPos,
        targetLessonPos
      );
    }
    this.props.setTargetLesson(null);

    this.setState({
      draggedLevelPos: null,
      newPosition: null,
      currentPositions: []
    });
    window.removeEventListener('selectstart', this.preventSelect);
    window.removeEventListener('mousemove', this.handleDrag);
    window.removeEventListener('mouseup', this.handleDragStop);
  };

  handleAddLevel = () => {
    this.props.addLevel(
      this.props.lessonGroupPosition,
      this.props.lesson.position
    );
  };

  handleRemoveLevel = levelPos => {
    this.setState({levelPosToRemove: levelPos});
  };

  handleClose = () => {
    this.setState({levelPosToRemove: null});
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

  preventSelect(e) {
    e.preventDefault();
  }

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
    const {lesson, targetLessonPos, lessonGroupPosition} = this.props;
    const {draggedLevelPos, levelPosToRemove} = this.state;
    const isTargetLesson = targetLessonPos === lesson.position;
    return (
      <div style={isTargetLesson ? styles.targetLessonCard : styles.lessonCard}>
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
        {lesson.levels.map(level => (
          <LevelToken
            ref={levelToken => {
              if (levelToken) {
                const metrics = ReactDOM.findDOMNode(
                  levelToken
                ).getBoundingClientRect();
                this.metrics[level.position] = metrics;
              }
            }}
            key={level.position + '_' + level.ids[0]}
            level={level}
            lessonPosition={lesson.position}
            lessonGroupPosition={lessonGroupPosition}
            dragging={!!draggedLevelPos}
            draggedLevelPos={level.position === draggedLevelPos}
            delta={this.state.currentPositions[level.position - 1] || 0}
            handleDragStart={this.handleDragStart}
            removeLevel={this.handleRemoveLevel}
          />
        ))}
        <div style={styles.bottomControls}>
          {!this.state.editingLessonGroup && (
            <span>
              <button
                onMouseDown={this.handleAddLevel}
                className="btn"
                style={styles.addLevel}
                type="button"
              >
                <i style={{marginRight: 7}} className="fa fa-plus-circle" />
                Add Level
              </button>
              <button
                onMouseDown={this.handleEditLessonDetails}
                className="btn"
                style={styles.addLevel}
                type="button"
              >
                <i style={{marginRight: 7}} className="fa fa-pencil" />
                Edit Lesson Details
              </button>
              {this.props.lessonGroupsCount > 1 && (
                <button
                  onMouseDown={this.handleEditLessonGroup}
                  className="btn"
                  style={styles.addLevel}
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
        {/* This dialog lives outside LevelToken because moving it inside can
           interfere with drag and drop or fail to show the modal backdrop. */}
        <RemoveLevelDialog
          lesson={lesson}
          lessonGroupPosition={lessonGroupPosition}
          levelPosToRemove={levelPosToRemove}
          handleClose={this.handleClose}
        />
      </div>
    );
  }
}

export default connect(
  state => ({}),
  {
    reorderLevel,
    moveLevelToLesson,
    addLevel,
    setLessonLockable,
    setLessonGroup,
    moveLesson,
    removeLesson
  }
)(UnconnectedLessonCard);
