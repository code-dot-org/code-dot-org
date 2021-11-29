import React from 'react';
import commonStyles from '../../commonStyles';
import PropTypes from 'prop-types';
import Radium from 'radium';

/**
 * A restore theme defaults button
 */
class RestoreThemeDefaultsButton extends React.Component {
  static propTypes = {
    handleRestore: PropTypes.func.isRequired
  };

  render() {
    const {handleRestore} = this.props;
    return (
      <button
        type="button"
        style={[commonStyles.button, styles.restoreButton]}
        onClick={handleRestore}
      >
        Apply Theme
      </button>
    );
  }
}

const styles = {
  restoreButton: {
    backgroundColor: '#0aa',
    color: 'white',
    float: 'right'
  }
};

export default Radium(RestoreThemeDefaultsButton);
