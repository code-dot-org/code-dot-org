import React from 'react';
import color from '../../color';
import * as rowStyle from './rowStyle';
import * as elementUtils from './elementUtils';

var DefaultScreenButtonPropertyRow = React.createClass({
  propTypes: {
    handleChange: React.PropTypes.func.isRequired,
    screenId: React.PropTypes.string
  },

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

    var defaultButtonStyle = Object.assign({}, buttonStyle, {
      backgroundColor: '#0aa',
      color: color.white
    });

    return (
      <div style={{marginLeft: 15}}>
        <button
          style={defaultButtonStyle}
          onClick={this.handleMakeDefault}
        >
        Make Default
      </button>
    </div>
    );
  }
});

export default DefaultScreenButtonPropertyRow;
