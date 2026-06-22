/** Animation or Frame thumbnail */
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import AnimationPreview from '../AnimationPicker/AnimationPreview';
import {PlayBehavior} from '../constants';
import * as shapes from '../shapes';

const staticStyles = {
  root: {
    position: 'relative',
    imageRendering: 'pixelated',
    backgroundColor: 'white',
    borderRadius: 10,
    marginLeft: 4,
    marginRight: 4,
  },
  wrapper: {
    position: 'relative',
    margin: 4,
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
    border: 'solid var(--borders-brand-purple-primary) 2px',
    backgroundColor: 'var(--background-neutral-white-fixed)',
  },
  indexBubbleText: {
    margin: 2,
    fontWeight: 'bold',
    fontSize: 16,
    color: 'var(--text-brand-purple-primary)',
  },
};

/**
 * Animation or Frame thumbnail.
 */
export default class ListItemThumbnail extends React.Component {
  static propTypes = {
    animationProps: shapes.AnimationProps.isRequired,
    singleFrameAnimation: PropTypes.bool.isRequired,
    index: PropTypes.number,
    isSelected: PropTypes.bool,
    isFocused: PropTypes.bool,
  };

  state = {previewSize: 0};

  componentDidMount() {
    this.recalculatePreviewSize();
  }

  /** @public */
  forceResize = () => this.recalculatePreviewSize();

  recalculatePreviewSize() {
    this.setState({
      previewSize: this.refs.wrapper.getBoundingClientRect().width,
    });
  }

  getIndexBubble() {
    if (typeof this.props.index === 'undefined') {
      return undefined;
    }

    return (
      <div style={staticStyles.indexBubble}>
        <div style={staticStyles.indexBubbleText}>{this.props.index}</div>
      </div>
    );
  }

  render() {
    const styles = _.merge({}, staticStyles, {
      root: {
        border:
          'solid 2px ' +
          (this.props.isSelected
            ? 'var(--borders-brand-purple-primary)'
            : 'var(--borders-neutral-primary)'),
      },
    });

    let playBehavior;
    if (this.props.singleFrameAnimation) {
      playBehavior = PlayBehavior.NEVER_PLAY;
    } else if (this.props.isSelected) {
      playBehavior = PlayBehavior.ALWAYS_PLAY;
    }

    return (
      <div style={styles.root}>
        <div ref="wrapper" style={styles.wrapper}>
          <AnimationPreview
            animationProps={this.props.animationProps}
            sourceUrl={this.props.animationProps.dataURI}
            width={this.state.previewSize}
            height={this.state.previewSize}
            playBehavior={playBehavior}
            isFocused={this.props.isFocused}
          />
          {this.getIndexBubble()}
        </div>
      </div>
    );
  }
}
