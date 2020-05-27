import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {ControlTypes} from './constants';
import {moveGroup, moveLesson, removeGroup, removeLesson} from './editorRedux';
import Dialog from '../../templates/Dialog';

const styles = {
  controls: {
    float: 'right'
  },
  controlIcon: {
    margin: '0 5px',
    cursor: 'pointer'
  }
};

export class UnconnectedOrderControls extends Component {
  static propTypes = {
    move: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
    type: PropTypes.oneOf(Object.keys(ControlTypes)).isRequired,
    position: PropTypes.number.isRequired,
    parentPosition: PropTypes.number,
    total: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired
  };

  state = {
    showConfirm: false
  };

  handleMoveUp = () => {
    if (this.props.position !== 1) {
      this.props.move(
        this.props.type,
        this.props.position,
        this.props.parentPosition,
        'up'
      );
    }
  };

  handleMoveDown = () => {
    if (this.props.position !== this.props.total) {
      this.props.move(
        this.props.type,
        this.props.position,
        this.props.parentPosition,
        'down'
      );
    }
  };

  handleRemove = () => {
    this.setState({showConfirm: true});
  };

  handleConfirm = () => {
    this.setState({showConfirm: false});
    this.props.remove(
      this.props.type,
      this.props.position,
      this.props.parentPosition
    );
  };

  handleClose = () => {
    this.setState({showConfirm: false});
  };

  render() {
    const {showConfirm} = this.state;
    const {type, name} = this.props;
    const text =
      `Are you sure you want to remove the ${type} named "${name}" ` +
      'and all its contents from the script?';
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
        <Dialog
          body={text}
          cancelText="Cancel"
          confirmText="Delete"
          confirmType="danger"
          isOpen={showConfirm}
          handleClose={this.handleClose}
          onCancel={this.handleClose}
          onConfirm={this.handleConfirm}
        />
      </div>
    );
  }
}

const OrderControls = connect(
  state => ({}),
  dispatch => ({
    move(type, position, parentPosition, direction) {
      type === ControlTypes.Group
        ? dispatch(moveGroup(position, direction))
        : dispatch(moveLesson(parentPosition, position, direction));
    },
    remove(type, position, parentPosition) {
      type === ControlTypes.Group
        ? dispatch(removeGroup(position))
        : dispatch(removeLesson(parentPosition, position));
    }
  })
)(UnconnectedOrderControls);

export default OrderControls;
