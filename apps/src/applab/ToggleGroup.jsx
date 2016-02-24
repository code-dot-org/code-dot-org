/** @file Row of buttons for switching editor modes. */
// Strict linting: Absorb into global config when possible
/* jshint
 unused: true,
 eqeqeq: true,
 maxlen: 120
 */
var ToggleButton = require('./ToggleButton.jsx');

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
