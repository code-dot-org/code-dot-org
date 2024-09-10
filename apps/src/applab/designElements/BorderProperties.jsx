import PropTypes from 'prop-types';
import React from 'react';

import applabMsg from '@cdo/applab/locale';

import ColorPickerPropertyRow from './ColorPickerPropertyRow';
import PropertyRow from './PropertyRow';

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
