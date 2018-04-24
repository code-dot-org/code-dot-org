/** @file Row of buttons for switching editor modes. */
import React, {PropTypes, Component} from 'react';
import ToggleButton from './ToggleButton';

export default class ToggleGroup extends Component {
  static propTypes = {
    selected: PropTypes.string,
    activeColor: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    children(props, propName, componentName) {
      const prop = props[propName];
      let error;
      if (React.Children.count(prop) < 1) {
        error = new Error(`${componentName} must have at least one child button.`);
      }

      React.Children.forEach(prop, child => {
        if (!child) {
          // falsy children are ok and will be omitted by react rendering
          return;
        }
        if (child.type !== 'button') {
          error = new Error(`${componentName} should only have buttons as ` +
              'child elements.');
        }
      });
      return error;
    }
  };

  setSelected(selected) {
    this.props.onChange(selected);
  }

  render() {
    return <span>{this.renderChildren()}</span>;
  }

  renderChildren() {
    // Remove falsy children to make sure first and last buttons are rounded properly.
    const children = React.Children.toArray(this.props.children).filter(child => !!child);
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
          onClick={isSelected ? undefined : this.setSelected.bind(this, child.props.value)}
        >
          {child.props.children}
        </ToggleButton>
      );
    });
  }
}
