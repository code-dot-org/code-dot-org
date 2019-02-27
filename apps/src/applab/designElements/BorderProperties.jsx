import React, {PropTypes} from 'react';
import PropertyRow from './PropertyRow';
import ColorPickerPropertyRow from './ColorPickerPropertyRow';
import * as elementUtils from './elementUtils';
import * as rowStyle from './rowStyle';

export default class BorderProperties extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleBorderWidthChange: PropTypes.func.isRequired,
    handleBorderColorChange: PropTypes.func.isRequired,
    handleBorderRadiusChange: PropTypes.func.isRequired
  };

  render() {
    const {
      element,
      handleBorderWidthChange,
      handleBorderColorChange,
      handleBorderRadiusChange
    } = this.props;

    return (
      <div style={rowStyle.wrapperContainer}>
        <PropertyRow
          desc={'border width (px)'}
          isNumber
          initialValue={parseInt(element.style.borderWidth, 10)}
          handleChange={handleBorderWidthChange}
        />
        <ColorPickerPropertyRow
          desc={'border color'}
          initialValue={elementUtils.rgb2hex(element.style.borderColor)}
          handleChange={handleBorderColorChange}
        />
        <PropertyRow
          desc={'border radius (px)'}
          isNumber
          initialValue={parseInt(element.style.borderRadius, 10)}
          handleChange={handleBorderRadiusChange}
        />
      </div>
    );
  }
}
