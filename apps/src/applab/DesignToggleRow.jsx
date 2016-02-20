// Strict linting: Absorb into global config when possible
/* jshint
 unused: true,
 eqeqeq: true,
 maxlen: 120
 */
/* global $ */

var msg = require('../locale');
var applabMsg = require('./locale');
var constants = require('./constants');
var elementUtils = require('./designElements/elementUtils');
var styles = require('./DesignToggleRowStyles');

var Mode = {
  CODE: 'CODE',
  DESIGN: 'DESIGN'
};

var DesignToggleRow = React.createClass({
  propTypes: {
    hideToggle: React.PropTypes.bool.isRequired,
    hideViewDataButton: React.PropTypes.bool.isRequired,
    startInDesignMode: React.PropTypes.bool.isRequired,
    initialScreen: React.PropTypes.string.isRequired,
    screenIds: React.PropTypes.array.isRequired,
    onDesignModeButton: React.PropTypes.func.isRequired,
    onCodeModeButton: React.PropTypes.func.isRequired,
    onViewDataButton: React.PropTypes.func.isRequired,
    onScreenChange: React.PropTypes.func.isRequired,
    onScreenCreate: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      mode: this.props.startInDesignMode ? Mode.DESIGN :  Mode.CODE,
      activeScreen: null
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
    if (screenId === constants.NEW_SCREEN) {
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
      width: '100%',
      height: 28,
      marginBottom: 6,
      borderColor: '#949ca2'
    };

    var showDataButtonStyle = $.extend(
      {
        float: 'right',
        textAlign: 'left',
        maxWidth: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      },
      styles.buttonStyle,
      styles.inactiveStyle,
      this.props.hideViewDataButton ? styles.hiddenStyle : null
    );
    var iconStyle = {
      margin: '0 0.3em'
    };

    if (this.state.mode === Mode.CODE) {
      showDataButton = (
        <button
            id='viewDataButton'
            style={showDataButtonStyle}
            className='no-outline'
            onClick={this.props.onViewDataButton}>
          <i className='fa fa-database' style={iconStyle}></i>
          {applabMsg.viewData()}
        </button>
      );
    } else if (this.state.mode === Mode.DESIGN) {
      var options = this.props.screenIds.map(function (item) {
        return <option key={item}>{item}</option>;
      });

      var defaultScreenId = elementUtils.getScreens().first().attr('id') || '';

      options.sort(function (a, b) {
        if (a.key === defaultScreenId) {
          return -1;
        } else if (b.key === defaultScreenId) {
          return 1;
        } else {
          return a.key.localeCompare(b.key);
        }
      });

      selectDropdown = (
        <select
          id="screenSelector"
          style={dropdownStyle}
          value={this.state.activeScreen}
          onChange={this.handleScreenChange}
          disabled={Applab.isRunning()}>
          {options}
          <option>{constants.NEW_SCREEN}</option>
        </select>
      );
    }

    return (
      <table style={{width: '100%'}}>
        <tbody>
          <tr>
            <td style={{width: '120px'}}>
              <button
                  id='codeModeButton'
                  style={$.extend({}, styles.codeButtonStyle,
                      this.state.mode === Mode.CODE ? styles.activeStyle : styles.inactiveStyle,
                      this.props.hideToggle ? styles.hiddenStyle : null)}
                  className='no-outline'
                  onClick={this.handleSetMode.bind(this, Mode.CODE)}>
                {msg.codeMode()}
              </button>
              <button
                  id='designModeButton'
                  style={$.extend({}, styles.designButtonStyle,
                      this.state.mode === Mode.DESIGN ? styles.activeStyle : styles.inactiveStyle,
                      this.props.hideToggle ? styles.hiddenStyle : null)}
                  className='no-outline'
                  onClick={this.handleSetMode.bind(this, Mode.DESIGN)}>
                {msg.designMode()}
              </button>
            </td>
            <td style={{maxWidth: 0}}>
              {selectDropdown}
              {showDataButton}
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
});
module.exports = DesignToggleRow;
