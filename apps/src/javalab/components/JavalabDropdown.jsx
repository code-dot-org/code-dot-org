import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '@cdo/apps/util/color';

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
    }
  };

  render() {
    return (
      <div style={styles.dropdown} ref={ref => (this.dropdownList = ref)}>
        {this.props.children.map((child, index) => (
          <a
            {...child.props}
            key={index}
            style={{
              ...styles.anchor,
              ...(index > 0 && styles.nonFirstAnchor),
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
    padding: '5px 0 5px 0',
    position: 'absolute',
    // without this, this will be below some content, such as ProgressBubble.
    zIndex: 1000
  },
  anchor: {
    padding: '5px 12px 5px 12px',
    color: color.dark_charcoal,
    backgroundColor: color.white,
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 14,
    display: 'block',
    textDecoration: 'none',
    lineHeight: '20px',
    transition: 'background-color .2s ease-out',
    ':hover': {
      backgroundColor: color.lightest_gray,
      cursor: 'pointer'
    },
    width: '100%',
    borderRadius: 0,
    margin: 0,
    textAlign: 'center'
  }
};

export default Radium(JavalabDropdown);
