import React from 'react';
import PropTypes from 'prop-types';
import {PlaygroundFontStyleType, PlaygroundFontType} from './constants';

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
      red,
      blue,
      green,
      font,
      fontStyle
    } = this.props;

    const dynamicStyles = {
      left: x * 2,
      top: y * 2,
      zIndex: index,
      height: height * 2,
      color: `rgb(${parseInt(red)}, ${parseInt(green)}, ${parseInt(blue)})`,
      transform: `rotate(${parseFloat(rotation)}deg)`,
      fontSize: height * 2,
      fontFamily: PlaygroundFontType[font]
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
    transformOrigin: 'top left'
  }
};
