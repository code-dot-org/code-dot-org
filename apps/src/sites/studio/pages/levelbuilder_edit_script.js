/** @file JavaScript run only on the /s/:script_name/edit page. */
/* globals scriptData, i18nData, levelKeyList */

import React from 'react';
import ReactDOM from 'react-dom';
import {Motion, spring} from 'react-motion';
import VirtualizedSelect from 'react-virtualized-select';
import 'react-virtualized/styles.css';
import 'react-select/dist/react-select.css';
import 'react-virtualized-select/styles.css';
import _ from 'lodash';
import color from '../../../color';

const levelKeyOptions = _.map(levelKeyList, (label, value) => ({label, value: +value}));

const borderRadius = 3;

const styles = {
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '4px 6px',
    color: '#555',
    border: '1px solid #ccc',
    borderRadius: 4
  },
  checkbox: {
    margin: '0 0 0 7px'
  },
  textInput: {
    height: 34,
    width: 350,
    boxSizing: 'border-box',
    verticalAlign: 'baseline',
    margin: '7px 0 10px 0'
  },
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
  addGroup: {
    fontSize: 14,
    color: 'white',
    background: color.cyan,
    border: `1px solid ${color.cyan}`,
    boxShadow: 'none',
    margin: '0 0 30px 0'
  },
  stageCard: {
    fontSize: 18,
    background: 'white',
    border: '1px solid #ccc',
    borderRadius: borderRadius,
    padding: 20,
    margin: 10
  },
  stageCardHeader: {
    color: '#5b6770',
    marginBottom: 15
  },
  stageLockable: {
    fontSize: 13,
    marginTop: 3
  },
  addStage: {
    fontSize: 14,
    color: '#5b6770',
    background: 'white',
    border: '1px solid #ccc',
    boxShadow: 'none',
    margin: '0 10px 10px 10px'
  },
  levelTokenActive: {
    padding: 7,
    background: '#f4f4f4',
    border: '1px solid #ddd',
    borderTop: 0
  },
  levelToken: {
    position: 'relative',
    fontSize: 13,
    background: '#eee',
    borderRadius: borderRadius,
    margin: '5px 0'
  },
  addLevel: {
    fontSize: 14,
    background: '#eee',
    border: '1px solid #ddd',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
    margin: '5px 0'
  },
  controls: {
    float: 'right'
  },
  controlIcon: {
    margin: '0 5px',
    cursor: 'pointer'
  },
  levelFieldLabel: {
    lineHeight: '36px',
    margin: '0 7px 0 5px'
  },
  levelTypeSelect: {
    width: 'calc(100% - 80px)',
    margin: '0 0 5px 80px'
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
  levelTokenName: {
    padding: 7,
    display: 'table-cell',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
    width: '100%',
    borderTop: '1px solid #ddd',
    borderBottom: '1px solid #ddd',
    userSelect: 'none',
    MozUserSelect: 'none',
    WebkitUserSelect: 'none',
    msUserSelect: 'none',
    cursor: 'text'
  },
  variants: {
    color: 'white',
    background: color.purple,
    padding: '3px 5px',
    lineHeight: '12px',
    borderRadius: 5,
    float: 'right'
  },
  divider: {
    borderColor: '#ddd',
    margin: '7px 0'
  },
  addVariant: {
    fontSize: 14,
    background: 'white',
    border: '1px solid #ddd',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.6)',
    margin: '0'
  },
};

const ArrowRenderer = ({onMouseDown}) => <i className="fa fa-chevron-down" onMouseDown={onMouseDown}/>;
ArrowRenderer.propTypes = {onMouseDown: React.PropTypes.func.isRequried};

let newStageId = -1;
let newLevelId = -1;

/**
 * Component for editing course scripts.
 */
