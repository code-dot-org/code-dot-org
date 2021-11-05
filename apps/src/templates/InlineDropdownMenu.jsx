import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '@cdo/apps/util/color';
import onClickOutside from 'react-onclickoutside';
import {KeyCodes} from '@cdo/apps/constants';

// HTML Adapted from:
// https://www.w3.org/TR/wai-aria-practices-1.1/examples/menu-button/menu-button-actions.html

// Displays an accessible dropdown menu with actions or links
// TODO: Convert to a functional component once Radium is upgraded past 0.26.0
// Our version of Radium doesn't support useState, but it has been patched in
// later versions
export class InlineDropdownMenu extends Component {
  static propTypes = {
    icon: PropTypes.string.isRequired,
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
    isOpen: false
  };

  handleClickOutside = () => {
    if (this.state.isOpen) {
      this.setState({isOpen: false});
    }
  };

  selectOptionWrapper = selectAction => {
    this.setState({isOpen: false});
    selectAction();
  };

  // Adding a handleKeyDown allows the menu items to be keyboard accessible
  handleKeyDown = (event, selectAction) => {
    switch (event.which) {
      case KeyCodes.ENTER:
      case KeyCodes.SPACE: {
        this.selectOptionWrapper(selectAction);
        break;
      }
    }
  };

  render() {
    const {children, icon} = this.props;
    const {isOpen} = this.state;
    if (children === undefined || children.length === 0) {
      return;
    }

    return (
      <>
        <button
          type="button"
          style={styles.menuButton}
          onClick={() =>
            this.setState(state => {
              return {isOpen: !state.isOpen};
            })
          }
        >
          <i className={icon} />
        </button>
        {isOpen && (
          <ul
            style={styles.dropdownContainer}
            className="ignore-react-onclickoutside"
          >
            {children.map((child, index) => {
              return (
                <a
                  {...child.props}
                  onClick={() => this.selectOptionWrapper(child.props.onClick)}
                  onKeyDown={event =>
                    this.handleKeyDown(event, child.props.onClick)
                  }
                  style={styles.dropdownOptionContainer}
                  key={index}
                  tabIndex={0}
                />
              );
            })}
          </ul>
        )}
      </>
    );
  }
}

export default onClickOutside(Radium(InlineDropdownMenu));

const styles = {
  menuButton: {
    padding: '0 2px',
    margin: 0,
    border: '1px solid #fff',
    background: 'none',
    lineHeight: '18px',
    ':hover': {
      boxShadow: 'none'
    },
    ':active': {
      boxShadow: 'none'
    }
  },
  dropdownContainer: {
    top: 15,
    position: 'absolute',
    marginTop: '5px',
    right: '0px',
    zIndex: 1,
    boxShadow: `3px 3px 3px ${color.lighter_gray}`,
    borderRadius: '4px',
    backgroundColor: color.white
  },
  dropdownOptionContainer: {
    height: '22px',
    fontSize: '14px',
    fontFamily: '"Gotham 5r"',
    color: color.dark_charcoal,
    padding: '5px 12px',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: color.lightest_gray,
      textDecoration: 'none'
    },
    ':focus': {
      textDecoration: 'none'
    },
    display: 'flex',
    alignItems: 'center'
  }
};
