var React = require('react');
var color = require('../../color');
var commonStyles = require('../../commonStyles');
var Radium = require('radium');

var styles = {
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

/**
 * A delete button that will also ask for confirmation when shouldConfirm is
 * true.
 */
var DeleteElementButton = React.createClass({
  propTypes: {
    shouldConfirm: React.PropTypes.bool.isRequired,
    handleDelete: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      confirming: false
    };
  },

  handleDeleteInternal: function (event) {
    if (this.props.shouldConfirm) {
      this.setState({confirming: true});
    } else {
      this.finishDelete();
    }
  },

  finishDelete: function () {
    this.props.handleDelete();
  },

  abortDelete: function (event) {
    this.setState({confirming: false});
  },

  render: function () {
    var confirm;
    if (this.state.confirming) {
      return (
        <div style={[styles.right, styles.confirming]}>
          Delete?
          <button
            style={[commonStyles.button, styles.red]}
            onClick={this.finishDelete}
          >
            Yes
          </button>
          <button
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
          style={[commonStyles.button, styles.red, styles.right]}
          onClick={this.handleDeleteInternal}
        >
          Delete
        </button>
      </div>
    );
  }
});

module.exports = Radium(DeleteElementButton);
