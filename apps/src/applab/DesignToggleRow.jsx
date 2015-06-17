/* global $ */

var React = require('react');
var msg = require('../locale');
var applabMsg = require('./locale');

var NEW_SCREEN = 'New screen...';

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
    onScreenChange: React.PropTypes.func.isRequired,
    onScreenCreate: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      mode: Mode.CODE
    };
  },

  handleSetMode: function (newMode) {
    if (this.state.mode === newMode) {
      return;
    }
    if (newMode === Mode.CODE) {
      this.props.onCodeModeButton();
    } else {
      this.props.onDesignModeButton();
    }

    this.setState({
      mode: newMode
    });
  },

  handleScreenChange: function (evt) {
    var screenId = evt.target.value;
    if (screenId === NEW_SCREEN) {
      screenId = this.props.onScreenCreate();
    }
    this.props.onScreenChange(screenId);
  },

  componentWillReceiveProps: function (newProps) {
    this.setState({ activeScreen: newProps.initialScreen });
  },

  render: function () {
    var showDataButton;
    var selectDropdown;
    var dropdownStyle = {
      display: 'inline-block',
      verticalAlign: 'top',
      width: 130,
      height: 28,
      marginBottom: 6,
      borderColor: '#949ca2'
    };

    var buttonStyle = {
      display: 'inline-block',
      verticalAlign: 'top',
      border: '1px solid #949ca2',
      margin: '0 0 8px 0',
      padding: '2px 6px',
      fontSize: 14
    };
    var buttonPrimary = {
      backgroundColor: '#ffa000',
      color: '#fff'
    };
    var buttonSecondary = {
      backgroundColor: '#e7e8ea',
      color: '#949ca2'
    };

    var codeButtonStyle = $.extend({}, buttonStyle, {
      borderBottomRightRadius: 0,
      borderTopRightRadius: 0,
      borderRightWidth: 0
    }, (this.state.mode === Mode.CODE ? buttonSecondary : buttonPrimary));

    var designButtonStyle = $.extend({}, buttonStyle, {
      borderBottomLeftRadius: 0,
      borderTopLeftRadius: 0
    }, (this.state.mode === Mode.CODE ? buttonPrimary : buttonSecondary));

    var showDataButtonStyle = $.extend({}, buttonStyle, buttonSecondary);

    var iconStyle = {
      margin: '0 0.3em'
    };

    if (this.state.mode === Mode.CODE) {
      showDataButton = (
        <button
            id='viewDataButton'
            style={showDataButtonStyle}
            className='no-outline'>
          <i className='fa fa-database' style={iconStyle}></i>
          {applabMsg.viewData()}
        </button>
      );
    } else if (this.state.mode === Mode.DESIGN) {
      var options = this.props.screens.map(function (item) {
        return <option key={item}>{item}</option>;
      });

      selectDropdown = (
        <select
          id="screenSelector"
          style={dropdownStyle}
          value={this.state.activeScreen}
          onChange={this.handleScreenChange}
          disabled={Applab.isRunning()}>
          {options}
          <option>{NEW_SCREEN}</option>
        </select>
      );
    }

    return (
      <div className="justify-contents">
        <button
            id='codeModeButton'
            style={codeButtonStyle}
            className='no-outline'
            onClick={this.handleSetMode.bind(this, Mode.CODE)}>
          {msg.codeMode()}
        </button>
        <button
            id='designModeButton'
            style={designButtonStyle}
            className='no-outline'
            onClick={this.handleSetMode.bind(this, Mode.DESIGN)}>
          {msg.designMode()}
        </button>
        {' ' /* Needed for "text-align: justify;" to work. */ }
        {selectDropdown}
        {showDataButton}
      </div>
    );
  }
});
