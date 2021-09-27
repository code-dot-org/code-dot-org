import React from 'react';
import PropTypes from 'prop-types';

export default class PlaygroundImage extends React.Component {
  constructor(props) {
    super(props);
  }
  static propTypes = {
    fileUrl: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    x: PropTypes.string.isRequired,
    y: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    width: PropTypes.string.isRequired,
    index: PropTypes.string.isRequired,
    isClickable: PropTypes.bool.isRequired,
    onClick: PropTypes.func
  };

  getDynamicStyles() {
    const {x, y, height, width, index} = this.props;
    // coordinates come to us in a 400x400 image size,
    // but we use 800x800 on the frontend to allow for higher
    // resolution screens. Therefore we need to scale up the
    // coordinates by 2.
    const dynamicStyles = {zIndex: index};
    const xAdjusted = x * 2;
    const yAdjusted = y * 2;
    const widthAdjusted = width * 2;
    const heightAdjusted = height * 2;
    dynamicStyles.width = widthAdjusted;
    dynamicStyles.height = heightAdjusted;
    dynamicStyles.marginTop = yAdjusted;
    dynamicStyles.marginLeft = xAdjusted;
    dynamicStyles.clipPath = `inset(0 ${this.getClipPath(
      widthAdjusted,
      xAdjusted
    )} ${this.getClipPath(heightAdjusted, yAdjusted)} 0)`;
    return dynamicStyles;
  }

  // If the image would go outside of the 800x800 box we put playground
  // into, cut it off at the appropriate dimension. This will crop any images
  // that go outside of the box, which is our expected behavior.
  getClipPath(dimension, coordinate) {
    return dimension + coordinate > 800
      ? `${dimension + coordinate - 800}px`
      : 0;
  }

  render() {
    const {fileUrl, id, onClick, isClickable} = this.props;
    let dynamicStyles = this.getDynamicStyles();
    if (isClickable) {
      dynamicStyles = {...dynamicStyles, ...styles.clickableImage};
    }
    return (
      <img
        src={fileUrl}
        style={{...dynamicStyles, ...styles.image}}
        id={id}
        onClick={isClickable ? onClick : undefined}
      />
    );
  }
}

const styles = {
  image: {
    position: 'absolute'
  },
  clickableImage: {
    cursor: 'pointer'
  }
};
