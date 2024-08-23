/** @file Component wrapping embedded Piskel editor */
import PiskelApi from '@code-dot-org/piskel';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import harness from '@cdo/apps/lib/util/harness';

import {editAnimation, removePendingFramesAction} from '../redux/animationList';
import {show, Goal} from '../redux/animationPicker';
import * as shapes from '../shapes';
/**
 * @const {string} domain-relative URL to Piskel index.html
 * In special environment builds, append ?debug flag to get Piskel to load its own debug mode.
 */
const PISKEL_PATH =
  '/blockly/js/piskel/index.html' + (PISKEL_DEVELOPMENT_MODE ? '?debug' : '');

/**
 * The PiskelEditor component is a wrapper for the iframe that contains the
 * embedded Piskel image editor, within the animation tab.  It handles rendering
 * (and never re-rendering!) that iframe, and sending state updates to the
 * iframe.
 */
class PiskelEditor extends React.Component {
  static propTypes = {
    // Provided manually
    style: PropTypes.object,
    // Provided by Redux
    animationList: shapes.AnimationList.isRequired,
    currentAnimation: shapes.AnimationKey,
    channelId: PropTypes.string,
    editAnimation: PropTypes.func.isRequired,
    allAnimationsSingleFrame: PropTypes.bool.isRequired,
    onNewFrameClick: PropTypes.func.isRequired,
    pendingFrames: PropTypes.object,
    removePendingFrames: PropTypes.func.isRequired,
    isBlockly: PropTypes.bool,
    localeCode: PropTypes.string,
  };

  componentDidMount() {
    /**
     * @private {boolean} Tracks whether Piskel can receive API messages yet.
     */
    this.isPiskelReady_ = false;

    /**
     * @private {boolean} Track whether we're mid-load so we don't fire save
     *          events during load.
     */
    this.isLoadingAnimation_ = false;

    /**
     * @private {AnimationKey} reference to animation that is currently loaded
     *          in the editor.
     */
    this.loadedAnimation_ = null;

    /**
     * @private {boolean} Tracks whether we have logged a Firehose event yet.
     * - The Piskel editor saves continuously, so we only want to log the first
     * event to Firehose.
     */
    this.hasLoggedFirehoseEvent_ = false;

    this.piskel = new PiskelApi();
    this.piskel.attachToPiskel(this.iframe);
    this.piskel.onPiskelReady(this.onPiskelReady);
    this.piskel.onStateSaved(this.onAnimationSaved);
    this.piskel.onAddFrame(this.onAddFrame);

    this.iframe.contentWindow.piskel_locale = this.props.localeCode;
  }

  componentWillUnmount() {
    this.piskel.detachFromPiskel();
    this.piskel = undefined;
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    if (newProps.currentAnimation !== this.props.currentAnimation) {
      this.loadSelectedAnimation_(newProps);
    }
    if (
      newProps.pendingFrames &&
      newProps.currentAnimation === newProps.pendingFrames.key
    ) {
      this.sendPendingFramesToPiskel(newProps.pendingFrames);
    }
  }

  sendPendingFramesToPiskel(animationProps) {
    const {currentAnimation: key} = this.props;
    if (!animationProps) {
      throw new Error('No props present for animation with key ' + key);
    }

    this.isLoadingAnimation_ = true;
    if (animationProps.props.blankFrame) {
      this.piskel.addBlankFrame();
      this.isLoadingAnimation_ = false;
      this.props.removePendingFrames();
    } else if (animationProps.loadedFromSource) {
      this.piskel.appendFrames(
        animationProps.loadedProps.dataURI,
        animationProps.props.frameSize.x,
        animationProps.props.frameSize.y,
        () => {
          this.isLoadingAnimation_ = false;
          this.props.removePendingFrames();

          // If the selected animation changed out from under us, load again.
          if (this.props.currentAnimation !== key) {
            this.loadSelectedAnimation_(this.props);
          }
        }
      );
    }
  }

