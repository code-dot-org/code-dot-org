/** Two section banner for the landing page */

import React, {PropTypes} from 'react';

const styles = {
  container: {
    display: 'flex',
    height: '240px',
    width: '100%',
  },

  image: {
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundColor: 'white',
    height: '100%',
    border: '1px solid black',
    boxSizing: 'border-box',
    flex: 1
  },

  text: {
    fontSize: '24px',
    backgroundColor: '#00adbc',
    color: 'white',
    flex: 1
  },

  left: {
    borderTopLeftRadius: '10px',
    borderBottomLeftRadius: '10px',
    flexBasis: 0,
    flexGrow: 1
  },

  right: {
    borderTopRightRadius: '10px',
    borderBottomRightRadius: '10px',
    flexBasis: 0,
    flexGrow: 1
  }
};

const TwoPartBanner = React.createClass({
  propTypes: {
    textElement: PropTypes.element.isRequired,
    imageUrl: PropTypes.string.isRequired,
    imagePosition: PropTypes.oneOf(['imageLeft', 'imageRight']).isRequired
  },

  getImageAlignmentStyle() {
    return this.props.imagePosition === 'imageLeft' ? styles.left : styles.right;
  },

  getTextAlignmentStyle() {
    return this.props.imagePosition === 'imageLeft' ? styles.right : styles.left;
  },

  renderInterior() {
    const appliedImageStyle = {
      ...styles.image,
      backgroundImage: this.props.imageUrl,
      ...this.getImageAlignmentStyle()
    };

    const appliedTextStyle = {
      ...styles.text,
      ...this.getTextAlignmentStyle()
    };

    const imageElement = (
      <div key="image" style={appliedImageStyle}>
        &nbsp;
      </div>
    );
    const textElement = React.cloneElement((this.props.textElement), {style: {padding: '20px'}});

    const wrappedTextElement = (
      <div key="textElement" style={appliedTextStyle}>
        {textElement}
      </div>
    );

    return this.props.imagePosition === 'imageLeft' ? [imageElement, wrappedTextElement] : [wrappedTextElement, imageElement];
  },

  render() {
    return (
      <div style={styles.container}>
        {this.renderInterior()}
      </div>
    );
  }
});

export {TwoPartBanner};
