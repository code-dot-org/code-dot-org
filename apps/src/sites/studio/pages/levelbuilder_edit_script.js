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
  levelTokenActive: {
    padding: 7
  },
  levelToken: {
    position: 'relative',
    fontSize: 13,
    background: '#eee',
    borderRadius: borderRadius,
    margin: '5px 0'
  },
  controls: {
    float: 'right'
  },
  controlIcon: {
    margin: '0 5px'
  },
  levelSelect: {
    marginBottom: 5
  },
  levelTypeLabel: {
    float: 'left',
    lineHeight: '36px',
    marginLeft: 5
  },
  levelTypeSelect: {
    width: 'calc(100% - 80px)',
    marginLeft: 80
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
  focused: {
    outline: '5px auto #3b99fc',
    outlineOffset: -2
  }
};

const ArrowRenderer = ({onMouseDown}) => <i className="fa fa-chevron-down" onMouseDown={onMouseDown}/>;
ArrowRenderer.propTypes = {onMouseDown: React.PropTypes.func.isRequried};

/**
 * Component for editing course scripts.
 */
const ScriptEditor = React.createClass({
  propTypes: {
    scriptData: React.PropTypes.object.isRequired,
    i18nData: React.PropTypes.object.isRequired
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
        <FlexGroupEditor stages={this.props.scriptData.stages} />
      </div>
    );
  }
});