  loadSelectedAnimation_(props) {
    const {currentAnimation: key} = props;
    if (!this.isPiskelReady_) {
      return;
    }

    if (key === this.loadedAnimation_) {
      // I wonder if this is ever valid - like we want to load some external edit?
      return;
    }

    if (!key) {
      // TODO: Put Piskel into a 'nothing-selected' state?
      return;
    }

    if (this.isLoadingAnimation_) {
      return;
    }

    const animationProps = props.animationList.propsByKey[key];
    if (!animationProps) {
      throw new Error('No props present for animation with key ' + key);
    }

    this.isLoadingAnimation_ = true;
    // Special case: When selecting a new, blank animation (one that is 'loaded'
    // but has no loaded content) tell Piskel to create a new animation with
    // its dimensions.
    if (
      animationProps.loadedFromSource &&
      animationProps.sourceUrl === null &&
      animationProps.blob === null &&
      animationProps.dataURI === null
    ) {
      this.piskel.createNewPiskel(
        animationProps.frameSize.x,
        animationProps.frameSize.y,
        animationProps.frameDelay,
        () => {
          this.loadedAnimation_ = key;
          this.isLoadingAnimation_ = false;
        }
      );
    } else {
      this.piskel.loadSpritesheet(
        animationProps.dataURI,
        animationProps.frameSize.x,
        animationProps.frameSize.y,
        animationProps.frameDelay,
        () => {
          this.loadedAnimation_ = key;
          this.isLoadingAnimation_ = false;

          // If the selected animation changed out from under us, load again.
          if (this.props.currentAnimation !== key) {
            this.loadSelectedAnimation_(this.props);
          }
        },
        animationProps.frameCount
      );
    }
  }

  // We are hosting an embedded application in an iframe; we should never try
  // to re-render it.
  shouldComponentUpdate() {
    return false;
  }

  onAddFrame = () => this.props.onNewFrameClick();

  onPiskelReady = () => {
    this.isPiskelReady_ = true;
    if (this.props.isBlockly) {
      this.piskel.restrictTools();
    }
    if (this.props.allAnimationsSingleFrame) {
      this.piskel.toggleFrameColumn(true);
    }
    this.loadSelectedAnimation_(this.props);
  };

  onAnimationSaved = message => {
    if (this.isLoadingAnimation_) {
      return;
    }

    if (!this.hasLoggedFirehoseEvent_) {
      harness.trackAnalytics({
        study: 'animation-library',
        study_group: 'control-2020',
        event: 'asset-editing',
        data_string: this.props.isBlockly ? 'spritelab' : 'gamelab',
      });
      this.hasLoggedFirehoseEvent_ = true;
    }

    this.props.editAnimation(this.loadedAnimation_, {
      blob: message.blob,
      dataURI: message.dataURI,
      sourceSize: {x: message.sourceSizeX, y: message.sourceSizeY},
      frameSize: {x: message.frameSizeX, y: message.frameSizeY},
      frameCount: message.frameCount,
      frameDelay: message.frameRate,
    });
  };

  render() {
    return (
      <iframe
        ref={iframe => (this.iframe = iframe)}
        style={this.props.style}
        src={PISKEL_PATH}
        title="Piskel"
      />
    );
  }
}
export default connect(
  state => ({
    currentAnimation: state.animationTab.currentAnimations[state.interfaceMode],
    animationList: state.animationList,
    channelId: state.pageConstants.channelId,
    allAnimationsSingleFrame: !!state.pageConstants.allAnimationsSingleFrame,
    pendingFrames: state.animationList.pendingFrames,
    isBlockly: state.pageConstants.isBlockly,
    localeCode: state.locales.localeCode,
  }),
  dispatch => ({
    editAnimation: (key, props) => dispatch(editAnimation(key, props)),
    onNewFrameClick() {
      dispatch(show(Goal.NEW_FRAME));
    },
    removePendingFrames() {
      dispatch(removePendingFramesAction());
    },
  })
)(PiskelEditor);
