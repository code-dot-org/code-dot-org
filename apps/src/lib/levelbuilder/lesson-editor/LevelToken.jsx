import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Motion, spring} from 'react-motion';
import color from '@cdo/apps/util/color';
import {borderRadius, tokenMargin} from '@cdo/apps/lib/levelbuilder/constants';
import {scriptLevelShape} from '@cdo/apps/lib/levelbuilder/shapes';
import ProgressBubble from '@cdo/apps/templates/progress/ProgressBubble';
import LevelTokenDetails from '@cdo/apps/lib/levelbuilder/lesson-editor/LevelTokenDetails';
import {toggleExpand} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import _ from 'lodash';

/**
 * Component for editing puzzle dots with one or more level variants.
 */
export class UnconnectedLevelToken extends Component {
  static propTypes = {
    activitySectionPosition: PropTypes.number.isRequired,
    activityPosition: PropTypes.number.isRequired,
    scriptLevel: scriptLevelShape.isRequired,
    dragging: PropTypes.bool,
    draggedLevelPos: PropTypes.bool,
    delta: PropTypes.number,
    handleDragStart: PropTypes.func,
    removeLevel: PropTypes.func.isRequired,

    // from redux
    toggleExpand: PropTypes.func
  };

  render() {
    const {draggedLevelPos, scriptLevel} = this.props;
    const springConfig = {stiffness: 1000, damping: 80};

    return (
      <Motion
        style={
          draggedLevelPos
            ? {
                y: this.props.dragging ? this.props.delta : 0,
                scale: spring(1.02, springConfig),
                shadow: spring(5, springConfig)
              }
            : {
                y: this.props.dragging
                  ? spring(this.props.delta, springConfig)
                  : 0,
                scale: 1,
                shadow: 0
              }
        }
        key={scriptLevel.position}
      >
        {// Use react-motion to interpolate the following values and create
        // smooth transitions.
        ({y, scale, shadow}) => (
          <LevelTokenContents
            y={y}
            scale={scale}
            shadow={shadow}
            draggedLevelPos={draggedLevelPos}
            scriptLevel={scriptLevel}
            handleDragStart={this.props.handleDragStart}
            toggleExpand={this.props.toggleExpand}
            removeLevel={this.props.removeLevel}
            activitySectionPosition={this.props.activitySectionPosition}
            activityPosition={this.props.activityPosition}
          />
        )}
      </Motion>
    );
  }
}

// This component renders an uneditable view of the script level object.
// Editing of script level properties is controlled by LevelTokenDetails,
// which expands or collapses by clicking this component.
export class LevelTokenContents extends Component {
  static propTypes = {
    y: PropTypes.number.isRequired,
    scale: PropTypes.number.isRequired,
    shadow: PropTypes.number.isRequired,
    draggedLevelPos: PropTypes.bool,
    scriptLevel: scriptLevelShape.isRequired,
    handleDragStart: PropTypes.func.isRequired,
    toggleExpand: PropTypes.func.isRequired,
    removeLevel: PropTypes.func.isRequired,
    activitySectionPosition: PropTypes.number.isRequired,
    activityPosition: PropTypes.number.isRequired
  };

  handleDragStart = e => {
    this.props.handleDragStart(this.props.scriptLevel.position, e);
  };

  toggleExpand = () => {
    this.props.toggleExpand(
      this.props.activityPosition,
      this.props.activitySectionPosition,
      this.props.scriptLevel.position
    );
  };

  handleRemove = () => {
    this.props.removeLevel(this.props.scriptLevel.position);
  };

  scriptLevelForProgressBubble = activeLevel => {
    let progressBubbleLevel = _.cloneDeep(activeLevel);

    progressBubbleLevel['isCurrentLevel'] = false;
    progressBubbleLevel['status'] = LevelStatus.not_tried;
    progressBubbleLevel['levelNumber'] = this.props.scriptLevel.levelNumber;
    progressBubbleLevel['kind'] = this.props.scriptLevel.kind;

    return progressBubbleLevel;
  };

