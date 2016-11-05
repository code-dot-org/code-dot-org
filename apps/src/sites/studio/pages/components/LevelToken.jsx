import React from 'react';
import { connect } from 'react-redux';
import {Motion, spring} from 'react-motion';
import color from '../../../../util/color';
import { borderRadius, levelTokenMargin } from './constants';
import LevelTokenDetails from './LevelTokenDetails';

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

const LevelToken = React.createClass({
  propTypes: {
    toggleExpand: React.PropTypes.func.isRequired,
    removeLevel: React.PropTypes.func.isRequired,
    level: React.PropTypes.object.isRequired,
    stagePosition: React.PropTypes.number.isRequired,
    dragging: React.PropTypes.bool.isRequired,
    drag: React.PropTypes.bool.isRequired,
    delta: React.PropTypes.number,
    handleDragStart: React.PropTypes.func.isRequired
  },

  toggleExpand() {
    this.props.toggleExpand(this.props.stagePosition, this.props.level.position);
  },

  handleRemove() {
    this.props.removeLevel(this.props.stagePosition, this.props.level.position);
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

export default connect(state => ({}), dispatch => ({
  toggleExpand(stage, level) {
    dispatch({type: 'TOGGLE_EXPAND', stage, level});
  },
  removeLevel(stage, level) {
    dispatch({type: 'REMOVE_LEVEL', stage, level});
  }
}))(LevelToken);
