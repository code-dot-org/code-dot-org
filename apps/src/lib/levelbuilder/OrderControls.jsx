import React, {Component} from 'react';
import PropTypes from 'prop-types';
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

export default class OrderControls extends Component {
  static propTypes = {
    move: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired
  };

  state = {
    showConfirm: false
  };

  handleMoveUp = () => {
    this.props.move('up');
  };

  handleMoveDown = () => {
    this.props.move('down');
  };

  handleRemove = () => {
    this.setState({showConfirm: true});
  };

  handleConfirm = () => {
    this.setState({showConfirm: false});
    this.props.remove();
  };

  handleClose = () => {
    this.setState({showConfirm: false});
  };

  render() {
    const {showConfirm} = this.state;
    const {name} = this.props;
    const text = `Are you sure you want to remove "${name}" and all its contents from the script?`;
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
