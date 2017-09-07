import React, {PropTypes} from 'react';
import color from "../../util/color";
import * as elementUtils from './elementUtils';

var DefaultScreenButtonPropertyRow = React.createClass({
  propTypes: {
    handleChange: PropTypes.func.isRequired,
    screenId: PropTypes.string
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
