import React, {PropTypes} from 'react';
import color from "../../util/color";
import * as elementUtils from './elementUtils';

export default class DefaultScreenButtonPropertyRow extends React.Component {
  static propTypes = {
    handleChange: PropTypes.func.isRequired,
    screenId: PropTypes.string
  };

  handleMakeDefault = (event) => this.props.handleChange(true);

  render() {
    if (elementUtils.getId(elementUtils.getScreens()[0]) === this.props.screenId) {
      return false;
    }

    const buttonStyle = {
      paddingTop: '5px',
      paddingBottom: '5px',
      fontSize: '14px',
    };

    const defaultButtonStyle = Object.assign({}, buttonStyle, {
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
}
