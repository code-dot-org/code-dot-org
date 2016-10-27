/**
 * Simple img replacement that fades in upon load.
 * Based on http://buildwithreact.com/article/fade-in-image-recipe
 */

import React from 'react';
import ReactDOM from 'react-dom';

const Image = React.createClass({
  getInitialState: function () {
    return {
      loaded: false
    };
  },

  onImageLoad: function () {
    this.setState({ loaded: true });
  },

  componentDidMount: function () {
    const imgTag = ReactDOM.findDOMNode(this.refs.img);
    const imgSrc = imgTag.getAttribute('src');
    const img = new window.Image();
    img.onload = this.onImageLoad;
    img.src = imgSrc;
  },

  render: function () {
    const {...props} = this.props;
    const rootClassName = 'image ' + (this.state.loaded ? 'image-loaded' : '');
    return (
      <img ref="img" {...props} className={rootClassName} />
    );
  }
});

export default Image;
