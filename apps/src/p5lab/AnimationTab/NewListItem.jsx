/** List item placeholder for adding a new item */
import React from 'react';
import color from '@cdo/apps/util/color';
import PropTypes from 'prop-types';
import Radium from 'radium';

/**
 * List item control (usable in animation or frame lists) for adding
 * a new item - displays as a plus sign in a dashed box.
 */
class NewListItem extends React.Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
  };

  render() {
    const hovered = Radium.getState(this.state, 'main', ':hover');
    return (
      <button
        style={styles.tile}
        onClick={this.props.onClick}
        className="newListItem"
        type="button"
      >
        <div style={styles.wrapper}>
          <div
            style={[styles.dottedBorder, hovered && styles.dottedBorderHovered]}
          >
            <i className="fa fa-plus-circle" style={styles.addButton} />
          </div>
        </div>
        <div className="animation-name" style={styles.animationName}>
          {this.props.label}
        </div>
      </button>
    );
  }
}

const styles = {
  tile: {
    width: '100%',
    padding: '0 0 4px 0',
    marginBottom: 0,
    boxShadow: 'none',
    ':hover': {
      cursor: 'pointer'
    },
    background: 'none',
    border: 0,
    marginRight: 0,
    marginLeft: 0
  },
  wrapper: {
    position: 'relative',
    display: 'block',
    paddingTop: '100%'
  },
  dottedBorder: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 10,
    border: 'dashed 2px ' + color.light_gray,
    textAlign: 'center',
    paddingTop: '50%'
  },
  dottedBorderHovered: {
    backgroundColor: color.lighter_purple
  },
  addButton: {
    color: color.light_gray,
    fontSize: 60,
    marginTop: '-32px'
  },
  animationName: {
    marginTop: 4,
    textAlign: 'center',
    userSelect: 'none',
    fontWeight: 'bold',
    color: color.light_gray,
    fontSize: '13px'
  }
};

export default Radium(NewListItem);