const ScriptEditor = React.createClass({
  propTypes: {
    scriptData: React.PropTypes.object.isRequired,
    i18nData: React.PropTypes.object.isRequired
  },

  getInitialState() {
    return {stages: this.props.scriptData.stages};
  },

  handleAction(type, options) {
    let newState = _.cloneDeep(this.state.stages);
    switch (type) {
      case 'ADD_GROUP': {
        newState.push({
          id: newStageId--,
          name: 'New Stage',
          flex_category: `New Group ${Math.round(Math.random() * 10000).toString(16)}`,
          levels: []
        });
        this.updatePositions(newState);
        break;
      }
      case 'ADD_STAGE': {
        const groupName = newState[options.position - 1].flex_category;
        newState.splice(options.position, 0, {
          id: newStageId--,
          name: 'New Stage',
          flex_category: groupName,
          levels: []
        });
        this.updatePositions(newState);
        break;
      }
      case 'ADD_LEVEL': {
        const levels = newState[options.stage - 1].levels;
        const id = newLevelId--;
        levels.push({
          ids: [id],
          activeId: id,
          expand: true
        });
        this.updatePositions(levels);
        break;
      }
      case 'ADD_VARIANT': {
        newState[options.stage - 1].levels[options.level - 1].ids.push(newLevelId--);
        break;
      }
      case 'REMOVE_GROUP': {
        const groupName = newState[options.position - 1].flex_category;
        newState = newState.filter(stage => stage.flex_category !== groupName);
        this.updatePositions(newState);
        break;
      }
      case 'REMOVE_STAGE': {
        newState.splice(options.position - 1, 1);
        this.updatePositions(newState);
        break;
      }
      case 'REMOVE_LEVEL': {
        const levels = newState[options.stage - 1].levels;
        levels.splice(options.level - 1, 1);
        this.updatePositions(levels);
        break;
      }
      case 'REORDER_LEVEL': {
        const levels = newState[options.stage - 1].levels;
        const temp = levels.splice(options.levelA - 1, 1);
        levels.splice(options.levelB - 1, 0, temp[0]);
        this.updatePositions(levels);
        break;
      }
      case 'CHOOSE_LEVEL': {
        const level = newState[options.stage - 1].levels[options.level - 1];
        if (level.ids[options.index] === level.activeId) {
          level.activeId = options.value;
          level.key = levelKeyList[options.value];
        }
        level.ids[options.index] = options.value;
        break;
      }
      case 'CHOOSE_LEVEL_TYPE': {
        newState[options.stage - 1].levels[options.level - 1].kind = options.value;
        break;
      }
      case 'TOGGLE_EXPAND': {
        const level = newState[options.stage - 1].levels[options.level - 1];
        level.expand = !level.expand;
        break;
      }
      default:
        throw 'Unexpected action';
    }
    this.setState({stages: newState});
  },

  updatePositions(node) {
    for (var i = 0; i < node.length; i++) {
      node[i].position = i + 1;
    }
  },

  render() {
    return (
      <div>
        <h2>I18n Strings</h2>
        <label>
          Title
          <input
            name="title"
            defaultValue={this.props.i18nData.title}
            style={styles.input}
          />
        </label>
        <label>
          Audience
          <input
            name="description_audience"
            defaultValue={this.props.i18nData.descriptionAudience}
            style={styles.input}
          />
        </label>
        <label>
          Short Description
          <input
            name="description_short"
            defaultValue={this.props.i18nData.descriptionShort}
            style={styles.input}
          />
        </label>
        <label>
          Description
          <textarea
            name="description"
            defaultValue={this.props.i18nData.description}
            rows={5}
            style={styles.input}
          />
        </label>
        <h2>Basic Settings</h2>
        <label>
          Visible in Teacher Dashboard
          <input
            name="visible_to_teachers"
            type="checkbox"
            defaultChecked={!this.props.scriptData.hidden}
            style={styles.checkbox}
          />
          <p>If checked this script will show up in the dropdown on the Teacher Dashboard, for teachers to assign to students.</p>
        </label>
        <label>
          Login Required
          <input
            name="login_required"
            type="checkbox"
            defaultChecked={this.props.scriptData.loginRequired}
            style={styles.checkbox}
          />
          <p>Require users to log in before viewing this script. This should be enabled on scripts that contain App Lab or Game Lab levels.</p>
        </label>
        <label>
          Hideable Stages
          <input
            name="hideable_stages"
            type="checkbox"
            defaultChecked={this.props.scriptData.hideable_stages}
            style={styles.checkbox}
          />
          <p>Allow teachers to toggle whether or not specific stages in this script are visible to students in their section.</p>
        </label>
        <label>
          Professional Learning Course
          <input
            name="professional_learning_course"
            defaultValue={this.props.scriptData.professionalLearningCourse}
            style={styles.input}
          />
        </label>
        <label>
          Peer Reviews to Complete
          <input
            name="peer_reviews_to_complete"
            defaultValue={this.props.scriptData.peerReviewsRequired}
            style={styles.input}
          />
        </label>
        <label>
          Wrap-up Video
          <input
            name="wrapup_video"
            defaultValue={this.props.scriptData.wrapupVideo}
            style={styles.input}
          />
        </label>
        <h2>Stages and Levels</h2>
        <FlexGroupEditor stages={this.state.stages} handleAction={this.handleAction} />
      </div>
    );
  }
});

