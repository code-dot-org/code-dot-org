import React from 'react';
import commonStyles from '../../commonStyles';
import PropTypes from 'prop-types';
import Radium from 'radium';

/**
 * A duplicate button that helps replicate elements
 */
class DuplicateElementButton extends React.Component {
  static propTypes = {
    handleDuplicate: PropTypes.func.isRequired
  };

  handleDuplicate = event => this.props.handleDuplicate();

  render() {
    return (
      <div style={styles.main}>
        <button
          type="button"
          style={[commonStyles.button, styles.duplicateButton]}
          onClick={this.handleDuplicate}
        >
          Duplicate
        </button>
      </div>
    );
  }
}

const styles = {
  duplicateButton: {
    backgroundColor: '#0aa',
    color: 'white',
    float: 'right'
  }
};

export default Radium(DuplicateElementButton);
