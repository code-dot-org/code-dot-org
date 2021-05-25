import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '@cdo/apps/util/color';

/**
 * A menu with a set of clickable links that calls the cancel handler if you
 * click outside the menu or the cancel button.
 */
class JavalabTabMenuComponent extends Component {
  static propTypes = {
    cancelTabMenu: PropTypes.func.isRequired,
    renameFromTabMenu: PropTypes.func.isRequired,
    deleteFromTabMenu: PropTypes.func.isRequired,
    changeFileTypeFromTabMenu: PropTypes.func.isRequired,
    showVisibilityOption: PropTypes.bool.isRequired,
    fileIsVisible: PropTypes.bool,
    fileIsValidation: PropTypes.bool
  };

  state = {
    dropdownOpen: false
  };

  render() {
    const {
      renameFromTabMenu,
      deleteFromTabMenu,
      cancelTabMenu,
      showVisibilityOption,
      changeFileTypeFromTabMenu,
      fileIsVisible,
      fileIsValidation
    } = this.props;
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
          key="delete"
          onClick={deleteFromTabMenu}
          style={styles.anchor}
        >
          Delete
        </button>
        {showVisibilityOption && !fileIsVisible && (
          <button
            type="button"
            key="starter"
            onClick={() => {
              changeFileTypeFromTabMenu(
                true /*isVisible*/,
                false /*isValidation*/
              );
            }}
            style={styles.anchor}
          >
            Make starter file
          </button>
        )}
        {showVisibilityOption && (fileIsVisible || fileIsValidation) && (
          <button
            type="button"
            key="support"
            onClick={() => {
              changeFileTypeFromTabMenu(
                false /*isVisible*/,
                false /*isValidation*/
              );
            }}
            style={styles.anchor}
          >
            Make support file
          </button>
        )}
        {showVisibilityOption && !fileIsValidation && (
          <button
            type="button"
            key="validation"
            onClick={() => {
              changeFileTypeFromTabMenu(
                false /*isVisible*/,
                true /*isValidation*/
              );
            }}
            style={styles.anchor}
          >
            Make validation file
          </button>
        )}
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

const styles = {
  anchor: {
    padding: 5,
    color: color.charcoal,
    backgroundColor: color.white,
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 14,
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

export default Radium(JavalabTabMenuComponent);
