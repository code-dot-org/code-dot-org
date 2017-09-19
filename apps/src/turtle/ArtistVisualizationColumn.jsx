import React, {PropTypes} from 'react';

var GameButtons = require('../templates/GameButtons').default;
var BelowVisualization = require('../templates/BelowVisualization');
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';
import msg from '@cdo/locale';

var styles = {
  invisible: {
    visibility: 'hidden'
  }
};

var ArtistVisualizationColumn = function (props) {
  return (
    <span>
      <ProtectedVisualizationDiv />
      <GameButtons>
        <div id="slider-cell">
          <svg
            id="slider"
            version="1.1"
            width="150"
            height="50"
          >
              {/* Slow icon. */}
              <clipPath id="slowClipPath">
                <rect width="26" height="12" x="5" y="14" />
              </clipPath>
              <image
                xlinkHref={props.iconPath}
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
                xlinkHref={props.iconPath}
                height="42"
                width="84"
                x="120"
                y="-11"
                clipPath="url(#fastClipPath)"
              />
          </svg>
          {" "/* Explicitly insert whitespace so that this behaves like our ejs file*/}
          <img
            id="spinner"
            style={styles.invisible}
            src="/blockly/media/turtle/loading.gif"
            height="15"
            width="15"
          />
          {" "}
          {props.showFinishButton &&
            <button id="finishButton" className="share">
              <img src="/blockly/media/1x1.gif"/>
              {msg.finish()}
            </button>
          }
        </div>
      </GameButtons>
      <BelowVisualization/>
    </span>
  );
};

ArtistVisualizationColumn.propTypes = {
  showFinishButton: PropTypes.bool.isRequired,
  iconPath: PropTypes.string.isRequired
};

module.exports = ArtistVisualizationColumn;
