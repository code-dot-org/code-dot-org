import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import onClickOutside from 'react-onclickoutside';

import style from './dropdown-button.module.scss';

/**
 * A button that drops down to a set of clickable links, and closes itself if
 * you click on the button, or outside of the dropdown.
 */
export const DropdownButton = class DropdownButtonComponent extends Component {
  static propTypes = {
    text: PropTypes.string,
    customText: PropTypes.node,
    color: PropTypes.string.isRequired,
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
    },
  };

  state = {
    dropdownOpen: false,
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
      <div className={style.main}>
        <MuiButton
          variant="text"
          type="button"
          disableRipple
          onClick={this.toggleDropdown}
          endIcon={
            <FontAwesomeV6Icon
              iconName={dropdownOpen ? 'caret-up' : 'caret-down'}
              className={style.icon}
            />
          }
          className={classNames(
            style.dropdownButton,
            style[color],
            style[size],
            this.props.className
          )}
        >
          {text}
          {this.props.customText && (
            <div className={style.main}>{this.props.customText}</div>
          )}
        </MuiButton>

        {dropdownOpen && (
          <div
            className={style.dropdown}
            ref={ref => (this.dropdownList = ref)}
          >
            {this.props.children.map((child, index) => (
              <a
                {...child.props}
                onClick={event => this.onClickChild(event, child.props)}
                key={index}
                className={classNames(
                  child.props.className,
                  style.anchor,
                  index > 0 && style.nonFirstAnchor
                )}
                style={{
                  ...child.props.style,
                }}
              >
                {child.props.children}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }
};

export default onClickOutside(DropdownButton);
