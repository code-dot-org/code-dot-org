/* global $ */
var rowStyle = require('./rowStyle');

var OptionsSelectRow = React.createClass({
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLSelectElement).isRequired,
    handleChange: React.PropTypes.func
  },

  getInitialState: function () {
    // Pull the text out of each of our child option elements
    var element = this.props.element;
    var value = '';
    for (var i = 0; i < element.children.length; i++) {
      value += element.children[i].textContent + '\n';
    }
    return {
      value: value
    };
  },

  handleChangeInternal: function (event) {
    var value = event.target.value;
    // Extract an array of text values, 1 per line
    var optionList = value.split('\n').filter(function (val) {
      return val !== '';
    });
    this.props.handleChange(optionList);
    this.setState({value: value});
  },

  render: function () {
    var textAreaStyle = $.extend({}, rowStyle.input, {
      height: 40
    });
    return (
      <div style={rowStyle.container}>
        <div style={rowStyle.description}>{this.props.desc}</div>
        <div>
          <textarea
            onChange={this.handleChangeInternal}
            value={this.state.value}
            style={textAreaStyle} />
        </div>
      </div>
    );
  }
});

module.exports = OptionsSelectRow;
