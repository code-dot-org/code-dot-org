/** @file Button that can be active or inactive, for use inside ToggleGroup */
// Strict linting: Absorb into global config when possible
/* jshint
 unused: true,
 eqeqeq: true,
 maxlen: 120
 */

var ToggleButton = React.createClass({
  propTypes: {
    id: React.PropTypes.string,
    style: React.PropTypes.object,
    onClick: React.PropTypes.func.isRequired
  },

  render: function () {
    return (
        <button
            id={this.props.id}
            style={this.props.style}
            className='no-outline'
            onClick={this.props.onClick}>
          {this.props.children}
        </button>
    );
  }
});
module.exports = ToggleButton;
