import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '@cdo/apps/util/color';
import Button from '@cdo/apps/templates/Button';

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
class DropdownButton extends Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
    color: PropTypes.oneOf(Object.values(Button.ButtonColor)).isRequired,
    size: PropTypes.string,
    onClick: PropTypes.func,
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

  onComponentDidUnmount() {
    document.removeEventListener('click', this.onClickDocument, false);
  }

  expandDropdown = () => {
    document.addEventListener('click', this.onClickDocument, false);
    this.setState({dropdownOpen: true});
  };

  collapseDropdown = () => {
    document.removeEventListener('click', this.onClickDocument, false);
    this.setState({dropdownOpen: false});
  };

  onClickDocument = event => {
    // We're only concerned with clicks outside of ourselves
    if (ReactDOM.findDOMNode(this).contains(event.target)) {
      return;
    }
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
    this.collapseDropdown();
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
        />

        {dropdownOpen && (
          <div style={styles.dropdown}>
            {this.props.children.map((child, index) => (
              <a
                {...child.props}
                onClick={event => this.onClickChild(event, child.props)}
                key={index}
                style={{
                  ...styles.anchor,
                  ...(index > 0 && styles.nonFirstAnchor)
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default Radium(DropdownButton);
