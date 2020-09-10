import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  levelTokenMargin,
  borderRadius
} from '@cdo/apps/lib/levelbuilder/constants';
import OrderControls from '@cdo/apps/lib/levelbuilder/OrderControls';
import ActivitySectionCardButtons from './ActivitySectionCardButtons';
import {connect} from 'react-redux';
import {
  moveActivitySection,
  removeActivitySection,
  updateActivitySectionField,
  addTip,
  reorderLevel,
  moveLevelToActivitySection,
  addLevel,
  NEW_LEVEL_ID
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import LevelToken from '@cdo/apps/lib/levelbuilder/lesson-editor/LevelToken';
import RemoveLevelDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/RemoveLevelDialog';
import ReactDOM from 'react-dom';
import color from '@cdo/apps/util/color';
import {activitySectionShape} from '@cdo/apps/lib/levelbuilder/shapes';

const styles = {
  checkbox: {
    margin: '0 0 0 7px'
  },
  activitySectionCard: {
    fontSize: 18,
    background: 'white',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#ccc',
    borderRadius: borderRadius,
    padding: 20,
    margin: 10
  },
  activitySectionCardHeader: {
    color: '#5b6770',
    marginBottom: 15
  },
  labelAndCheckbox: {
    fontSize: 13,
    marginTop: 3,
    marginRight: 10
  },
  input: {
    width: '100%'
  },
  bottomControls: {
    height: 30,
    display: 'flex',
    justifyContent: 'space-between'
  },
  addLevel: {
    fontSize: 14,
    background: '#eee',
    border: '1px solid #ddd',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
    margin: '0 5px 0 0'
  },
  checkboxesAndButtons: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  checkboxes: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    marginRight: 5
  }
};

styles.targetActivitySectionCard = {
  ...styles.activitySectionCard,
  borderWidth: 5,
  borderColor: color.cyan,
  padding: 16
};

/*
An activity section is a chunk of an activity. This could be a section
or text that explains to the teacher what to say or do to run the lesson or
it could be a section of a lesson that shows a set of levels that are used
at that point in the lesson (also known as a progression). ActivitySections
can have tips attached to the beginning of their content and can be marked with
slide or remarks as well.
 */

class ActivitySectionCard extends Component {
  static propTypes = {
    activitySection: activitySectionShape,
    activityPosition: PropTypes.number,
    activitySectionsCount: PropTypes.number,
    activitiesCount: PropTypes.number,
    activitySectionMetrics: PropTypes.object,
    setTargetActivitySection: PropTypes.func,
    targetActivitySectionPos: PropTypes.number,

    //redux
    moveActivitySection: PropTypes.func,
    removeActivitySection: PropTypes.func,
    updateActivitySectionField: PropTypes.func,
    addTip: PropTypes.func,
    reorderLevel: PropTypes.func,
    moveLevelToActivitySection: PropTypes.func,
    addLevel: PropTypes.func
  };

  /**
   * To be populated with the bounding client rect of each level token element.
   */
  metrics = {};

