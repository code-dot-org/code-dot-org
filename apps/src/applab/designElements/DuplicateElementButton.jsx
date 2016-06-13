var React = require('react');
var commonStyles = require('../../commonStyles');
var Radium = require('radium');

var styles = {
  duplicateButton: {
    backgroundColor: '#0aa',
    color: 'white',
    float: 'right'
  }
};

/**
 * A duplicate button that helps replicate elements
 */
var DuplicateElementButton = React.createClass({
  propTypes: {
    handleDuplicate: React.PropTypes.func.isRequired
  },

  handleDuplicate: function (event) {
    this.props.handleDuplicate();
  },

  render: function () {
    return (
      <div style={styles.main}>
        <button
            style={[commonStyles.button, styles.duplicateButton]}
            onClick={this.handleDuplicate}>
          Duplicate
        </button>
    </div>
    );
  }
});

module.exports = Radium(DuplicateElementButton);
