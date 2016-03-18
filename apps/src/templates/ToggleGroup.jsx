/** @file Row of buttons for switching editor modes. */
var ToggleButton = require('./ToggleButton.jsx');

var ToggleGroup = React.createClass({
  propTypes: {
    selected: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    children: function (props, propName, componentName) {
      var prop = props[propName];
      var error;
      if (React.Children.count(prop) < 1) {
        error = new Error(componentName + ' must have at least one child button.');
      }

      React.Children.forEach(prop, function (child) {
        if (child.type !== 'button') {
          error = new Error(componentName + ' should only have buttons as ' +
              'child elements.');
        }
      });
      return error;
    }
  },

  setSelected: function (selected) {
    this.props.onChange(selected);
  },

  render: function () {
    return <span>{this.renderChildren()}</span>;
  },

  renderChildren: function () {
    var childrenCount = React.Children.count(this.props.children);
    return React.Children.map(this.props.children, function (child, index) {
      return (
        <ToggleButton
            id={child.props.id}
            active={child.props.value === this.props.selected}
            first={index === 0}
            last={index === childrenCount-1}
            onClick={this.setSelected.bind(this, child.props.value)}>
          {child.props.children}
        </ToggleButton>
      );
    }, this);
  }
});
module.exports = ToggleGroup;
