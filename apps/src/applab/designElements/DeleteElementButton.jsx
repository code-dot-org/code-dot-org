import React from 'react';
import color from '../../util/color';
import commonStyles from '../../commonStyles';
import PropTypes from 'prop-types';
import Radium from 'radium';

/**
 * A delete button that will also ask for confirmation when shouldConfirm is
 * true.
 */
class DeleteElementButton extends React.Component {
  static propTypes = {
    shouldConfirm: PropTypes.bool.isRequired,
    handleDelete: PropTypes.func.isRequired
  };

  state = {
    confirming: false
  };

  handleDeleteInternal = event => {
    if (this.props.shouldConfirm) {
      this.setState({confirming: true});
    } else {
      this.finishDelete();
    }
  };

  finishDelete = () => this.props.handleDelete();

  abortDelete = event => this.setState({confirming: false});

  render() {
    if (this.state.confirming) {
      return (
        <div style={[styles.right, styles.confirming]}>
          Delete?
          <button
            type="button"
            style={[commonStyles.button, styles.red]}
            onClick={this.finishDelete}
          >
            Yes
          </button>
          <button
            type="button"
            style={commonStyles.button}
            onClick={this.abortDelete}
          >
            No
          </button>
        </div>
      );
    }
    return (
      <div>
        <button
          type="button"
          style={[commonStyles.button, styles.red, styles.right]}
          onClick={this.handleDeleteInternal}
        >
          Delete
        </button>
      </div>
    );
  }
}

const styles = {
  right: {
    float: 'right'
  },
  confirming: {
    marginLeft: 20
  },
  red: {
    backgroundColor: color.red,
    color: color.white
  }
};

export default Radium(DeleteElementButton);