  render() {
    const {scriptLevel} = this.props;
    const hasVariants = scriptLevel.levels.length > 1;

    const activeLevel = hasVariants
      ? scriptLevel.levels.filter(level => {
          return level.id === scriptLevel.activeId;
        })[0]
      : scriptLevel.levels[0];

    const inactiveLevelNames = hasVariants
      ? scriptLevel.levels
          .filter(level => {
            return level.id !== activeLevel.id;
          })
          .map(level => level.name)
      : [];

    const progressBubbleLevel = this.scriptLevelForProgressBubble(activeLevel);
    return (
      <div
        style={Object.assign({}, styles.levelToken, {
          transform: `translate3d(0, ${this.props.y}px, 0) scale(${
            this.props.scale
          })`,
          boxShadow: `${color.shadow} 0 ${this.props.shadow}px ${this.props
            .shadow * 3}px`,
          zIndex: this.props.draggedLevelPos ? 1000 : 500 - scriptLevel.position
        })}
      >
        <div style={styles.reorder} onMouseDown={this.handleDragStart}>
          <i className="fa fa-arrows-v" />
        </div>
        <span
          style={styles.levelTokenName}
          onClick={this.toggleExpand}
          className="uitest-level-token-name"
        >
          <span style={styles.levelArea}>
            <span style={styles.titleAndBubble}>
              <ProgressBubble
                hideToolTips={true}
                level={progressBubbleLevel}
                disabled={true}
              />
              <span style={styles.levelTitle}>{scriptLevel.key}</span>
            </span>
            {scriptLevel.assessment && (
              <span style={styles.tag}>assessment</span>
            )}
            {scriptLevel.bonus && <span style={styles.tag}>bonus</span>}
            {scriptLevel.challenge && <span style={styles.tag}>challenge</span>}
            {scriptLevel.levels.length > 1 && (
              <span style={styles.tag}>variants</span>
            )}
          </span>
        </span>
        <div
          style={styles.edit}
          onClick={() => {
            const win = window.open(activeLevel.url, 'noopener', 'noreferrer');
            win.focus();
          }}
        >
          <i className="fa fa-pencil" />
        </div>
        <div style={styles.remove} onMouseDown={this.handleRemove}>
          <i className="fa fa-times" />
        </div>
        {scriptLevel.expand && (
          <LevelTokenDetails
            scriptLevel={scriptLevel}
            activitySectionPosition={this.props.activitySectionPosition}
            activityPosition={this.props.activityPosition}
            inactiveLevelNames={inactiveLevelNames}
          />
        )}
      </div>
    );
  }
}

const styles = {
  levelToken: {
    fontSize: 13,
    position: 'relative',
    background: '#eee',
    borderRadius: borderRadius,
    margin: `${tokenMargin}px 0`
  },
  reorder: {
    fontSize: 16,
    display: 'table-cell',
    background: '#ddd',
    border: '1px solid #bbb',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.6)',
    padding: '7px 15px',
    borderTopLeftRadius: borderRadius,
    borderBottomLeftRadius: borderRadius,
    cursor: 'ns-resize'
  },
  levelTokenName: {
    padding: 7,
    display: 'table-cell',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
    width: '100%',
    borderTop: '1px solid #ddd',
    borderBottom: '1px solid #ddd',
    cursor: 'pointer'
  },
  tag: {
    color: 'white',
    background: color.purple,
    padding: '3px 5px',
    lineHeight: '12px',
    borderRadius: 5,
    marginLeft: 3
  },
  remove: {
    fontSize: 14,
    display: 'table-cell',
    color: 'white',
    background: '#c00',
    border: '1px solid #a00',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.6)',
    padding: '7px 13px',
    borderTopRightRadius: borderRadius,
    borderBottomRightRadius: borderRadius,
    cursor: 'pointer'
  },
  edit: {
    fontSize: 14,
    display: 'table-cell',
    color: 'white',
    background: color.teal,
    border: '1px solid #00adbc',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.6)',
    padding: '7px 13px',
    cursor: 'pointer'
  },
  levelArea: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  titleAndBubble: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  levelTitle: {
    marginLeft: 5
  }
};

export const LevelToken = connect(
  state => ({}),
  {
    toggleExpand
  }
)(UnconnectedLevelToken);

export default LevelToken;
