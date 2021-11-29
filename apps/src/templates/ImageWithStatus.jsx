import PropTypes from 'prop-types';
import React, {Component} from 'react';

/**
 * @fileoverview Wraps an <img> with a <div> that indicates the status of the
 * image being loaded. The purpose of this is to be able to wait until images
 * have finished loading within tests.
 */

/** @enum {string} */
export const STATUS = {
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error'
};

export class ImageWithStatus extends Component {
  static propTypes = {
    src: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number,
    wrapperStyle: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.handleImageLoad = this.handleImageLoad.bind(this);
    this.handleImageError = this.handleImageError.bind(this);

    this.state = {
      imageStatus: STATUS.LOADING
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.src !== nextProps.src) {
      this.setState({imageStatus: STATUS.LOADING});
    }
  }

  handleImageLoad() {
    this.setState({imageStatus: STATUS.LOADED});
  }

  handleImageError() {
    this.setState({imageStatus: STATUS.ERROR});
  }

  render() {
    return (
      <div style={this.props.wrapperStyle}>
        <img
          src={this.props.src}
          width={this.props.width}
          height={this.props.height}
          onLoad={this.handleImageLoad}
          onError={this.handleImageError}
        />
        <div data-image-status={this.state.imageStatus} />
      </div>
    );
  }
}
