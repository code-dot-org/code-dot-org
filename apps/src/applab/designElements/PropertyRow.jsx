var React = require('react');

var PropertyRow = React.createClass({
  propTypes: {
    initialValue: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]).isRequired,
    // TODO (brent) another option instead of toggles would be different types
    // of property row (text/color picker/image chooser/etc)
    hasColorPicker: React.PropTypes.bool,
    hasImageChooser: React.PropTypes.bool,
    handleChange: React.PropTypes.func
  },

  getInitialState: function () {
    return {
      value: this.props.initialValue
    };
  },

  handleChangeInternal: function(event) {
    var value = event.target.value;
    this.props.handleChange(value);
    this.setState({value: value});
  },
  
  render: function() {
    var colorPicker, imageChooser;
    if (this.props.hasColorPicker) {
      colorPicker = <div>PICK_COLOR</div>
    }

    if (this.props.imageChooser) {
      imageChooser = <div>Choose...</div>
    }

    return (
      <tr>
        <td>{this.props.desc}</td>
        <td>
          <input
            value={this.state.value}
            onChange={this.handleChangeInternal}/>
          {colorPicker}
          {imageChooser}
        </td>
      </tr>
    );
  }
});

module.exports = PropertyRow;
