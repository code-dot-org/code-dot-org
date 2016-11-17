/**
 * Simple img replacement that fades in upon load.
 * Based on http://buildwithreact.com/article/fade-in-image-recipe
 */

import React from 'react';
import ReactDOM from 'react-dom';

const Image = React.createClass({
  propTypes: {
    src: React.PropTypes.string.isRequired,
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

    const styleProps = Object.assign({}, this.props.style, style);

    return (
      <img
        ref="img"
        src={this.props.src}
        style={styleProps}
        onLoad={this.onImageLoad}
      />
    );
  }
});

export default Image;