  state = {
    levelPosToRemove: null,
    currentPositions: [],
    draggedLevelPos: null,
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
      const startingPositions = this.props.activitySection.levels.map(level => {
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
    const targetActivitySectionPos = this.getTargetActivitySection(clientY);
    this.props.setTargetActivitySection(targetActivitySectionPos);
  };

  // Given a clientY value of a location on the screen, find the ActivitySectionCard
  // corresponding to that location, and return the position of the
  // corresponding activity section within the script.
  getTargetActivitySection = y => {
    const {activitySectionMetrics} = this.props;
    const activitySectionPos = Object.keys(activitySectionMetrics).find(
      activitySectionPos => {
        const activitySectionRect = activitySectionMetrics[activitySectionPos];
        return (
          y > activitySectionRect.top &&
          y < activitySectionRect.top + activitySectionRect.height
        );
      }
    );
    return activitySectionPos ? Number(activitySectionPos) : null;
  };

  handleDragStop = () => {
    const {
      activitySection,
      activityPosition,
      targetActivitySectionPos
    } = this.props;
    if (targetActivitySectionPos === activitySection.position) {
      // When dragging within a activitySection, reorder the level within that activitySection.
      if (this.state.draggedLevelPos !== this.state.newPosition) {
        this.props.reorderLevel(
          activityPosition,
          activitySection.position,
          this.state.draggedLevelPos,
          this.state.newPosition
        );
      }
    } else if (targetActivitySectionPos) {
      // When dragging between activitySections, move it to the end of the new activitySection.
      this.props.moveLevelToActivitySection(
        activityPosition,
        activitySection.position,
        this.state.draggedLevelPos,
        targetActivitySectionPos
      );
    }
    this.props.setTargetActivitySection(null);

    this.setState({
      draggedLevelPos: null,
      newPosition: null,
      currentPositions: []
    });
    window.removeEventListener('selectstart', this.preventSelect);
    window.removeEventListener('mousemove', this.handleDrag);
    window.removeEventListener('mouseup', this.handleDragStop);
  };

  toggleSlides = () => {
    this.props.updateActivitySectionField(
      this.props.activityPosition,
      this.props.activitySection.position,
      'slide',
      !this.props.activitySection.slide
    );
  };

  toggleRemarks = () => {
    this.props.updateActivitySectionField(
      this.props.activityPosition,
      this.props.activitySection.position,
      'remarks',
      !this.props.activitySection.remarks
    );
  };

  handleMoveActivitySection = direction => {
    if (
      (this.props.activitySection.position !== 1 && direction === 'up') ||
      (this.props.activitySection.position !==
        this.props.activitySectionsCount &&
        direction === 'down')
    ) {
      this.props.moveActivitySection(
        this.props.activityPosition,
        this.props.activitySection.position,
        direction
      );
    }
  };

  handleRemoveActivitySection = () => {
    this.props.removeActivitySection(
      this.props.activityPosition,
      this.props.activitySection.position
    );
  };

  handleChangeDisplayName = event => {
    this.props.updateActivitySectionField(
      this.props.activityPosition,
      this.props.activitySection.position,
      'displayName',
      event.target.value
    );
  };

  handleChangeText = event => {
    this.props.updateActivitySectionField(
      this.props.activityPosition,
      this.props.activitySection.position,
      'text',
      event.target.value
    );
  };

  handleAddTip = tip => {
    this.props.addTip(
      this.props.activityPosition,
      this.props.activitySection.position,
      tip
    );
  };

  handleEditTip = tip => {
    console.log(`edit tip ${tip}`);
  };

  handleRemoveLevel = levelPos => {
    this.setState({levelPosToRemove: levelPos});
  };

  handleClose = () => {
    this.setState({levelPosToRemove: null});
  };

  preventSelect(e) {
    e.preventDefault();
  }

  handleAddLevel = () => {
    const newLevelPosition = this.props.activitySection.levels.length + 1;
    this.props.addLevel(
      this.props.activityPosition,
      this.props.activitySection.position,
      //temporary set up where we just add a holding place level
      {
        ids: [NEW_LEVEL_ID],
        activeId: NEW_LEVEL_ID,
        status: 'not started',
        url: 'https://levelbuilder-studio.code.org/levels/598/edit',
        icon: 'fa-desktop',
        name: `Level ${newLevelPosition}`,
        isUnplugged: false,
        levelNumber: newLevelPosition,
        isCurrentLevel: false,
        isConceptLevel: false,
        sublevels: [],
        position: newLevelPosition,
        kind: 'puzzle',
        skin: null,
        videoKey: null,
        concepts: '',
        conceptDifficulty: '',
        named: false,
        assessment: false,
        challenge: false
      }
    );
  };

  render() {
    const {
      activitySection,
      targetActivitySectionPos,
      activityPosition
    } = this.props;
    const {draggedLevelPos, levelPosToRemove} = this.state;
    const isTargetActivitySection =
      targetActivitySectionPos === activitySection.position;
    return (
      <div
        style={
          isTargetActivitySection
            ? styles.targetActivitySectionCard
            : styles.activitySectionCard
        }
      >
        <div style={styles.activitySectionCardHeader}>
          <label>
            <span style={styles.title}>Title:</span>
            <input
              value={this.props.activitySection.displayName}
              onChange={this.handleChangeDisplayName}
            />
            <OrderControls
              name={
                this.props.activitySection.displayName ||
                this.props.activitySection.key
              }
              move={this.handleMoveActivitySection}
              remove={this.handleRemoveActivitySection}
            />
          </label>
          <div style={styles.checkboxesAndButtons}>
            <span style={styles.checkboxes}>
              {this.props.activitySection.levels.length === 0 && (
                <label style={styles.labelAndCheckbox}>
                  Remarks
                  <input
                    checked={this.props.activitySection.remarks}
                    onChange={this.toggleRemarks}
                    type="checkbox"
                    style={styles.checkbox}
                  />
                </label>
              )}
              <label style={styles.labelAndCheckbox}>
                Slides
                <input
                  checked={this.props.activitySection.slide}
                  onChange={this.toggleSlides}
                  type="checkbox"
                  style={styles.checkbox}
                />
              </label>
            </span>
          </div>
        </div>
        <textarea
          value={this.props.activitySection.text}
          rows={Math.max(
            this.props.activitySection.text.split(/\r\n|\r|\n/).length + 1,
            2
          )}
          style={styles.input}
          onChange={this.handleChangeText}
        />
        {this.props.activitySection.levels.length > 0 &&
          this.props.activitySection.levels.map(level => (
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
              removeLevel={this.handleRemoveLevel}
              activitySectionPosition={this.props.activitySection.position}
              activityPosition={activityPosition}
              dragging={!!draggedLevelPos}
              draggedLevelPos={level.position === draggedLevelPos}
              delta={this.state.currentPositions[level.position - 1] || 0}
              handleDragStart={this.handleDragStart}
            />
          ))}
        <ActivitySectionCardButtons
          activitySection={this.props.activitySection}
          addTip={this.handleAddTip}
          editTip={this.handleEditTip}
          addLevel={this.handleAddLevel}
        />
        {/* This dialog lives outside LevelToken because moving it inside can
           interfere with drag and drop or fail to show the modal backdrop. */}
        <RemoveLevelDialog
          activitySection={this.props.activitySection}
          activityPosition={activityPosition}
          levelPosToRemove={levelPosToRemove}
          handleClose={this.handleClose}
        />
      </div>
    );
  }
}

export const UnconnectedActivitySectionCard = ActivitySectionCard;

export default connect(
  state => ({}),
  {
    reorderLevel,
    moveLevelToActivitySection,
    addLevel,
    moveActivitySection,
    removeActivitySection,
    updateActivitySectionField,
    addTip
  }
)(ActivitySectionCard);
