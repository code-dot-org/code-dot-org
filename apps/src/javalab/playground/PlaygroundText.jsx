import React from 'react';
import PropTypes from 'prop-types';
import {
  PlaygroundFontStyleType,
  PlaygroundFontTypeFontFamilies
} from '../constants';

export default class PlaygroundText extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    x: PropTypes.string.isRequired,
    y: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    index: PropTypes.string.isRequired,
    rotation: PropTypes.string.isRequired,
    colorRed: PropTypes.string.isRequired,
    colorGreen: PropTypes.string.isRequired,
    colorBlue: PropTypes.string.isRequired,
    font: PropTypes.string.isRequired,
    fontStyle: PropTypes.string.isRequired
  };

  getDynamicStyles() {
    const {
      x,
      y,
      height,
      index,
      rotation,
      colorRed,
      colorGreen,
      colorBlue,
      font,
      fontStyle
    } = this.props;

    const dynamicStyles = {
      left: x * 2,
      top: y * 2,
      zIndex: index,
      color: `rgb(${parseInt(colorRed)}, ${parseInt(colorGreen)}, ${parseInt(
        colorBlue
      )})`,
      transform: `rotate(${parseFloat(rotation)}deg)`,
      fontSize: height * 2,
      fontFamily: PlaygroundFontTypeFontFamilies[font]
    };

    if (
      [
        PlaygroundFontStyleType.BOLD,
        PlaygroundFontStyleType.BOLD_ITALIC
      ].includes(fontStyle)
    ) {
      dynamicStyles.fontWeight = 'bold';
    }
    if (
      [
        PlaygroundFontStyleType.ITALIC,
        PlaygroundFontStyleType.BOLD_ITALIC
      ].includes(fontStyle)
    ) {
      dynamicStyles.fontStyle = 'italic';
    }

    return dynamicStyles;
  }

  render() {
    const {id, text} = this.props;
    const dynamicStyles = this.getDynamicStyles();

    return (
      <span style={{...dynamicStyles, ...styles.textStyle}} id={id}>
        {text}
      </span>
    );
  }
}

const styles = {
  textStyle: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    transformOrigin: 'top left',
    whiteSpace: 'nowrap',
    lineHeight: 1
  }
};
