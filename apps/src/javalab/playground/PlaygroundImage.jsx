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
    return dynamicStyles;
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
