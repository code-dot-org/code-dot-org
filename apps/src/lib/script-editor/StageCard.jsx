import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { borderRadius, levelTokenMargin, ControlTypes } from './constants';
import OrderControls from './OrderControls';
import LevelToken from './LevelToken';
import { reorderLevel, addLevel, setStageLockable } from './editorRedux';

const styles = {
  checkbox: {
    margin: '0 0 0 7px'
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
  addLevel: {
    fontSize: 14,
    background: '#eee',
    border: '1px solid #ddd',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
    margin: '5px 0'
  }
};

const StageCard = React.createClass({
  propTypes: {
    reorderLevel: PropTypes.func.isRequired,
    addLevel: PropTypes.func.isRequired,
    setStageLockable: PropTypes.func.isRequired,
    stagesCount: PropTypes.number.isRequired,
    stage: PropTypes.object.isRequired
  },

  /**
   * To be populated with the bounding client rect of each level token element.
   */
  metrics: {},

  getInitialState() {
    return {
      currentPositions: [],
      drag: null,
      dragHeight: null,
      initialPageY: null,
      initialScroll: null,
      newPosition: null,
      startingPositions: null
    };
  },

  handleDragStart(position, {pageY}) {
    const startingPositions = this.props.stage.levels.map(level => {
      const metrics = this.metrics[level.position];
      return metrics.top + metrics.height / 2;
    });
    this.setState({
      drag: position,
      dragHeight: this.metrics[position].height + levelTokenMargin,
      initialPageY: pageY,
      initialScroll: document.body.scrollTop,
      newPosition: position,
      startingPositions
    });
    window.addEventListener('selectstart', this.preventSelect);
    window.addEventListener('mousemove', this.handleDrag);
    window.addEventListener('mouseup', this.handleDragStop);
  },

  handleDrag({pageY}) {
    const scrollDelta = document.body.scrollTop - this.state.initialScroll;
    const delta = pageY - this.state.initialPageY;
    const dragPosition = this.metrics[this.state.drag].top + scrollDelta;
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
      this.props.reorderLevel(
        this.props.stage.position,
        this.state.drag,
        this.state.newPosition
      );
    }
    this.setState({drag: null, newPosition: null, currentPositions: []});
    window.removeEventListener('selectstart', this.preventSelect);
    window.removeEventListener('mousemove', this.handleDrag);
    window.removeEventListener('mouseup', this.handleDragStop);
  },

  handleAddLevel() {
    this.props.addLevel(this.props.stage.position);
  },

  handleLockableChanged() {
    this.props.setStageLockable(this.props.stage.position, this.refs.lockable.checked);
  },

  preventSelect(e) {
    e.preventDefault();
  },

  render() {
    return (
      <div style={styles.stageCard}>
        <div style={styles.stageCardHeader}>
          Stage {this.props.stage.position}: {this.props.stage.name}
          <OrderControls
            type={ControlTypes.Stage}
            position={this.props.stage.position}
            total={this.props.stagesCount}
          />
          <div style={styles.stageLockable}>
            Require teachers to unlock this stage before students in their
            section can access it
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
          <LevelToken
            ref={levelToken => {
              if (levelToken) {
                const metrics = ReactDOM.findDOMNode(levelToken).getBoundingClientRect();
                this.metrics[level.position] = metrics;
              }
            }}
            key={level.position + '_' + level.ids[0]}
            level={level}
            stagePosition={this.props.stage.position}
            dragging={!!this.state.drag}
            drag={level.position === this.state.drag}
            delta={this.state.currentPositions[level.position - 1] || 0}
            handleDragStart={this.handleDragStart}
          />
        )}
        <button
          onMouseDown={this.handleAddLevel}
          className="btn"
          style={styles.addLevel}
          type="button"
        >
          <i style={{marginRight: 7}} className="fa fa-plus-circle" />
          Add Level
        </button>
      </div>
    );
  }
});

export default connect(state => ({}), dispatch => ({
  reorderLevel(stage, originalPosition, newPosition) {
    dispatch(reorderLevel(stage, originalPosition, newPosition));
  },
  addLevel(stage) {
    dispatch(addLevel(stage));
  },
  setStageLockable(stage, lockable) {
    dispatch(setStageLockable(stage, lockable));
  }
}))(StageCard);
