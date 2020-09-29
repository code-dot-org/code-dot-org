import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {borderRadius} from '@cdo/apps/lib/levelbuilder/constants';
import OrderControls from '@cdo/apps/lib/levelbuilder/OrderControls';
import {
  moveLesson,
  moveGroup,
  removeLesson,
  addLesson,
  removeGroup,
  convertGroupToUserFacing
} from '@cdo/apps/lib/levelbuilder/script-editor/scriptEditorRedux';
import LessonToken from '@cdo/apps/lib/levelbuilder/script-editor/LessonToken';

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
    marginBottom: 15
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

export class LessonGroupCard extends Component {
  static propTypes = {
    lessonGroup: PropTypes.object.isRequired,
    lessonGroupsCount: PropTypes.number,

    // from redux
    moveLesson: PropTypes.func.isRequired,
    moveGroup: PropTypes.func.isRequired,
    removeLesson: PropTypes.func.isRequired,
    removeGroup: PropTypes.func.isRequired,
    addLesson: PropTypes.func.isRequired,
    convertGroupToUserFacing: PropTypes.func.isRequired
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
    this.props.removeLesson(this.props.lessonGroup.position, lessonPosition);
  };

  generateLessonKey = () => {
    let lessonNumber = this.props.lessonGroup.lessons.length + 1;
    while (
      this.props.lessonGroup.lessons.some(
        lesson => lesson.key === `lesson-${lessonNumber}`
      )
    ) {
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

  render() {
    const {lessonGroup} = this.props;
    return (
      <div style={styles.lessonGroupCard}>
        <div style={styles.lessonGroupCardHeader}>
          {lessonGroup.user_facing
            ? `Lesson Group: "${lessonGroup.display_name}"`
            : 'Lesson Group: Not User Facing (No Display Name)'}
          <OrderControls
            name={lessonGroup.key || '(none)'}
            move={this.handleMoveLessonGroup}
            remove={this.handleRemoveLessonGroup}
          />
        </div>
        {lessonGroup.lessons.map(lesson => (
          <LessonToken
            key={lesson.key}
            lessonGroupPosition={this.props.lessonGroup.position}
            lesson={lesson}
            dragging={false}
            draggedLessonPos={false}
            delta={0}
            handleDragStart={() => {}}
            removeLesson={this.handleRemoveLesson}
          />
        ))}
        <div style={styles.bottomControls}>
          <button
            onMouseDown={this.handleAddLesson}
            className="btn"
            style={styles.addButton}
            type="button"
          >
            <i style={{marginRight: 7}} className="fa fa-pencil" />
            Add Lesson
          </button>
          {!this.props.lessonGroup.user_facing && (
            <button
              onMouseDown={this.handleMakeUserFacing.bind(
                null,
                lessonGroup.position
              )}
              className="btn"
              style={styles.addButton}
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
  {
    moveLesson,
    moveGroup,
    removeLesson,
    removeGroup,
    addLesson,
    convertGroupToUserFacing
  }
)(LessonGroupCard);
