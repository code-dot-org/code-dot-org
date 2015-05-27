var React = require('react');
var msg = require('../locale');

var Mode = {
  CODE: 'CODE',
  DESIGN: 'DESIGN'
};

module.exports = React.createClass({
  propTypes: {
    initialScreen: React.PropTypes.string.isRequired,
    screens: React.PropTypes.array.isRequired,
    onDesignModeButton: React.PropTypes.func.isRequired,
    onCodeModeButton: React.PropTypes.func.isRequired,
    handleManageAssets: React.PropTypes.func.isRequired
    onScreenChange: React.PropTypes.func.isRequired
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

  handleManageAssets: function() {
    this.props.handleManageAssets();
  },

  handleScreenChange: function (evt) {
    this.props.onScreenChange(evt.target.value);
  },

  componentWillReceiveProps: function (newProps) {
    this.setState({ activeScreen: newProps.initialScreen });
  },

  render: function () {
    var selectDropdown;
    var dropdownStyle = {
      width: 140,
      marginLeft: 10
    };

    if (this.state.mode === Mode.DESIGN) {
      var options = this.props.screens.map(function (item) {
        return <option key={item}>{item}</option>;
      });

      selectDropdown = (
        <select
          id="screenSelector"
          style={dropdownStyle}
          value={this.state.activeScreen}
          onChange={this.handleScreenChange}>
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
        <button
          id="design-manage-assets"
          className="share"
          onClick={this.handleManageAssets}
          style={{
            display: this.state.mode === Mode.DESIGN ? 'inline-block' : 'none',
            marginLeft: 10
          }}>
          Manage Assets
        </button>
        {selectDropdown}
      </div>
    );
  }
});