const FlexGroupEditor = React.createClass({
  propTypes: {
    handleAction: React.PropTypes.func.isRequired,
    stages: React.PropTypes.array.isRequired
  },

  handleAddGroup() {
    this.props.handleAction('ADD_GROUP');
  },

  handleAddStage(position) {
    this.props.handleAction('ADD_STAGE', {position});
  },

  render() {
    const nonPeerReviewStages = this.props.stages.filter(stage => stage.id);
    const groups = _.groupBy(nonPeerReviewStages, stage => (stage.flex_category || 'Default'));
    let count = 0;
    let afterStage = 1;

    return (
      <div>
        {_.map(groups, (stages, group) => {
          return (
            <div key={group}>
              <div style={styles.groupHeader}>
                Group {++count}: {group}
                <Controls
                  handleAction={this.props.handleAction}
                  type="GROUP"
                  position={afterStage}
                  total={Object.keys(groups).length}
                />
              </div>
              <div style={styles.groupBody}>
                {stages.map(stage => {
                  afterStage++;
                  return (
                    <StageEditor
                      handleAction={this.props.handleAction}
                      key={stage.id}
                      stagesCount={this.props.stages.length}
                      stage={stage}
                    />
                  );
                })}
                <button onMouseDown={this.handleAddStage.bind(null, afterStage - 1)} className="btn" style={styles.addStage} type="button">
                  <i style={{marginRight: 7}} className="fa fa-plus-circle" />
                  Add Stage
                </button>
              </div>
            </div>
          );
        })}
        <button onMouseDown={this.handleAddGroup} className="btn" style={styles.addGroup} type="button">
          <i style={{marginRight: 7}} className="fa fa-plus-circle" />
          Add Group
        </button>
      </div>
    );
  }
});

