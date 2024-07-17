import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import style from './javalab-dropdown.module.scss';

/**
 * Component for a list of buttons that appears as a dropdown.
 * This component only includes the dropdown itself,
 * not the button that opens/closes the dropdown.
 */
export default class JavalabDropdown extends Component {
  static propTypes = {
    className: PropTypes.string,
    children: props => {
      React.Children.map(props.children, child => {
        if (!child) {
          return;
        }
        if (child.type !== 'button') {
          throw new Error('only accepts children of type <button/>');
        }
        if (!child.props.onClick) {
          throw new Error('each child must have an onclick');
        }
      });
    },
    style: PropTypes.object,
  };

  // filter removes null elements
  render() {
    return (
      <div
        className={classNames(style.dropdown, this.props.className)}
        style={this.props.style}
      >
        {this.props.children
          .filter(child => child)
          .map((child, index) => (
            <button
              type="button"
              {...child.props}
              className={classNames(style.anchor, child.props.className)}
              key={index}
              style={child.props.style}
            />
          ))}
      </div>
    );
  }
}
