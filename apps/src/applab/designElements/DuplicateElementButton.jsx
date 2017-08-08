import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import commonStyles from '../../commonStyles';
import Radium from 'radium';

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
var DuplicateElementButton = createReactClass({
  propTypes: {
    handleDuplicate: PropTypes.func.isRequired
  },

  handleDuplicate: function (event) {
    this.props.handleDuplicate();
  },

  render: function () {
    return (
      <div style={styles.main}>
        <button
          style={[commonStyles.button, styles.duplicateButton]}
          onClick={this.handleDuplicate}
        >
          Duplicate
        </button>
    </div>
    );
  }
});

export default Radium(DuplicateElementButton);
