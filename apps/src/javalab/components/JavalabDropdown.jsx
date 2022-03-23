import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '@cdo/apps/util/color';

/**
 * Component for a list of links that appears as a dropdown.
 * This component only includes the dropdown itself,
 * not the button that opens/closes the dropdown.
 */
class JavalabDropdown extends Component {
  static propTypes = {
    className: PropTypes.string,
    children: props => {
      React.Children.map(props.children, child => {
        if (child.type !== 'a') {
          throw new Error('only accepts children of type <a/>');
        }
        if (!child.props.href && !child.props.onClick) {
          throw new Error('each child must have an href or onclick');
        }
      });
    },
    style: PropTypes.object
  };

  render() {
    return (
      <div style={{...styles.dropdown, ...this.props.style}}>
        {this.props.children.map((child, index) => (
          <a
            {...child.props}
            key={index}
            style={{
              ...styles.anchor,
              ...child.props.style
            }}
          />
        ))}
      </div>
    );
  }
}

const styles = {
  dropdown: {
    padding: '5px 0',
    position: 'absolute',
    // without this, this will be below some content
    zIndex: 1000,
    backgroundColor: color.white,
    border: `1px solid ${color.charcoal}`,
    borderRadius: 4
  },
  anchor: {
    padding: '5px 12px',
    color: color.dark_charcoal,
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 14,
    display: 'block',
    backgroundColor: color.white,
    textDecoration: 'none',
    lineHeight: '20px',
    transition: 'background-color .2s ease-out',
    ':hover': {
      backgroundColor: color.lightest_gray,
      cursor: 'pointer'
    },
    borderRadius: 0,
    margin: 0,
    textAlign: 'center',
    whiteSpace: 'nowrap'
  }
};

export default Radium(JavalabDropdown);
