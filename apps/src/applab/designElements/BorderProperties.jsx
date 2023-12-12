import React from 'react';
import PropTypes from 'prop-types';
import applabMsg from '@cdo/applab/locale';
import PropertyRow from './PropertyRow';
import ColorPickerPropertyRow from './ColorPickerPropertyRow';

export default class BorderProperties extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleBorderWidthChange: PropTypes.func.isRequired,
    handleBorderColorChange: PropTypes.func.isRequired,
    handleBorderRadiusChange: PropTypes.func.isRequired,
  };

  render() {
    const {
      element,
      handleBorderWidthChange,
      handleBorderColorChange,
      handleBorderRadiusChange,
    } = this.props;

    return (
      <div>
        <PropertyRow
          desc={applabMsg.designElementProperty_borderWidthPx()}
          isNumber
          initialValue={parseInt(element.style.borderWidth, 10)}
          handleChange={handleBorderWidthChange}
        />
        <ColorPickerPropertyRow
          desc={applabMsg.designElementProperty_borderColor()}
          initialValue={element.style.borderColor}
          handleChange={handleBorderColorChange}
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_borderRadiusPx()}
          isNumber
          initialValue={parseInt(element.style.borderRadius, 10)}
          handleChange={handleBorderRadiusChange}
        />
      </div>
    );
  }
}
