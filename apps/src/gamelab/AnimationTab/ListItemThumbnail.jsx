/** Animation or Frame thumbnail */
'use strict';

import React from 'react';
import _ from '../../lodash';
import color from '../../color';
import { getSourceUrl, METADATA_SHAPE } from '../animationMetadata';
import AnimationPreview from '../AnimationPicker/AnimationPreview';

const staticStyles = {
  root: {
    position: 'relative',
    imageRendering: 'pixelated',
    backgroundColor: 'white',
    borderRadius: 9,
    marginLeft: 4,
    marginRight: 4
  },
  wrapper: {
    position: 'relative',
    margin: 4
  },
  indexBubble: {
    position: 'absolute',
    top: 0,
    left: 0,
    minWidth: 20,
    height: 20,
    overflow: 'hidden',
    borderRadius: 12,
    textAlign: 'center',
    border: 'solid ' + color.light_purple + ' 2px',
    backgroundColor: color.white
  },
  indexBubbleText: {
    margin: 2,
    fontWeight: 'bold',
    fontSize: 16,
    color: color.light_purple
  }
};

/**
 * Animation or Frame thumbnail.
 */
const ListItemThumbnail = React.createClass({
  propTypes: {
    animation: React.PropTypes.shape(METADATA_SHAPE).isRequired,
    index: React.PropTypes.number,
    isSelected: React.PropTypes.bool
  },

  getInitialState() {
    return {
      previewSize: 0
    };
  },

  componentDidMount() {
    this.recalculatePreviewSize();
  },

  /** @public */
  forceResize() {
    this.recalculatePreviewSize();
  },

  recalculatePreviewSize() {
    this.setState({
      previewSize: this.refs.wrapper.getBoundingClientRect().width
    });
  },

  getIndexBubble() {
    if (typeof this.props.index === 'undefined') {
      return undefined;
    }

    return (
      <div style={staticStyles.indexBubble}>
        <div style={staticStyles.indexBubbleText}>{this.props.index}</div>
      </div>
    );
  },

  render() {
    var styles = _.merge({}, staticStyles, {
      root: {
        border: 'solid 2px ' + (this.props.isSelected ? color.purple : color.light_purple)
      }
    });

    return (
      <div style={styles.root}>
        <div ref="wrapper" style={styles.wrapper}>
          <AnimationPreview
              animation={this.props.animation}
              width={this.state.previewSize}
              height={this.state.previewSize}
          />
          {this.getIndexBubble()}
        </div>
      </div>
    );
  }
});
export default ListItemThumbnail;
