import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {tokenMargin, borderRadius} from '@cdo/apps/lib/levelbuilder/constants';
import OrderControls from '@cdo/apps/lib/levelbuilder/OrderControls';
import ActivitySectionCardButtons from './ActivitySectionCardButtons';
import {connect} from 'react-redux';
import {
  moveActivitySection,
  removeActivitySection,
  updateActivitySectionField,
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
of text that explains to the teacher what to say or do to run the lesson or
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
    activitySectionMetrics: PropTypes.array.isRequired,
    updateTargetActivitySection: PropTypes.func.isRequired,
    targetActivityPos: PropTypes.number,
    targetActivitySectionPos: PropTypes.number,
    updateActivitySectionMetrics: PropTypes.func.isRequired,

    //redux
    moveActivitySection: PropTypes.func,
    removeActivitySection: PropTypes.func,
    updateActivitySectionField: PropTypes.func,
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
      const startingPositions = this.props.activitySection.scriptLevels.map(
        scriptLevel => {
          const metrics = this.metrics[scriptLevel.position];
          return metrics.top + metrics.height / 2;
        }
      );
      this.setState(
        {
          draggedLevelPos: position,
          dragHeight: this.metrics[position].height + tokenMargin,
          initialClientY: clientY,
          newPosition: position,
          startingPositions
        },
        () => this.props.updateActivitySectionMetrics()
      );
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
    this.props.updateTargetActivitySection(clientY);
  };

  handleDragStop = () => {
    const {
      activitySection,
      activityPosition,
      targetActivityPos,
      targetActivitySectionPos
    } = this.props;
    if (
      targetActivityPos === activityPosition &&
      targetActivitySectionPos === activitySection.position
    ) {
      // When dragging within a activitySection, reorder the level within that activitySection.
      if (this.state.draggedLevelPos !== this.state.newPosition) {
        this.props.reorderLevel(
          activityPosition,
          activitySection.position,
          this.state.draggedLevelPos,
          this.state.newPosition
        );
      }
    } else if (targetActivityPos && targetActivitySectionPos) {
      // When dragging between activitySections, move it to the end of the new activitySection.
      this.props.moveLevelToActivitySection(
        activityPosition,
        activitySection.position,
        this.state.draggedLevelPos,
        targetActivityPos,
        targetActivitySectionPos
      );
    }

    // shortcut to clear target activity section
    this.props.updateTargetActivitySection(-1);

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

  handleRemoveLevel = levelPos => {
    this.setState({levelPosToRemove: levelPos});
  };

  handleClose = () => {
    this.setState({levelPosToRemove: null});
  };

  preventSelect(e) {
    e.preventDefault();
  }

  handleAddLevel = level => {
    const newLevelPosition = this.props.activitySection.scriptLevels.length + 1;
    this.props.addLevel(
      this.props.activityPosition,
      this.props.activitySection.position,
      {
        id: NEW_LEVEL_ID,
        levels: [
          {
            id: level.id,
            name: level.name,
            url: `/levels/${level.id}/edit`,
            icon: level.icon || 'fa-desktop',
            isUnplugged: level.isUnplugged,
            isConceptLevel: level.isConceptLevel,
            skin: level.skin,
            videoKey: level.videoKey,
            concepts: level.concepts,
            conceptDifficulty: level.conceptDifficulty
          }
        ],
        activeId: level.id,
        position: newLevelPosition,
        kind: 'puzzle',
        bonus: false,
        assessment: false,
        challenge: false,
        expand: false
      }
    );
  };

  render() {
    const {
      activitySection,
      targetActivityPos,
      targetActivitySectionPos,
      activityPosition
    } = this.props;
    const {draggedLevelPos, levelPosToRemove} = this.state;
    const isTargetActivitySection =
      targetActivityPos === activityPosition &&
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
              {this.props.activitySection.scriptLevels.length === 0 && (
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
        {this.props.activitySection.scriptLevels.length > 0 &&
          this.props.activitySection.scriptLevels.map(scriptLevel => (
            <LevelToken
              ref={levelToken => {
                if (levelToken) {
                  const metrics = ReactDOM.findDOMNode(
                    levelToken
                  ).getBoundingClientRect();
                  this.metrics[scriptLevel.position] = metrics;
                }
              }}
              key={scriptLevel.position + '_' + scriptLevel.activeId[0]}
              scriptLevel={scriptLevel}
              removeLevel={this.handleRemoveLevel}
              activitySectionPosition={this.props.activitySection.position}
              activityPosition={activityPosition}
              dragging={!!draggedLevelPos}
              draggedLevelPos={scriptLevel.position === draggedLevelPos}
              delta={this.state.currentPositions[scriptLevel.position - 1] || 0}
              handleDragStart={this.handleDragStart}
            />
          ))}
        <ActivitySectionCardButtons
          activitySection={this.props.activitySection}
          addLevel={this.handleAddLevel}
          activityPosition={this.props.activityPosition}
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
    updateActivitySectionField
  }
)(ActivitySectionCard);
