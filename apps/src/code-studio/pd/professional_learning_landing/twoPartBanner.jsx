/** Two section banner for the landing page */

import React from 'react';

const containerStyle = {
  display: 'flex',
  height: '240px',
  width: '100%',
};

const imageStyle = {
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  backgroundColor: 'white',
  height: '100%',
  border: '1px solid black',
  boxSizing: 'border-box',
};

const textStyle = {
  fontSize: '24px',
  backgroundColor: '#00adbc',
  color: 'white',
  padding: '20px'
};

const leftStyle = {
  width: '50%',
  maxWidth: '50%',
  float: 'left',
  borderTopLeftRadius: '10px',
  borderBottomLeftRadius: '10px',
};

const rightStyle = {
  width: '50%',
  maxWidth: '50%',
  float: 'left',
  borderTopRightRadius: '10px',
  borderBottomRightRadius: '10px',
};

const TwoPartBanner = React.createClass({
  propTypes: {
    leftHalf: React.PropTypes.element.isRequired,
    rightHalf: React.PropTypes.element.isRequired
  },

  render() {
    return (
      <div style={containerStyle}>
        {this.props.leftHalf}
        {this.props.rightHalf}
      </div>
    );
  }
});

export {TwoPartBanner, imageStyle, textStyle, leftStyle, rightStyle};
