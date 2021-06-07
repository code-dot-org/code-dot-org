/** @file Row of buttons for switching editor modes. */
import PropTypes from 'prop-types';

import React, {Component} from 'react';
import {connect} from 'react-redux';
import ToggleButton from './ToggleButton';

class ToggleGroup extends Component {
  static propTypes = {
    selected: PropTypes.string,
    activeColor: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    children(props, propName, componentName) {
      const prop = props[propName];
      let error;
      if (React.Children.count(prop) < 1) {
        error = new Error(
          `${componentName} must have at least one child button.`
        );
      }

      React.Children.forEach(prop, child => {
        if (!child) {
          // falsy children are ok and will be omitted by react rendering
          return;
        }
        if (child.type !== 'button') {
          error = new Error(
            `${componentName} should only have buttons as ` + 'child elements.'
          );
        }
      });
      return error;
    },
    // Redux
    isRtl: PropTypes.bool
  };

  setSelected(selected) {
    this.props.onChange(selected);
  }

  render() {
    // Reverse children order if locale is RTL
    const {isRtl} = this.props;
    const spanStyle = isRtl ? styles.buttonReverse : null;

    return <span style={spanStyle}>{this.renderChildren()}</span>;
  }

  renderChildren() {
    // Remove falsy children to make sure first and last buttons are rounded properly.
    const children = React.Children.toArray(this.props.children).filter(
      child => !!child
    );
    return children.map((child, index) => {
      const isSelected = child.props.value === this.props.selected;
      return (
        <ToggleButton
          id={child.props.id}
          className={child.props.className}
          key={child.key}
          active={isSelected}
          first={index === 0}
          last={index === children.length - 1}
          activeColor={this.props.activeColor}
          title={child.props.title}
          style={child.props.style}
          onClick={
            isSelected
              ? undefined
              : this.setSelected.bind(this, child.props.value)
          }
        >
          {child.props.children}
        </ToggleButton>
      );
    });
  }
}

const styles = {
  buttonReverse: {
    display: 'flex',
    flexDirection: 'row-reverse'
  }
};

export const UnconnectedToggleGroup = ToggleGroup;

export default connect(state => ({
  isRtl: state.isRtl
}))(ToggleGroup);