const FlexGroupEditor = React.createClass({
  propTypes: {
    stages: React.PropTypes.array.isRequired
  },

  render() {
    const nonPeerReviewStages = this.props.stages.filter(stage => stage.id);
    const groups = _.groupBy(nonPeerReviewStages, stage => (stage.flex_category || 'Default'));
    let count = 1;

    return (
      <div>
        {_.map(groups, (stages, group) => {
          return (
            <div key={group}>
              <div style={styles.groupHeader}>
                Group {count++}: {group}
                <Controls />
              </div>
              <div style={styles.groupBody}>
                {stages.map(stage => <StageEditor key={stage.id} stage={stage} />)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
});

const StageEditor = React.createClass({
  propTypes: {
    stage: React.PropTypes.object.isRequired
  },

  getInitialState() {
    return {currentPositions: []};
  },

  metrics(token) {
    return ReactDOM.findDOMNode(this.refs[`levelToken${token}`]).getBoundingClientRect();
  },

  handleExpand(position) {
    this.setState({
      expanded: position
    });
  },

  handleDragStart(position, {pageY}) {
    const startingPositions = this.props.stage.levels.map(level => {
      const metrics = this.metrics(level.position);
      return {top: metrics.top, bottom: metrics.bottom};
    });
    this.setState({
      drag: position,
      dragHeight: this.metrics(position).height + 5,
      initialPageY: pageY,
      startingPositions
    });
    window.addEventListener('mousemove', this.handleDrag);
    window.addEventListener('mouseup', this.handleDragStop);
  },

  handleDrag({pageY}) {
    const delta = (pageY - this.state.initialPageY); // / 1.4;
    const dragPosition = this.metrics(this.state.drag).top;
    const currentPositions = this.state.startingPositions.map((metrics, index) => {
      const postion = index + 1;
      if (postion === this.state.drag) {
        return delta;
      }
      if (postion < this.state.drag && dragPosition < metrics.top) {
        return this.state.dragHeight;
      }
      if (postion > this.state.drag && dragPosition + this.state.dragHeight > metrics.bottom) {
        return -this.state.dragHeight;
      }
      return 0;
    });
    this.setState({currentPositions});
  },

  handleDragStop() {
    this.setState({drag: null, currentPositions: []});
    window.removeEventListener('mousemove', this.handleDrag);
    window.removeEventListener('mouseup', this.handleDragStop);
  },

  render() {
    return (
      <div style={styles.stageCard}>
        <div style={styles.stageCardHeader}>
          Stage {this.props.stage.position}: {this.props.stage.name}
          <Controls />
        </div>
        {this.props.stage.levels.map(level =>
          <LevelEditor
            ref={`levelToken${level.position}`}
            key={level.position}
            level={level}
            expanded={level.position === this.state.expanded}
            handleExpand={this.handleExpand}
            drag={level.position === this.state.drag}
            delta={this.state.currentPositions[level.position - 1] || 0}
            handleDragStart={this.handleDragStart}
          />
        )}
      </div>
    );
  }
});

const LevelEditor = React.createClass({
  propTypes: {
    level: React.PropTypes.object.isRequired,
    expanded: React.PropTypes.bool.isRequired,
    handleExpand: React.PropTypes.func.isRequired,
    drag: React.PropTypes.bool.isRequired,
    delta: React.PropTypes.number,
    handleDragStart: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return {focused: true};
  },

  handleLevelSelected(value) {
    console.log(value);
  },

  handleFocus(e) {
    if (e.target === ReactDOM.findDOMNode(this.refs.div)) {
      this.setState({focused: true});
    } else {
      this.setState({focused: false});
    }
  },

  handleBlur() {
    this.setState({focused: false});
  },

  render() {
    return this.props.expanded ?
      <div
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        tabIndex="0"
        style={Object.assign({}, styles.levelTokenActive, styles.levelToken, this.state.focused && styles.focused)}
      >
        {this.props.level.ids.map(id => {
          return (
            <VirtualizedSelect
              key={id}
              options={levelKeyList}
              value={id}
              onChange={this.handleLevelSelected}
              clearable={false}
              arrowRenderer={ArrowRenderer}
              style={styles.levelSelect}
            />
          );
        })}
        <span style={styles.levelTypeLabel}>Level type:</span>
        <VirtualizedSelect
          value={this.props.level.kind}
          options={[{
            label: 'Puzzle', value: 'puzzle'
          }, {
            label: 'Assessment', value: 'assessment'
          }, {
            label: 'Named Level', value: 'named_level'
          }, {
            label: 'Unplugged', value: 'unplugged'
          }]}
          clearable={false}
          arrowRenderer={ArrowRenderer}
          style={styles.levelTypeSelect}
        />
      </div> :
      <Motion
        style={this.props.drag ? {
          y: this.props.delta,
          scale: spring(1.02, {stiffness: 1000, damping: 80}),
          shadow: spring(5, {stiffness: 1000, damping: 80})
        } : {
          y: spring(this.props.delta, {stiffness: 1000, damping: 80}),
          scale: 1,
          shadow: 0
        }} key={this.props.level.position}
      >
        {({y, scale, shadow}) =>
          <div
            style={Object.assign({}, styles.levelToken, {
              transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
              boxShadow: `${color.shadow} 0 ${shadow}px ${shadow * 3}px`,
              zIndex: this.props.drag ? 1000 : 'auto'
            })}
          >
            <div style={styles.reorder} onMouseDown={this.props.handleDragStart.bind(null, this.props.level.position)}>
              <i className="fa fa-arrows-v"/>
            </div>
          <span style={styles.levelTokenName} onMouseDown={this.props.handleExpand.bind(null, this.props.level.position)}>
            {this.props.level.key}
            {this.props.level.ids.length > 1 &&
            ` (${this.props.level.ids.length} variants...)`}
          </span>
            <div style={styles.remove}>
              <i className="fa fa-times"/>
            </div>
          </div>
        }
      </Motion>;
  }
});

const Controls = React.createClass({
  render() {
    return (
      <div style={styles.controls}>
        <i style={styles.controlIcon} className="fa fa-caret-up" />
        <i style={styles.controlIcon} className="fa fa-caret-down" />
        <i style={styles.controlIcon} className="fa fa-trash" />
      </div>
    );
  }
});

ReactDOM.render(
  <ScriptEditor scriptData={scriptData} i18nData={i18nData} />,
  document.querySelector('.edit_container')
);
