import React from 'react';
import { connect } from 'react-redux';
import { moveGroup, moveStage, removeGroup, removeStage } from './editorRedux';

const styles = {
  controls: {
    float: 'right'
  },
  controlIcon: {
    margin: '0 5px',
    cursor: 'pointer'
  }
};

const OrderControls = React.createClass({
  propTypes: {
    move: React.PropTypes.func.isRequired,
    remove: React.PropTypes.func.isRequired,
    type: React.PropTypes.oneOf(['GROUP', 'STAGE']).isRequired,
    position: React.PropTypes.number.isRequired,
    total: React.PropTypes.number.isRequired
  },

  handleMoveUp() {
    if (this.props.position !== 1) {
      this.props.move(this.props.type, this.props.position, 'up');
    }
  },

  handleMoveDown() {
    if (this.props.position !== this.props.total) {
      this.props.move(this.props.type, this.props.position, 'down');
    }
  },

  handleRemove() {
    this.props.remove(this.props.type, this.props.position);
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

export default connect(state => ({}), dispatch => ({
  move(type, position, direction) {
    type === 'GROUP' ?
      dispatch(moveGroup(position, direction)) :
      dispatch(moveStage(position, direction));
  },
  remove(type, position) {
    type === 'GROUP' ?
      dispatch(removeGroup(position)) :
      dispatch(removeStage(position));
  }
}))(OrderControls);
