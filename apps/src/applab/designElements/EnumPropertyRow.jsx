var rowStyle = require('./rowStyle');

var EnumPropertyRow = React.createClass({
  propTypes: {
    initialValue: React.PropTypes.string.isRequired,
    options: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    handleChange: React.PropTypes.func.isRequired,
  },

  getInitialState: function () {
    return {
      selectedValue: this.props.initialValue
    };
  },

  handleChange: function (event) {
    this.props.handleChange(event.target.value);
    this.setState({selectedValue: event.target.value});
  },

  render: function () {
    let options = this.props.options.map(function(option, index) {
        return <option key={index} value={option}>{option}</option>;
    });
    return (
      <div style={rowStyle.container}>
        <div style={rowStyle.description}>{this.props.desc}</div>
        <select className="form-control"
                value={this.state.selectedValue}
                onChange={this.handleChange}>
          {options}
        </select>
      </div>
    );
  }
});

module.exports = EnumPropertyRow;
