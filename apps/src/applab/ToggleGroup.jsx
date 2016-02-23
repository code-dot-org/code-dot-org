/** @file Row of buttons for switching editor modes. */
// Strict linting: Absorb into global config when possible
/* jshint
 unused: true,
 eqeqeq: true,
 maxlen: 120
 */

var ToggleGroup = React.createClass({
  propTypes: {
    selected: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired
  },

  setSelected: function (selected) {
    this.props.onChange(selected);
  },

  render: function () {
    return <span>{this.renderChildren()}</span>;
  },

  renderChildren: function () {
    return React.Children.map(this.props.children, function (child, index) {
      return React.cloneElement(child, {
        first: index === 0,
        last: index === React.Children.count(this.props.children) - 1,
        active: child.props.value === this.props.selected,
        onClick: this.setSelected.bind(this, child.props.value)
      });
    }, this);
  }
});
module.exports = ToggleGroup;