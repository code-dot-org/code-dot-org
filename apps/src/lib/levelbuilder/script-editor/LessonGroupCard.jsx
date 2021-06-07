import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import color from '@cdo/apps/util/color';
import ReactDOM from 'react-dom';
import {borderRadius, tokenMargin} from '@cdo/apps/lib/levelbuilder/constants';
import OrderControls from '@cdo/apps/lib/levelbuilder/OrderControls';
import {
  moveGroup,
  removeLesson,
  addLesson,
  removeGroup,
  setLessonGroup,
  reorderLesson,
  updateLessonGroupField
} from '@cdo/apps/lib/levelbuilder/script-editor/scriptEditorRedux';
import LessonToken from '@cdo/apps/lib/levelbuilder/script-editor/LessonToken';
import {lessonGroupShape} from '@cdo/apps/lib/levelbuilder/shapes';
import CloneLessonDialog from '@cdo/apps/lib/levelbuilder/script-editor/CloneLessonDialog';
import RemoveLessonDialog from '@cdo/apps/lib/levelbuilder/script-editor/RemoveLessonDialog';
import MarkdownEnabledTextarea from '@cdo/apps/lib/levelbuilder/MarkdownEnabledTextarea';

class LessonGroupCard extends Component {
  static propTypes = {
    lessonGroup: lessonGroupShape.isRequired,
    lessonGroupsCount: PropTypes.number.isRequired,
    lessonGroupMetrics: PropTypes.object,
    setTargetLessonGroup: PropTypes.func,
    targetLessonGroupPos: PropTypes.number,
    lessonKeys: PropTypes.array.isRequired,

    // from redux
    addLesson: PropTypes.func.isRequired,
    moveGroup: PropTypes.func.isRequired,
    removeGroup: PropTypes.func.isRequired,
    removeLesson: PropTypes.func.isRequired,
    setLessonGroup: PropTypes.func.isRequired,
    reorderLesson: PropTypes.func.isRequired,
    updateLessonGroupField: PropTypes.func.isRequired
  };

  /**
   * To be populated with the bounding client rect of each lesson token element.
   */
  metrics = {};

  state = {
    lessonPosToRemove: null,
    currentPositions: [],
    draggedLessonPos: null,
    dragHeight: null,
    initialClientY: null,
    newPosition: null,
    startingPositions: null
  };

