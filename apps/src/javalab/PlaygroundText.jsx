import React from 'react';
import PropTypes from 'prop-types';

export default class PlaygroundText extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    x: PropTypes.string.isRequired,
    y: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    index: PropTypes.string.isRequired,
    rotation: PropTypes.string.isRequired,
    red: PropTypes.string.isRequired,
    blue: PropTypes.string.isRequired,
    green: PropTypes.string.isRequired,
    fontFamily: PropTypes.string.isRequired,
    fontStyle: PropTypes.string.isRequired
  };

  render() {
    const fontFamilyMap = {
      SANS: 'sans-serif',
      SERIF: 'serif',
      MONO: 'monospace'
    };

    const {
      id,
      text,
      x,
      y,
      height,
      index,
      rotation,
      red,
      blue,
      green,
      fontFamily,
      fontStyle
    } = this.props;
    console.log(rotation);
    // what to do with overflow text?
    const dynamicStyle = {
      left: x * 2,
      top: y * 2,
      zIndex: index,
      height: parseInt(height) * 2,
      fontSize: parseInt(height) * 2,
      fontFamily: fontFamilyMap[fontFamily],
      color: `rgb(${parseInt(red)}, ${parseInt(green)}, ${parseInt(blue)})`,
      transformOrigin: 'top left',
      transform: `rotate(${parseFloat(rotation)}deg)`
    };

    if (fontStyle === 'BOLD' || fontStyle === 'BOLD_ITALIC') {
      dynamicStyle.fontWeight = 'bold';
    }
    if (fontStyle === 'ITALIC' || fontStyle === 'BOLD_ITALIC') {
      dynamicStyle.fontStyle = 'italic';
    }

    return (
      <span style={{...dynamicStyle, ...styles.textStyle}} id={id}>
        {text}
      </span>
    );
  }
}

const styles = {
  textStyle: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center'
  }
};
