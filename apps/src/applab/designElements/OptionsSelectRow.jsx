var React = require('react');

var OptionsSelectRow = React.createClass({
  propTypes: {
    element: React.PropTypes.instanceOf(HTMLSelectElement).isRequired,
    handleChange: React.PropTypes.func
  },

  getInitialState: function () {
    // Pull the text out of each of our child option elements
    var element = this.props.element;
    value = '';
    for (var i = 0; i < element.children.length; i++) {
      value += element.children[i].textContent + '\n';
    }
    return {
      value: value
    }
  },

  handleChangeInternal: function(event) {
    var value = event.target.value;
    // Extract an array of text values, 1 per line
    var optionList = value.split('\n').filter(function (val) {
      return val !== '';
    });
    this.props.handleChange(optionList);
    this.setState({value: value});
  },

  render: function() {
    return (
      <tr>
        <td>{this.props.desc}</td>
        <td>
          <textarea
            onChange={this.handleChangeInternal}
            value={this.state.value}/>
        </td>
      </tr>
    );
  }
});

module.exports = OptionsSelectRow;
