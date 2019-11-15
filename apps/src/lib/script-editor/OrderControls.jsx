import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {ControlTypes} from './constants';
import {moveGroup, moveStage, removeGroup, removeStage} from './editorRedux';
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

class OrderControls extends Component {
  static propTypes = {
    move: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
    type: PropTypes.oneOf(Object.keys(ControlTypes)).isRequired,
    position: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    itemType: PropTypes.string.isRequired,
    itemName: PropTypes.string.isRequired
  };

  state = {
    showConfirm: false
  };

  handleMoveUp = () => {
    if (this.props.position !== 1) {
      this.props.move(this.props.type, this.props.position, 'up');
    }
  };

  handleMoveDown = () => {
    if (this.props.position !== this.props.total) {
      this.props.move(this.props.type, this.props.position, 'down');
    }
  };

  handleRemove = () => {
    this.setState({showConfirm: true});
  };

  handleConfirm = () => {
    this.setState({showConfirm: false});
    this.props.remove(this.props.type, this.props.position);
  };

  handleClose = () => {
    this.setState({showConfirm: false});
  };

  render() {
    const {showConfirm} = this.state;
    const {itemType, itemName} = this.props;
    const text =
      `Are you sure you want to delete the ${itemType} named "${itemName}" ` +
      'and all its contents?';
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

export default connect(
  state => ({}),
  dispatch => ({
    move(type, position, direction) {
      type === ControlTypes.Group
        ? dispatch(moveGroup(position, direction))
        : dispatch(moveStage(position, direction));
    },
    remove(type, position) {
      type === ControlTypes.Group
        ? dispatch(removeGroup(position))
        : dispatch(removeStage(position));
    }
  })
)(OrderControls);
