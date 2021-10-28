import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '@cdo/apps/util/color';
import onClickOutside from 'react-onclickoutside';

// HTML Adapted from:
// https://www.w3.org/TR/wai-aria-practices-1.1/examples/menu-button/menu-button-actions.html
// The accessibility isn't perfect yet - items within the dropdown aren't tab
// navigable at this point - but it's a step in the right direction.

// Displays a dropdown menu that displays actions that can be taken on comments
class CommentOptions extends Component {
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

  handleKeyDown = (event, selectAction) => {
    switch (event.which) {
      // 13 is "enter" and 32 is "space"
      case 13:
      case 32: {
        this.selectOptionWrapper(selectAction);
      }
    }
  };

  render() {
    const {children, icon} = this.props;
    const {isOpen} = this.state;
    if (children.length === 0) {
      return;
    }

    return (
      <>
        <button
          type="button"
          style={styles.menuButton}
          onClick={() =>
            this.setState({
              isOpen: !isOpen
            })
          }
        >
          <i className={icon} />
        </button>
        {isOpen && (
          <ul
            style={styles.commentOptionsContainer}
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
                  style={styles.commentOptionContainer}
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

export default onClickOutside(Radium(CommentOptions));

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
  commentOptionsContainer: {
    top: 15,
    position: 'absolute',
    marginTop: '5px',
    right: '0px',
    zIndex: 1,
    boxShadow: `3px 3px 3px ${color.lighter_gray}`,
    borderRadius: '4px',
    backgroundColor: color.white
  },
  commentOptionContainer: {
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
