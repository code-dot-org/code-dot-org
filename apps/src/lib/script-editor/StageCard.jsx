import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {borderRadius, levelTokenMargin, ControlTypes} from './constants';
import OrderControls from './OrderControls';
import LevelToken from './LevelToken';
import {
  reorderLevel,
  addLevel,
  setStageLockable,
  setFlexCategory
} from './editorRedux';

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
  bottomControls: {
    height: 30
  },
  addLevel: {
    fontSize: 14,
    background: '#eee',
    border: '1px solid #ddd',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
    margin: '0 5px 0 0'
  },
  flexCategoryLabel: {
    fontSize: 14,
    verticalAlign: 'baseline'
  },
  flexCategorySelect: {
    verticalAlign: 'baseline',
    width: 550,
    margin: '0 5px 0 0'
  },
  saveFlexCategoryButton: {
    verticalAlign: 'baseline',
    margin: '0 5px 0 0'
  }
};

export class UnconnectedStageCard extends Component {
  static propTypes = {
    reorderLevel: PropTypes.func.isRequired,
    addLevel: PropTypes.func.isRequired,
    setStageLockable: PropTypes.func.isRequired,
    stagesCount: PropTypes.number.isRequired,
    stage: PropTypes.object.isRequired,
    flexCategoryMap: PropTypes.object.isRequired,
    setFlexCategory: PropTypes.func.isRequired
  };

  /**
   * To be populated with the bounding client rect of each level token element.
   */
  metrics = {};

  state = {
    currentPositions: [],
    drag: null,
    dragHeight: null,
    initialPageY: null,
    initialScroll: null,
    newPosition: null,
    startingPositions: null,
    editingFlexCategory: false,
    newFlexCategory: ''
  };

  handleDragStart = (position, {pageY}) => {
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
  };

  handleDrag = ({pageY}) => {
    const scrollDelta = document.body.scrollTop - this.state.initialScroll;
    const delta = pageY - this.state.initialPageY;
    const dragPosition = this.metrics[this.state.drag].top + scrollDelta;
    let newPosition = this.state.drag;
    const currentPositions = this.state.startingPositions.map(
      (midpoint, index) => {
        const position = index + 1;
        if (position === this.state.drag) {
          return delta;
        }
        if (position < this.state.drag && dragPosition < midpoint) {
          newPosition--;
          return this.state.dragHeight;
        }
        if (
          position > this.state.drag &&
          dragPosition + this.state.dragHeight > midpoint
        ) {
          newPosition++;
          return -this.state.dragHeight;
        }
        return 0;
      }
    );
    this.setState({currentPositions, newPosition});
  };

  handleDragStop = () => {
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
  };

  handleAddLevel = () => {
    this.props.addLevel(this.props.stage.position);
  };

  handleEditFlexCategory = () => {
    this.setState({
      editingFlexCategory: true,
      newFlexCategory: this.props.stage.flex_category || ''
    });
  };

  cancelEditFlexCategory = () => {
    this.setState({
      editingFlexCategory: false,
      newFlexCategory: ''
    });
  };

  flexCategorySelected = newFlexCategory => {
    this.setState({newFlexCategory});
  };

  handleSaveFlexCategory = () => {
    const {newFlexCategory} = this.state;
    this.setState({
      editingFlexCategory: false,
      newFlexCategory: ''
    });
    if (this.props.stage.flex_category !== newFlexCategory) {
      this.props.setFlexCategory(this.props.stage.position, newFlexCategory);
    }
  };

  toggleLockable = () => {
    this.props.setStageLockable(
      this.props.stage.position,
      !this.props.stage.lockable
    );
  };

  preventSelect(e) {
    e.preventDefault();
  }

  render() {
    const {flexCategoryMap} = this.props;
    return (
      <div style={styles.stageCard}>
        <div style={styles.stageCardHeader}>
          {!this.props.stage.lockable && (
            <span>Stage {this.props.stage.relativePosition}:&nbsp;</span>
          )}
          {this.props.stage.name}
          <OrderControls
            type={ControlTypes.Stage}
            position={this.props.stage.position}
            total={this.props.stagesCount}
          />
          <label style={styles.stageLockable}>
            Require teachers to unlock this stage before students in their
            section can access it
            <input
              checked={this.props.stage.lockable}
              onChange={this.toggleLockable}
              type="checkbox"
              style={styles.checkbox}
            />
          </label>
        </div>
        {this.props.stage.levels.map(level => (
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
            stagePosition={this.props.stage.position}
            dragging={!!this.state.drag}
            drag={level.position === this.state.drag}
            delta={this.state.currentPositions[level.position - 1] || 0}
            handleDragStart={this.handleDragStart}
          />
        ))}
        <div style={styles.bottomControls}>
          {!this.state.editingFlexCategory && (
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
                onMouseDown={this.handleEditFlexCategory}
                className="btn"
                style={styles.addLevel}
                type="button"
              >
                <i style={{marginRight: 7}} className="fa fa-pencil" />
                Edit Flex Category
              </button>
            </span>
          )}
          {this.state.editingFlexCategory && (
            <div>
              <span style={styles.flexCategoryLabel}>Flex Category:</span>
              &nbsp;
              <select
                style={styles.flexCategorySelect}
                onChange={e => this.flexCategorySelected(e.target.value)}
                value={this.state.newFlexCategory}
              >
                <option value="">(none): "Content"</option>
                {Object.keys(flexCategoryMap).map(flexCategory => (
                  <option key={flexCategory} value={flexCategory}>
                    {flexCategory}: "{flexCategoryMap[flexCategory]}"
                  </option>
                ))}
              </select>
              <button
                onMouseDown={this.handleSaveFlexCategory}
                className="btn btn-primary"
                style={styles.saveFlexCategoryButton}
                type="button"
              >
                Save
              </button>
              <button
                onMouseDown={this.cancelEditFlexCategory}
                className="btn"
                style={styles.saveFlexCategoryButton}
                type="button"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    flexCategoryMap: state.flexCategoryMap
  }),
  dispatch => ({
    reorderLevel(stage, originalPosition, newPosition) {
      dispatch(reorderLevel(stage, originalPosition, newPosition));
    },
    addLevel(stage) {
      dispatch(addLevel(stage));
    },
    setStageLockable(stage, lockable) {
      dispatch(setStageLockable(stage, lockable));
    },
    setFlexCategory(stage, flexCategory) {
      dispatch(setFlexCategory(stage, flexCategory));
    }
  })
)(UnconnectedStageCard);