  handleDragStart = (position, {clientY}) => {
    // The bounding boxes in this.metrics will be stale if the user scrolled the
    // page since the last time this component was updated. Therefore, force the
    // component to rerender so that this.metrics will be up to date.
    this.forceUpdate(() => {
      const startingPositions = this.props.lessonGroup.lessons.map(lesson => {
        const metrics = this.metrics[lesson.position];
        return metrics.top + metrics.height / 2;
      });
      this.setState({
        draggedLessonPos: position,
        dragHeight: this.metrics[position].height + tokenMargin,
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
    const dragPosition = this.metrics[this.state.draggedLessonPos].top;
    let newPosition = this.state.draggedLessonPos;
    const currentPositions = this.state.startingPositions.map(
      (midpoint, index) => {
        const position = index + 1;
        if (position === this.state.draggedLessonPos) {
          return delta;
        }
        if (position < this.state.draggedLessonPos && dragPosition < midpoint) {
          newPosition--;
          return this.state.dragHeight;
        }
        if (
          position > this.state.draggedLessonPos &&
          dragPosition + this.state.dragHeight > midpoint
        ) {
          newPosition++;
          return -this.state.dragHeight;
        }
        return 0;
      }
    );
    this.setState({currentPositions, newPosition});
    const targetLessonGroupPos = this.getTargetLessonGroup(clientY);
    this.props.setTargetLessonGroup(targetLessonGroupPos);
  };

  // Given a clientY value of a location on the screen, find the LessonGroupCard
  // corresponding to that location, and return the position of the
  // corresponding activity section within the script.
  getTargetLessonGroup = y => {
    const {lessonGroupMetrics} = this.props;
    const lessonGroupPos = Object.keys(lessonGroupMetrics).find(
      lessonGroupPos => {
        const lessonGroupRect = lessonGroupMetrics[lessonGroupPos];
        return (
          y > lessonGroupRect.top &&
          y < lessonGroupRect.top + lessonGroupRect.height
        );
      }
    );
    return lessonGroupPos ? Number(lessonGroupPos) : null;
  };

  handleDragStop = () => {
    const {lessonGroup, targetLessonGroupPos} = this.props;
    if (targetLessonGroupPos === lessonGroup.position) {
      // When dragging within a lessonGroup, reorder the lesson within that lessonGroup.
      if (this.state.draggedLessonPos !== this.state.newPosition) {
        this.props.reorderLesson(
          lessonGroup.position,
          this.state.draggedLessonPos,
          this.state.newPosition
        );
      }
    } else if (targetLessonGroupPos) {
      // When dragging between lessonGroups, move it to the end of the new lessonGroup.
      this.props.setLessonGroup(
        this.state.draggedLessonPos,
        lessonGroup.position,
        targetLessonGroupPos
      );
    }
    this.props.setTargetLessonGroup(null);

    this.setState({
      draggedLessonPos: null,
      newPosition: null,
      currentPositions: []
    });
    window.removeEventListener('selectstart', this.preventSelect);
    window.removeEventListener('mousemove', this.handleDrag);
    window.removeEventListener('mouseup', this.handleDragStop);
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

  handleRemoveLesson = lessonPosition => {
    this.setState({lessonPosToRemove: lessonPosition});
  };

  handleCloneLesson = lessonPosition => {
    this.setState({lessonPosToClone: lessonPosition});
  };

  handleCloseRemoveLesson = () => {
    this.setState({lessonPosToRemove: null});
  };

  generateLessonKey = () => {
    let lessonNumber = this.props.lessonGroup.lessons.length + 1;
    while (this.props.lessonKeys.includes(`lesson-${lessonNumber}`)) {
      lessonNumber++;
    }

    return `lesson-${lessonNumber}`;
  };

  handleAddLesson = () => {
    const newLessonName = prompt('Enter new lesson name');
    if (newLessonName) {
      this.props.addLesson(
        this.props.lessonGroup.position,
        this.generateLessonKey(),
        newLessonName
      );
    }
  };

  handleChangeDescription = event => {
    this.props.updateLessonGroupField(
      this.props.lessonGroup.position,
      'description',
      event.target.value
    );
  };

  handleChangeBigQuestions = event => {
    this.props.updateLessonGroupField(
      this.props.lessonGroup.position,
      'bigQuestions',
      event.target.value
    );
  };

  handleChangeLessonGroupName = event => {
    this.props.updateLessonGroupField(
      this.props.lessonGroup.position,
      'displayName',
      event.target.value
    );
  };

  render() {
    const {lessonGroup, targetLessonGroupPos} = this.props;
    const {draggedLessonPos} = this.state;
    const isTargetLessonGroup = targetLessonGroupPos === lessonGroup.position;
    return (
      <div
        style={
          isTargetLessonGroup
            ? styles.targetLessonGroupCard
            : styles.lessonGroupCard
        }
      >
        {lessonGroup.userFacing && (
          <div>
            <div style={styles.lessonGroupCardHeader}>
              <span style={styles.title}>Lesson Group Name:</span>
              <input
                value={this.props.lessonGroup.displayName}
                onChange={this.handleChangeLessonGroupName}
                style={{width: 300}}
              />
              <OrderControls
                name={lessonGroup.key || '(none)'}
                move={this.handleMoveLessonGroup}
                remove={this.handleRemoveLessonGroup}
              />
            </div>
            <div>
              <label>
                Description
                <MarkdownEnabledTextarea
                  markdown={this.props.lessonGroup.description}
                  name={'description'}
                  inputRows={Math.max(
                    this.props.lessonGroup.description.split(/\r\n|\r|\n/)
                      .length + 1,
                    2
                  )}
                  handleMarkdownChange={this.handleChangeDescription}
                  features={{imageUpload: true}}
                />
              </label>
              <label>
                Big Questions
                <MarkdownEnabledTextarea
                  markdown={this.props.lessonGroup.bigQuestions}
                  name={'big_questions'}
                  inputRows={Math.max(
                    this.props.lessonGroup.bigQuestions.split(/\r\n|\r|\n/)
                      .length + 1,
                    2
                  )}
                  handleMarkdownChange={this.handleChangeBigQuestions}
                  features={{imageUpload: true}}
                />
              </label>
            </div>
          </div>
        )}
        {lessonGroup.lessons.map(lesson => (
          <LessonToken
            ref={lessonToken => {
              if (lessonToken) {
                const metrics = ReactDOM.findDOMNode(
                  lessonToken
                ).getBoundingClientRect();
                this.metrics[lesson.position] = metrics;
              }
            }}
            key={lesson.key}
            lesson={lesson}
            dragging={!!draggedLessonPos}
            draggedLessonPos={lesson.position === draggedLessonPos}
            delta={this.state.currentPositions[lesson.position - 1] || 0}
            handleDragStart={this.handleDragStart}
            removeLesson={this.handleRemoveLesson}
            cloneLesson={this.handleCloneLesson}
          />
        ))}
        <div style={styles.bottomControls}>
          <button
            onMouseDown={this.handleAddLesson}
            className="btn"
            style={styles.addButton}
            type="button"
          >
            <i style={{marginRight: 7}} className="fa fa-plus-circle" />
            Lesson
          </button>
        </div>
        {/* This dialog lives outside LessonToken because moving it inside can
           interfere with drag and drop or fail to show the modal backdrop. */}
        <RemoveLessonDialog
          lessonGroupPosition={this.props.lessonGroup.position}
          lessonName={
            this.state.lessonPosToRemove
              ? this.props.lessonGroup.lessons[this.state.lessonPosToRemove - 1]
                  .name
              : null
          }
          lessonPosToRemove={this.state.lessonPosToRemove}
          handleClose={this.handleCloseRemoveLesson}
        />
        <CloneLessonDialog
          lessonId={
            this.state.lessonPosToClone
              ? this.props.lessonGroup.lessons[this.state.lessonPosToClone - 1]
                  .id
              : null
          }
          lessonName={
            this.state.lessonPosToClone
              ? this.props.lessonGroup.lessons[this.state.lessonPosToClone - 1]
                  .name
              : null
          }
          handleClose={() => this.setState({lessonPosToClone: null})}
        />
      </div>
    );
  }
}

const styles = {
  checkbox: {
    margin: '0 0 0 7px'
  },
  lessonGroupCard: {
    fontSize: 18,
    background: 'white',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#ccc',
    borderRadius: borderRadius,
    padding: 20,
    margin: 10
  },
  lessonGroupCardHeader: {
    color: '#5b6770',
    marginBottom: 15,
    minHeight: 10
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
  },
  input: {
    width: '100%'
  },
  title: {
    marginRight: 5
  }
};

styles.targetLessonGroupCard = {
  ...styles.lessonGroupCard,
  borderWidth: 5,
  borderColor: color.cyan,
  padding: 16
};

export const UnconnectedLessonGroupCard = LessonGroupCard;

export default connect(
  state => ({}),
  {
    moveGroup,
    removeLesson,
    removeGroup,
    addLesson,
    setLessonGroup,
    reorderLesson,
    updateLessonGroupField
  }
)(LessonGroupCard);