const StageEditor = React.createClass({
  propTypes: {
    handleAction: React.PropTypes.func.isRequired,
    stagesCount: React.PropTypes.number.isRequired,
    stage: React.PropTypes.object.isRequired
  },

  getInitialState() {
    return {currentPositions: []};
  },

  metrics(token) {
    return ReactDOM.findDOMNode(this.refs[`levelToken${token}`]).getBoundingClientRect();
  },

  handleDragStart(position, {pageY}) {
    const startingPositions = this.props.stage.levels.map(level => {
      const metrics = this.metrics(level.position);
      return metrics.top + metrics.height / 2;
    });
    this.setState({
      drag: position,
      dragHeight: this.metrics(position).height + 5,
      initialPageY: pageY,
      initialScroll: document.body.scrollTop,
      newPosition: position,
      startingPositions
    });
    window.addEventListener('mousemove', this.handleDrag);
    window.addEventListener('mouseup', this.handleDragStop);
  },

  handleDrag({pageY}) {
    const scrollDelta = document.body.scrollTop - this.state.initialScroll;
    const delta = pageY - this.state.initialPageY;
    const dragPosition = this.metrics(this.state.drag).top + scrollDelta;
    let newPosition = this.state.drag;
    const currentPositions = this.state.startingPositions.map((midpoint, index) => {
      const position = index + 1;
      if (position === this.state.drag) {
        return delta;
      }
      if (position < this.state.drag && dragPosition < midpoint) {
        newPosition--;
        return this.state.dragHeight;
      }
      if (position > this.state.drag && dragPosition + this.state.dragHeight > midpoint) {
        newPosition++;
        return -this.state.dragHeight;
      }
      return 0;
    });
    this.setState({currentPositions, newPosition});
  },

  handleDragStop() {
    if (this.state.drag !== this.state.newPosition) {
      this.props.handleAction('REORDER_LEVEL', {stage: this.props.stage.position, levelA: this.state.drag, levelB: this.state.newPosition});
    }
    this.setState({drag: null, newPosition: null, currentPositions: []});
    window.removeEventListener('mousemove', this.handleDrag);
    window.removeEventListener('mouseup', this.handleDragStop);
  },

  handleAddLevel() {
    this.props.handleAction('ADD_LEVEL', {stage: this.props.stage.position});
  },

  handleLockableChanged() {
    const state = this.refs.lockable.checked ? 'lockable' : 'not lockable';
    console.log(`stage ${this.props.stage.position} marked as ${state}`);
  },

  render() {
    return (
      <div style={styles.stageCard}>
        <div style={styles.stageCardHeader}>
          Stage {this.props.stage.position}: {this.props.stage.name}
          <Controls
            handleAction={this.props.handleAction}
            type="STAGE"
            position={this.props.stage.position}
            total={this.props.stagesCount}
          />
          <div style={styles.stageLockable}>
            Require teachers to unlock this stage before students in their section can access it
            <input
              ref="lockable"
              defaultChecked={this.props.stage.lockable}
              onChange={this.handleLockableChanged}
              type="checkbox"
              style={styles.checkbox}
            />
          </div>
        </div>
        {this.props.stage.levels.map(level =>
          <LevelEditor
            handleAction={this.props.handleAction}
            ref={`levelToken${level.position}`}
            key={level.position + '_' + level.ids[0]}
            level={level}
            stagePosition={this.props.stage.position}
            dragging={!!this.state.drag}
            drag={level.position === this.state.drag}
            delta={this.state.currentPositions[level.position - 1] || 0}
            handleDragStart={this.handleDragStart}
          />
        )}
        <button onMouseDown={this.handleAddLevel} className="btn" style={styles.addLevel} type="button">
          <i style={{marginRight: 7}} className="fa fa-plus-circle" />
          Add Level
        </button>
      </div>
    );
  }
});

