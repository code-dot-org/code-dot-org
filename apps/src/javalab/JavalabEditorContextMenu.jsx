import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '@cdo/apps/util/color';
import onClickOutside from 'react-onclickoutside';

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
    border: `1px solid ${color.charcoal}`
  },
  nonFirstAnchor: {
    borderTop: `1px solid ${color.charcoal}`
  }
};

/**
 * A button that drops down to a set of clickable links, and closes itself if
 * you click on the button, or outside of the dropdown.
 */
export const JavalabContextMenu = class JavalabContextMenuComponent extends Component {
  static propTypes = {
    cancelContextMenu: PropTypes.func.isRequired,
    renameFromContextMenu: PropTypes.func.isRequired
  };

  state = {
    dropdownOpen: false
  };

  handleClickOutside = () => {
    this.props.cancelContextMenu();
  };

  render() {
    const {renameFromContextMenu, cancelContextMenu} = this.props;

    return (
      <div>
        <a key="rename" onClick={renameFromContextMenu} style={styles.anchor}>
          Rename
        </a>
        <a
          key="cancel"
          onClick={cancelContextMenu}
          style={{...styles.nonFirstAnchor, ...styles.anchor}}
        >
          Cancel
        </a>
      </div>
    );
  }
};

export default onClickOutside(Radium(JavalabContextMenu));
