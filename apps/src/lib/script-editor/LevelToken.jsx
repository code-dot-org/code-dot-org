import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import { Motion, spring } from 'react-motion';
import color from '../../util/color';
import { borderRadius, levelTokenMargin } from './constants';
import LevelTokenDetails from './LevelTokenDetails';
import { toggleExpand, removeLevel } from './editorRedux';

const styles = {
  levelToken: {
    position: 'relative',
    fontSize: 13,
    background: '#eee',
    borderRadius: borderRadius,
    margin: `${levelTokenMargin}px 0`
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
  }
};

/**
 * Component for editing puzzle dots with one or more level variants.
 */
const LevelToken = React.createClass({
  propTypes: {
    levelKeyList: PropTypes.object.isRequired,
    toggleExpand: PropTypes.func.isRequired,
    removeLevel: PropTypes.func.isRequired,
    level: PropTypes.object.isRequired,
    stagePosition: PropTypes.number.isRequired,
    dragging: PropTypes.bool.isRequired,
    drag: PropTypes.bool.isRequired,
    delta: PropTypes.number,
    handleDragStart: PropTypes.func.isRequired
  },

  handleDragStart(e) {
    this.props.handleDragStart(this.props.level.position, e);
  },

  toggleExpand() {
    this.props.toggleExpand(this.props.stagePosition, this.props.level.position);
  },

  handleRemove() {
    this.props.removeLevel(this.props.stagePosition, this.props.level.position);
  },

  render() {
    const springConfig = {stiffness: 1000, damping: 80};
    return (
      <Motion
        style={this.props.drag ? {
          y: this.props.dragging ? this.props.delta : 0,
          scale: spring(1.02, springConfig),
          shadow: spring(5, springConfig)
        } : {
          y: this.props.dragging ? spring(this.props.delta, springConfig) : 0,
          scale: 1,
          shadow: 0
        }} key={this.props.level.position}
      >
        {
          // Use react-motion to interpolate the following values and create
          // smooth transitions.
          ({y, scale, shadow}) =>
          <div
            style={Object.assign({}, styles.levelToken, {
              transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
              boxShadow: `${color.shadow} 0 ${shadow}px ${shadow * 3}px`,
              zIndex: this.props.drag ? 1000 : 500 - this.props.level.position
            })}
          >
            <div style={styles.reorder} onMouseDown={this.handleDragStart}>
              <i className="fa fa-arrows-v"/>
            </div>
            <span style={styles.levelTokenName} onMouseDown={this.toggleExpand}>
              {this.props.levelKeyList[this.props.level.activeId]}
              {this.props.level.ids.length > 1 &&
              <span style={styles.variants}>
                {this.props.level.ids.length} variants
              </span>
              }
            </span>
            <div style={styles.remove} onMouseDown={this.handleRemove}>
              <i className="fa fa-times"/>
            </div>
            {this.props.level.expand &&
            <LevelTokenDetails
              level={this.props.level}
              stagePosition={this.props.stagePosition}
            />
            }
          </div>
        }
      </Motion>
    );
  }
});

export default connect(state => ({
  levelKeyList: state.levelKeyList
}), dispatch => ({
  toggleExpand(stage, level) {
    dispatch(toggleExpand(stage, level));
  },
  removeLevel(stage, level) {
    dispatch(removeLevel(stage, level));
  }
}))(LevelToken);
