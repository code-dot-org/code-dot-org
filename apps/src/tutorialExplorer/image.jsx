/**
 * Simple img replacement that fades in upon load.
 * Based on http://buildwithreact.com/article/fade-in-image-recipe
 */

import React from 'react';
import ReactDOM from 'react-dom';

const Image = React.createClass({
  propTypes: {
    style: React.PropTypes.object.isRequired
  },

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
    let style;
    if (this.state.loaded) {
      style = {
        opacity: 1,
        transition: "opacity 200ms ease-in"
      };
    } else {
      style = {
        opacity: 0.1
      };
    }

    return (
      <img
        ref="img"
        {...this.props}
        style={{...this.props.style, ...style}}
        onLoad={this.onImageLoad}
      />
    );
  }
});

export default Image;
