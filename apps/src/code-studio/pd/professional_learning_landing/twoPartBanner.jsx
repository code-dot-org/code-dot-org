/** Two section banner for the landing page */

import React from 'react';

const styles = {
  container: {
    display: 'table',
    tableLayout: 'fixed',
    height: '240px',
    width: '100%',
  },

  image: {
    display: 'table-cell',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundColor: 'white',
    height: '100%',
    border: '1px solid black',
    boxSizing: 'border-box',
  },

  text: {
    display: 'table-cell',
    fontSize: '24px',
    backgroundColor: '#00adbc',
    color: 'white',
    padding: '20px'
  },

  left: {
    borderTopLeftRadius: '10px',
    borderBottomLeftRadius: '10px',
  },

  right: {
    borderTopRightRadius: '10px',
    borderBottomRightRadius: '10px',
  }
};

const TwoPartBanner = React.createClass({
  propTypes: {
    textElement: React.PropTypes.element.isRequired,
    imageUrl: React.PropTypes.string.isRequired,
    imagePosition: React.PropTypes.oneOf(['imageLeft', 'imageRight']).isRequired
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
      <div key="image" style={appliedImageStyle}/>
    );
    const textElement = React.cloneElement(this.props.textElement, {key: 'text', style: appliedTextStyle});

    return this.props.imagePosition === 'imageLeft' ? [imageElement, textElement] : [textElement, imageElement];
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
