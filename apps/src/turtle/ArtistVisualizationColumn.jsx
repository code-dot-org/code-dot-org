import PropTypes from 'prop-types';
import React from 'react';

import GameButtons from '@cdo/apps/templates/GameButtons';
import BelowVisualization from '../templates/BelowVisualization';

import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';
import SaveImageButton from './SaveImageButton';
import msg from '@cdo/locale';

export default class ArtistVisualizationColumn extends React.Component {
  static propTypes = {
    showFinishButton: PropTypes.bool.isRequired,
    showSaveImageButton: PropTypes.bool.isRequired,
    displayCanvas: PropTypes.instanceOf(HTMLCanvasElement).isRequired,
    iconPath: PropTypes.string.isRequired
  };

  render() {
    return (
      <span>
        <ProtectedVisualizationDiv />
        <GameButtons>
          {this.props.showSaveImageButton && (
            <SaveImageButton displayCanvas={this.props.displayCanvas} />
          )}
          <div id="slider-cell">
            <svg id="slider" version="1.1" width="150" height="50">
              {/* Slow icon. */}
              <clipPath id="slowClipPath">
                <rect width="26" height="12" x="5" y="14" />
              </clipPath>
              <image
                xlinkHref={this.props.iconPath}
                height="42"
                width="84"
                x="-21"
                y="-10"
                clipPath="url(#slowClipPath)"
              />
              {/* Fast icon. */}
              <clipPath id="fastClipPath">
                <rect width="26" height="16" x="120" y="10" />
              </clipPath>
              <image
                xlinkHref={this.props.iconPath}
                height="42"
                width="84"
                x="120"
                y="-11"
                clipPath="url(#fastClipPath)"
              />
            </svg>
            {
              ' ' /* Explicitly insert whitespace so that this behaves like our ejs file*/
            }
            <img
              id="spinner"
              style={styles.invisible}
              src="/blockly/media/turtle/loading.gif"
              height="15"
              width="15"
            />{' '}
            {this.props.showFinishButton && (
              <button type="button" id="finishButton" className="share">
                <img src="/blockly/media/1x1.gif" />
                {msg.finish()}
              </button>
            )}
          </div>
        </GameButtons>
        <BelowVisualization />
      </span>
    );
  }
}

const styles = {
  invisible: {
    visibility: 'hidden'
  }
};
