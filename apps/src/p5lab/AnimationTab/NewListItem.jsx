/** List item placeholder for adding a new item */
import React from 'react';
import color from '@cdo/apps/util/color';
import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports

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
          <div style={[styles.border, hovered && styles.borderHovered]}>
            <i
              className="fa fa-plus-circle"
              style={[styles.addButton, hovered && styles.borderHovered_add]}
            />
            <div
              className="animation-name"
              style={[
                styles.animationName,
                hovered && styles.borderHovered_animationName
              ]}
            >
              {this.props.label}
            </div>
          </div>
        </div>
      </button>
    );
  }
}
const polar_blue = '#0094CA';
const styles = {
  tile: {
    width: '95%',
    padding: '0 0 4px 0',
    marginBottom: 0,
    boxShadow: 'none',
    ':hover': {
      cursor: 'pointer'
    },
    background: 'none',
    border: 20,
    marginRight: 0,
    marginLeft: 5
  },
  wrapper: {
    position: 'relative',
    display: 'block',
    paddingTop: '100%'
  },
  border: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 10,
    backgroundColor: color.white,
    border: 'solid 2px ' + polar_blue,
    textAlign: 'center',
    paddingTop: '50%'
  },
  addButton: {
    color: polar_blue,
    fontSize: 76,
    marginTop: '-45px'
  },
  animationName: {
    marginTop: 5,
    textAlign: 'center',
    userSelect: 'none',
    fontWeight: 'normal',
    color: polar_blue,
    fontSize: '14px'
  },
  borderHovered: {
    backgroundColor: polar_blue,
    border: 'solid 4px ' + polar_blue
  },
  borderHovered_add: {
    color: color.white
  },
  borderHovered_animationName: {
    color: color.white
  }
};

export default Radium(NewListItem);
