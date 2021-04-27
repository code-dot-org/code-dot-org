import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '@cdo/apps/util/color';

const styles = {
  anchor: {
    padding: 10,
    color: color.charcoal,
    backgroundColor: color.white,
    fontFamily: '"Gotham 5r", sans-serif',
    display: 'block',
    textDecoration: 'none',
    lineHeight: '20px',
    transition: 'background-color .2s ease-out',
    ':hover': {
      backgroundColor: color.lightest_gray,
      cursor: 'pointer'
    },
    border: `1px solid ${color.charcoal}`,
    width: '100%',
    borderRadius: 0,
    margin: 0
  }
};

/**
 * A menu with a set of clickable links that calls the cancel handler if you
 * click outside the menu or the cancel button.
 */
class JavalabTabMenuComponent extends Component {
  static propTypes = {
    cancelTabMenu: PropTypes.func.isRequired,
    renameFromTabMenu: PropTypes.func.isRequired
  };

  state = {
    dropdownOpen: false
  };

  render() {
    const {renameFromTabMenu, cancelTabMenu} = this.props;
    return (
      <div>
        <button
          type="button"
          key="rename"
          onClick={renameFromTabMenu}
          style={styles.anchor}
        >
          Rename
        </button>
        <button
          type="button"
          key="cancel"
          onClick={cancelTabMenu}
          style={styles.anchor}
        >
          Cancel
        </button>
      </div>
    );
  }
}

export default Radium(JavalabTabMenuComponent);