const LevelEditor = React.createClass({
  propTypes: {
    handleAction: React.PropTypes.func.isRequired,
    level: React.PropTypes.object.isRequired,
    stagePosition: React.PropTypes.number.isRequired,
    dragging: React.PropTypes.bool.isRequired,
    drag: React.PropTypes.bool.isRequired,
    delta: React.PropTypes.number,
    handleDragStart: React.PropTypes.func.isRequired
  },

  levelKindOptions: [
    {label: 'Puzzle', value: 'puzzle'},
    {label: 'Assessment', value: 'assessment'},
    {label: 'Named Level', value: 'named_level'},
    {label: 'Unplugged', value: 'unplugged'}
  ],

  toggleExpand() {
    this.props.handleAction('TOGGLE_EXPAND', {stage: this.props.stagePosition, level: this.props.level.position});
  },

  containsLegacyLevel() {
    return this.props.level.ids.some(id => /^blockly:/.test(levelKeyList[id]));
  },

  handleLevelTypeSelected({value}) {
    this.props.handleAction('CHOOSE_LEVEL_TYPE', {stage: this.props.stagePosition, level: this.props.level.position, value});
  },

  handleLevelSelected(index, {value}) {
    this.props.handleAction('CHOOSE_LEVEL', {stage: this.props.stagePosition, level: this.props.level.position, index, value});
  },

  handleRemove() {
    this.props.handleAction('REMOVE_LEVEL', {stage: this.props.stagePosition, level: this.props.level.position});
  },

  handleAddVariant() {
    this.props.handleAction('ADD_VARIANT', {stage: this.props.stagePosition, level: this.props.level.position});
  },

  render() {
    return (
      <Motion
        style={this.props.drag ? {
          y: this.props.dragging ? this.props.delta : 0,
          scale: spring(1.02, {stiffness: 1000, damping: 80}),
          shadow: spring(5, {stiffness: 1000, damping: 80})
        } : {
          y: this.props.dragging ? spring(this.props.delta, {stiffness: 1000, damping: 80}) : 0,
          scale: 1,
          shadow: 0
        }} key={this.props.level.position}
      >
        {({y, scale, shadow}) =>
          <div
            style={Object.assign({}, styles.levelToken, {
              transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
              boxShadow: `${color.shadow} 0 ${shadow}px ${shadow * 3}px`,
              zIndex: this.props.drag ? 1000 : 500 - this.props.level.position
            })}
          >
            <div style={styles.reorder} onMouseDown={this.props.handleDragStart.bind(null, this.props.level.position)}>
              <i className="fa fa-arrows-v"/>
            </div>
            <span style={styles.levelTokenName} onMouseDown={this.toggleExpand}>
              {this.props.level.key}
              {this.props.level.ids.length > 1 &&
                <span style={styles.variants}>{this.props.level.ids.length} variants</span>
              }
            </span>
            <div style={styles.remove} onMouseDown={this.handleRemove}>
              <i className="fa fa-times"/>
            </div>
            {this.props.level.expand &&
              <div style={styles.levelTokenActive}>
                <span style={Object.assign({float: 'left'}, styles.levelFieldLabel)}>
                  Level type
                </span>
                <VirtualizedSelect
                  value={this.props.level.kind}
                  options={this.levelKindOptions}
                  onChange={this.handleLevelTypeSelected}
                  clearable={false}
                  arrowRenderer={ArrowRenderer}
                  style={styles.levelTypeSelect}
                />
                {this.containsLegacyLevel() &&
                  <div>
                    <span style={Object.assign({display: 'inline-block'}, styles.levelFieldLabel)}>Skin</span>
                    <input defaultValue={this.props.level.skin} type="text" style={styles.textInput} />
                    <div style={{float: 'right'}}>
                      <span style={Object.assign({display: 'inline-block'}, styles.levelFieldLabel)}>Video key</span>
                      <input defaultValue={this.props.level.videoKey} type="text" style={styles.textInput} />
                    </div>
                  </div>
                }
                {this.props.level.ids.map((id, index) =>
                  <div key={id}>
                    {this.props.level.ids.length > 1 &&
                      <div>
                        <hr style={styles.divider} />
                        <span style={styles.levelFieldLabel}>Active</span>
                        <input
                          type="radio"
                          defaultChecked={id === this.props.level.activeId}
                          style={styles.checkbox}
                          name={`radio-${this.props.stagePosition}-${this.props.level.position}`}
                        />
                      </div>
                    }
                    <VirtualizedSelect
                      options={levelKeyOptions}
                      value={id}
                      onChange={this.handleLevelSelected.bind(null, index)}
                      clearable={false}
                      arrowRenderer={ArrowRenderer}
                    />
                  </div>
                )}
                <hr style={styles.divider} />
                <button onMouseDown={this.handleAddVariant} className="btn" style={styles.addVariant} type="button">
                  <i style={{marginRight: 7}} className="fa fa-plus-circle" />
                  Add Variant
                </button>
              </div>
            }
          </div>
        }
      </Motion>
    );
  }
});

const Controls = React.createClass({
  propTypes: {
    handleAction: React.PropTypes.func.isRequired,
    type: React.PropTypes.oneOf(['GROUP', 'STAGE']).isRequired,
    position: React.PropTypes.number.isRequired,
    total: React.PropTypes.number.isRequired
  },

  handleMoveUp() {
    if (this.props.position !== 1) {
      console.log(`move ${this.props.type} ${this.props.position} up`);
    }
  },

  handleMoveDown() {
    if (this.props.position !== this.props.total) {
      console.log(`move ${this.props.type} ${this.props.position} down`);
    }
  },

  handleRemove() {
    this.props.handleAction('REMOVE_' + this.props.type, {position: this.props.position});
  },

  render() {
    return (
      <div style={styles.controls}>
        <i
          onMouseDown={this.handleMoveUp}
          style={styles.controlIcon}
          className="fa fa-caret-up"
        />
        <i
          onMouseDown={this.handleMoveDown}
          style={styles.controlIcon}
          className="fa fa-caret-down"
        />
        <i
          onMouseDown={this.handleRemove}
          style={styles.controlIcon}
          className="fa fa-trash"
        />
      </div>
    );
  }
});

ReactDOM.render(
  <ScriptEditor scriptData={scriptData} i18nData={i18nData} />,
  document.querySelector('.edit_container')
);
