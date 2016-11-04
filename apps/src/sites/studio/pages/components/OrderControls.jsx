import React from 'react';

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
    handleAction: React.PropTypes.func.isRequired,
    type: React.PropTypes.oneOf(['GROUP', 'STAGE']).isRequired,
    position: React.PropTypes.number.isRequired,
    total: React.PropTypes.number.isRequired
  },

  handleMoveUp() {
    if (this.props.position !== 1) {
      this.props.handleAction('MOVE_' + this.props.type, {position: this.props.position, direction: 'up'});
    }
  },

  handleMoveDown() {
    if (this.props.position !== this.props.total) {
      this.props.handleAction('MOVE_' + this.props.type, {position: this.props.position, direction: 'down'});
    }
  },

  handleRemove() {
    this.props.handleAction('REMOVE_' + this.props.type, {position: this.props.position});
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

export default OrderControls;
