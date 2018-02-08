import React, {PropTypes} from 'react';
import commonStyles from '../../commonStyles';
import Radium from 'radium';

const styles = {
  duplicateButton: {
    backgroundColor: '#0aa',
    color: 'white',
    float: 'right'
  }
};

/**
 * A duplicate button that helps replicate elements
 */
class DuplicateElementButton extends React.Component {
  static propTypes = {
    handleDuplicate: PropTypes.func.isRequired
  };

  handleDuplicate = (event) => this.props.handleDuplicate();

  render() {
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
}

export default Radium(DuplicateElementButton);
