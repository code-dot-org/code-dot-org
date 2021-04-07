import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '@cdo/apps/util/color';
import Button from '@cdo/apps/templates/Button';
import onClickOutside from 'react-onclickoutside';

const styles = {
  main: {
    display: 'inline-block'
  },
  icon: {
    fontSize: 24,
    // we want our icon text to be a different size than our button text, which
    // requires we manually offset to get it centered properly
    position: 'relative',
    top: 3
  },
  dropdown: {
    border: `1px solid ${color.charcoal}`,
    position: 'absolute',
    // without this, this will be below some content, such as ProgressBubble.
    zIndex: 1000
  },
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
    }
  },
  nonFirstAnchor: {
    borderTop: `1px solid ${color.charcoal}`
  }
};

/**
 * A button that drops down to a set of clickable links, and closes itself if
 * you click on the button, or outside of the dropdown.
 */
export const DropdownButton = class DropdownButtonComponent extends Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
    color: PropTypes.oneOf(Object.values(Button.ButtonColor)).isRequired,
    size: PropTypes.string,
    onClick: PropTypes.func,
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

  state = {
    dropdownOpen: false
  };

  expandDropdown = () => {
    this.setState({dropdownOpen: true});
  };

  collapseDropdown = () => {
    this.setState({dropdownOpen: false});
  };

  handleClickOutside = () => {
    if (this.state.dropdownOpen) {
      this.collapseDropdown();
    }
  };

  toggleDropdown = () => {
    if (this.state.dropdownOpen) {
      this.collapseDropdown();
    } else {
      this.expandDropdown();
      if (this.props.onClick) {
        this.props.onClick();
      }
    }
  };

  onClickChild = (event, childProps) => {
    /*
      In LessonNavigationDropdown we create sections which we want
      to be able to expand and collapse. Use the no-navigation class
      name allows us to mark when we want the dropdown to collapse for
      each click component
     */
    if (childProps.className !== 'no-navigation') {
      this.collapseDropdown();
    }

    if (childProps.onClick) {
      childProps.onClick(event);
    }
  };

  render() {
    const {text, color, size} = this.props;
    const {dropdownOpen} = this.state;

    return (
      <div style={styles.main}>
        <Button
          __useDeprecatedTag
          text={text}
          size={size}
          onClick={this.toggleDropdown}
          icon={dropdownOpen ? 'caret-up' : 'caret-down'}
          iconStyle={styles.icon}
          color={color}
          className={this.props.className}
        />

        {dropdownOpen && (
          <div style={styles.dropdown} ref={ref => (this.dropdownList = ref)}>
            {this.props.children.map((child, index) => (
              <a
                {...child.props}
                onClick={event => this.onClickChild(event, child.props)}
                key={index}
                style={{
                  ...styles.anchor,
                  ...(index > 0 && styles.nonFirstAnchor),
                  ...child.props.style
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
};

export default onClickOutside(Radium(DropdownButton));
