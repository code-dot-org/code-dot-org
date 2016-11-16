/**
 * Simple img replacement that fades in upon load.
 * Based on http://buildwithreact.com/article/fade-in-image-recipe
 */

import React from 'react';
import ReactDOM from 'react-dom';

const Image = React.createClass({
  getInitialState() {
    return {
      loaded: false
    };
  },

  onImageLoad() {
    this.setState({ loaded: true });
  },

  componentDidMount() {
    const imgTag = ReactDOM.findDOMNode(this.refs.img);
    const imgSrc = imgTag.getAttribute('src');
    const img = new window.Image();
    img.src = imgSrc;
  },

  render() {
    const rootClassName = 'image ' + (this.state.loaded ? 'image-loaded' : '');
    return (
      <img
        ref="img"
        {...this.props}
        className={rootClassName}
        onLoad={this.onImageLoad}
      />
    );
  }
});

export default Image;
