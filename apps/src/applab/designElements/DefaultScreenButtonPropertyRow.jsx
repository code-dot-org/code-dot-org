var color = require('../../color');
var rowStyle = require('./rowStyle');
var elementUtils = require('./elementUtils');

var DefaultScreenButtonPropertyRow = React.createClass({
  handleMakeDefault: function (event) {
    this.props.handleChange(true);
  },

  render: function () {
    if (elementUtils.getId(elementUtils.getScreens()[0]) === this.props.screenId) {
      return false;
    }

    var buttonStyle = {
      paddingTop: '5px',
      paddingBottom: '5px',
      fontSize: '14px',
    };

    var defaultButtonStyle = $.extend({}, buttonStyle, {
      backgroundColor: '#0aa',
      color: color.white
    });
    
    return (
      <div style={{marginLeft: 15}}>
        <button
        style={defaultButtonStyle}
        onClick={this.handleMakeDefault}>
        Make Default
      </button>
    </div>
    );
  }
});

module.exports = DefaultScreenButtonPropertyRow;