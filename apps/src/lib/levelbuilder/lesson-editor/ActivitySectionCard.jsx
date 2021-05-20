import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';

import LevelToken from '@cdo/apps/lib/levelbuilder/lesson-editor/LevelToken';
import OrderControls from '@cdo/apps/lib/levelbuilder/OrderControls';
import RemoveLevelDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/RemoveLevelDialog';
import color from '@cdo/apps/util/color';
import {activitySectionShape} from '@cdo/apps/lib/levelbuilder/shapes';
import {tokenMargin, borderRadius} from '@cdo/apps/lib/levelbuilder/constants';
import {
  moveActivitySection,
  removeActivitySection,
  updateActivitySectionField,
  reorderLevel,
  moveLevelToActivitySection,
  addLevel,
  NEW_LEVEL_ID
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';

import ActivitySectionCardButtons from './ActivitySectionCardButtons';
import {buildProgrammingExpressionMarkdown} from '@cdo/apps/templates/lessonOverview/StyledCodeBlock';

// When dragging within this many pixels of the top or bottom of the screen,
// start scrolling the page.
const SCROLL_THRESHOLD = 100;

// WHen the scroll threshold is reached, scroll this many pixels for each pixel
// the cursor has moved beyond the threshold.
const SCROLL_RATIO = 0.2;

/*
An activity section is a chunk of an activity. This could be a section
of text that explains to the teacher what to say or do to run the lesson or
it could be a section of a lesson that shows a set of levels that are used
at that point in the lesson (also known as a progression). ActivitySections
can have tips attached to the beginning of their content and can be marked with
remarks as well.
 */

class ActivitySectionCard extends Component {
  static propTypes = {
    activitySection: activitySectionShape.isRequired,
    activityPosition: PropTypes.number.isRequired,
    activitySectionsCount: PropTypes.number.isRequired,
    activitiesCount: PropTypes.number.isRequired,
    activitySectionMetrics: PropTypes.array.isRequired,
    updateTargetActivitySection: PropTypes.func.isRequired,
    clearTargetActivitySection: PropTypes.func.isRequired,
    targetActivityPos: PropTypes.number,
    targetActivitySectionPos: PropTypes.number,
    updateActivitySectionMetrics: PropTypes.func.isRequired,
    hasLessonPlan: PropTypes.bool.isRequired,

    //redux
    moveActivitySection: PropTypes.func.isRequired,
    removeActivitySection: PropTypes.func.isRequired,
    updateActivitySectionField: PropTypes.func.isRequired,
    reorderLevel: PropTypes.func.isRequired,
    moveLevelToActivitySection: PropTypes.func.isRequired,
    addLevel: PropTypes.func.isRequired
  };

  /**
   * To be populated with the bounding client rect of each level token element.
   */
  levelTokenMetrics = {};

  state = {
    levelPosToRemove: null,
    currentYOffsets: [],
    draggedLevelPos: null
  };

  initialDragState = {
    dragHeight: null,
    initialClientY: null,
    initialScrollTop: null,
    newPosition: null,
    startingYMidpoints: null
  };

  dragState = this.initialDragState;

  handleDragStart = (position, {clientY}) => {
    // The bounding boxes in this.levelTokenMetrics will be stale if the user scrolled the
    // page since the last time this component was updated. Therefore, force the
    // component to rerender so that this.levelTokenMetrics will be up to date.
    this.forceUpdate(() => {
      const startingYMidpoints = this.props.activitySection.scriptLevels.map(
        scriptLevel => {
          const metrics = this.levelTokenMetrics[scriptLevel.position];
          return metrics.top + metrics.height / 2;
        }
      );

      this.dragState = {
        dragHeight: this.levelTokenMetrics[position].height + tokenMargin,
        initialClientY: clientY,
        lastClientY: clientY,
        initialScrollTop: $(window).scrollTop(),
        newPosition: position,
        startingYMidpoints
      };

      this.setState(
        {
          draggedLevelPos: position
        },
        () => this.props.updateActivitySectionMetrics()
      );
      window.addEventListener('selectstart', this.preventSelect);
      window.addEventListener('mousemove', this.handleDrag);
      window.addEventListener('scroll', this.handleScroll);
      window.addEventListener('mouseup', this.handleDragStop);
    });
  };

  handleDrag = ({clientY}) => {
    this.dragState.lastClientY = clientY;
    this.handleDragOrScroll();
  };

  handleDragOrScroll = () => {
    const clientY = this.dragState.lastClientY;
    const deltaClientY = clientY - this.dragState.initialClientY;
    const scrollTop = $(window).scrollTop();
    const deltaScrollTop = scrollTop - this.dragState.initialScrollTop;
    const draggedYPos = this.levelTokenMetrics[this.state.draggedLevelPos].top;
    let newPosition = this.state.draggedLevelPos;
    const currentYOffsets = this.dragState.startingYMidpoints.map(
      (startingYMidpoint, index) => {
        const midpoint = startingYMidpoint - deltaScrollTop;
        const position = index + 1;
        if (position === this.state.draggedLevelPos) {
          return deltaClientY + deltaScrollTop;
        }
        if (position < this.state.draggedLevelPos && draggedYPos < midpoint) {
          newPosition--;
          return this.dragState.dragHeight;
        }
        if (
          position > this.state.draggedLevelPos &&
          draggedYPos + this.dragState.dragHeight > midpoint
        ) {
          newPosition++;
          return -this.dragState.dragHeight;
        }
        return 0;
      }
    );
    this.dragState.newPosition = newPosition;
    this.setState({currentYOffsets});
    this.props.updateTargetActivitySection(clientY);
    this.triggerScroll(clientY);
  };

  handleScroll = () => {
    this.props.updateActivitySectionMetrics();
    this.handleDragOrScroll();
  };

  triggerScroll = clientY => {
    if (clientY < SCROLL_THRESHOLD) {
      const step = (SCROLL_THRESHOLD - clientY) * SCROLL_RATIO;
      const scrollTop = $(window).scrollTop();
      $(window).scrollTop(scrollTop - step);
    }
    const bottom = $(window).height() - clientY;
    if (bottom < SCROLL_THRESHOLD) {
      const step = (SCROLL_THRESHOLD - bottom) * SCROLL_RATIO;
      const scrollTop = $(window).scrollTop();
      $(window).scrollTop(scrollTop + step);
    }
  };

  handleDragStop = () => {
    // Remove event handlers first, so that a JS error later doesn't prevent you
    // from dropping the dragged level.
    window.removeEventListener('selectstart', this.preventSelect);
    window.removeEventListener('mousemove', this.handleDrag);
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('mouseup', this.handleDragStop);

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
      if (this.state.draggedLevelPos !== this.dragState.newPosition) {
        this.props.reorderLevel(
          activityPosition,
          activitySection.position,
          this.state.draggedLevelPos,
          this.dragState.newPosition
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

    this.props.clearTargetActivitySection();

    this.dragState = this.initialDragState;
    this.setState({
      draggedLevelPos: null,
      currentYOffsets: []
    });
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
    const firstActivitySectionInLesson =
      this.props.activitySection.position === 1 &&
      this.props.activityPosition === 1;
    const lastActivitySectionInLesson =
      this.props.activitySection.position ===
        this.props.activitySectionsCount &&
      this.props.activityPosition === this.props.activitiesCount;

    if (
      (!firstActivitySectionInLesson && direction === 'up') ||
      (!lastActivitySectionInLesson && direction === 'down')
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

  handleChangeDuration = event => {
    this.props.updateActivitySectionField(
      this.props.activityPosition,
      this.props.activitySection.position,
      'duration',
      event.target.value
    );
  };

  handleChangeProgressionName = event => {
    this.props.updateActivitySectionField(
      this.props.activityPosition,
      this.props.activitySection.position,
      'progressionName',
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

  appendMarkdownSyntax = strToAppend => {
    const currentText = this.props.activitySection.text;
    this.props.updateActivitySectionField(
      this.props.activityPosition,
      this.props.activitySection.position,
      'text',
      currentText + strToAppend
    );
  };

  insertMarkdownSyntaxAtSelection = newText => {
    // If we (for whatever reason) don't have a reference for the textarea, we
    // can't get the selection location. In that case, we could probably do
    // nothing or throw an error or something. For now, let's just default to
    // appending the text to the end.
    if (!this.editorTextAreaRef) {
      return this.appendMarkdownSyntax(newText);
    }
    const currentText = this.props.activitySection.text;
    const selectionStart = this.editorTextAreaRef.selectionStart;
    const selectionEnd = this.editorTextAreaRef.selectionEnd || selectionStart;
    const resultingText =
      currentText.slice(0, selectionStart) +
      newText +
      currentText.slice(selectionEnd);
    this.props.updateActivitySectionField(
      this.props.activityPosition,
      this.props.activitySection.position,
      'text',
      resultingText
    );
  };

  appendProgrammingExpressionLink = programmingExpression => {
    this.appendMarkdownSyntax(
      buildProgrammingExpressionMarkdown(programmingExpression)
    );
  };

  appendResourceLink = resourceKey => {
    this.appendMarkdownSyntax(`\n[r ${resourceKey}]`);
  };

  appendVocabularyLink = vocabularyKey => {
    this.appendMarkdownSyntax(`\n[v ${vocabularyKey}]`);
  };

  appendSlide = () => {
    this.insertMarkdownSyntaxAtSelection(
      '<i class="fa fa-list-alt" aria-hidden="true"></i> '
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
        key: level.key,
        position: newLevelPosition,
        kind: 'puzzle',
        bonus: false,
        assessment: false,
        challenge: false,
        expand: false
      }
    );
  };

  handleUploadImage = (url, expandable) => {
    const param = expandable ? 'expandable' : '';
    this.appendMarkdownSyntax(`\n\n![${param}](${url})`);
  };

  render() {
    const {
      activitySection,
      targetActivityPos,
      targetActivitySectionPos,
      activityPosition,
      hasLessonPlan
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
            {hasLessonPlan && (
              <span>
                <span style={styles.title}>Title:</span>
                <input
                  style={styles.titleInput}
                  value={this.props.activitySection.displayName}
                  onChange={this.handleChangeDisplayName}
                />
                <span style={styles.title}>Duration:</span>
                <input
                  style={styles.durationInput}
                  value={this.props.activitySection.duration}
                  onChange={this.handleChangeDuration}
                />
              </span>
            )}
            <OrderControls
              name={
                this.props.activitySection.displayName ||
                'Unnamed Activity Section'
              }
              move={this.handleMoveActivitySection}
              remove={this.handleRemoveActivitySection}
              item={this.props.activitySection}
              itemType={'activitySection'}
            />
          </label>
          {hasLessonPlan && (
            <div style={styles.checkboxesAndButtons}>
              <span style={styles.checkboxes}>
                <label style={styles.labelAndCheckbox}>
                  Remarks
                  <input
                    checked={this.props.activitySection.remarks}
                    onChange={this.toggleRemarks}
                    type="checkbox"
                    style={styles.checkbox}
                  />
                </label>
              </span>
            </div>
          )}
        </div>
        {hasLessonPlan && (
          <textarea
            value={this.props.activitySection.text}
            ref={ref => (this.editorTextAreaRef = ref)}
            rows={Math.max(
              this.props.activitySection.text.split(/\r\n|\r|\n/).length + 1,
              2
            )}
            style={styles.input}
            onChange={this.handleChangeText}
          />
        )}
        {this.props.activitySection.scriptLevels.length > 0 && (
          <div>
            <label>
              <span style={styles.title}>Progression Title:</span>
              <input
                style={styles.titleInput}
                value={this.props.activitySection.progressionName}
                onChange={this.handleChangeProgressionName}
              />
            </label>
            {this.props.activitySection.scriptLevels.map(scriptLevel => (
              <LevelToken
                ref={levelToken => {
                  if (levelToken) {
                    const metrics = ReactDOM.findDOMNode(
                      levelToken
                    ).getBoundingClientRect();
                    this.levelTokenMetrics[scriptLevel.position] = metrics;
                  }
                }}
                key={scriptLevel.position + '_' + scriptLevel.activeId[0]}
                scriptLevel={scriptLevel}
                removeLevel={this.handleRemoveLevel}
                activitySectionPosition={this.props.activitySection.position}
                activityPosition={activityPosition}
                dragging={!!draggedLevelPos}
                draggedLevelPos={scriptLevel.position === draggedLevelPos}
                delta={
                  this.state.currentYOffsets[scriptLevel.position - 1] || 0
                }
                handleDragStart={this.handleDragStart}
              />
            ))}
          </div>
        )}
        <ActivitySectionCardButtons
          activitySection={this.props.activitySection}
          addLevel={this.handleAddLevel}
          uploadImage={this.handleUploadImage}
          activityPosition={this.props.activityPosition}
          appendProgrammingExpressionLink={this.appendProgrammingExpressionLink}
          appendResourceLink={this.appendResourceLink}
          appendVocabularyLink={this.appendVocabularyLink}
          appendSlide={this.appendSlide}
          hasLessonPlan={hasLessonPlan}
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
    marginBottom: 15,
    overflow: 'hidden'
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
  },
  titleInput: {
    width: 275,
    marginRight: 10
  },
  durationInput: {
    width: 50
  }
};

styles.targetActivitySectionCard = {
  ...styles.activitySectionCard,
  borderWidth: 5,
  borderColor: color.cyan,
  padding: 16
};

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
