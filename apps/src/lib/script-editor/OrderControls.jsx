import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import { ControlTypes } from './constants';
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
    move: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
    type: PropTypes.oneOf(Object.keys(ControlTypes)).isRequired,
    position: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired
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
    type === ControlTypes.Group ?
      dispatch(moveGroup(position, direction)) :
      dispatch(moveStage(position, direction));
  },
  remove(type, position) {
    type === ControlTypes.Group ?
      dispatch(removeGroup(position)) :
      dispatch(removeStage(position));
  }
}))(OrderControls);
