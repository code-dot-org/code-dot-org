var React = require('react');
var msg = require('../locale');

var Mode = {
  CODE: 'CODE',
  DESIGN: 'DESIGN'
};

module.exports = React.createClass({
  propTypes: {
    screens: React.PropTypes.array.isRequired,
    onDesignModeButton: React.PropTypes.func.isRequired,
    onCodeModeButton: React.PropTypes.func.isRequired
  },


  getInitialState: function () {
    return {
      mode: Mode.CODE
    };
  },

  handleModeToggle: function () {
    var newMode;
    if (this.state.mode === Mode.DESIGN) {
      this.props.onCodeModeButton();
      newMode = Mode.CODE;
    } else {
      this.props.onDesignModeButton();
      newMode = Mode.DESIGN;
    }

    this.setState({
      mode: newMode
    });
  },

  render: function () {
    var selectDropdown;
    var dropdownStyle = {
      width: 140,
      marginLeft: 10
    };

    if (this.state.mode === Mode.DESIGN) {
      var options = this.props.screens.map(function (item) {
        return <option>{item}</option>;
      });

      selectDropdown = (
        <select id="screenSelector" style={dropdownStyle}>
          {options}
        </select>
      );
    }

    return (
      <div>
        <button
          id="designModeToggle"
          className="share"
          onClick={this.handleModeToggle}>
          { this.state.mode === Mode.DESIGN ? msg.codeMode() : msg.designMode() }
        </button>
        {selectDropdown}
      </div>
    );
  }
});
