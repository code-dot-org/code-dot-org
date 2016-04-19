var msg = require('../locale');
var commonStyles = require('../commonStyles');

var GameButtons = require('../templates/GameButtons');
var BelowVisualization = require('../templates/BelowVisualization');

var styles = {
  invisible: {
    visibility: 'hidden'
  }
};

// TODO - iconPath is different sometimes

var ArtistVisualizationColumn = function (props) {
  return (
    <span>
      <div id="visualization"/>
      <GameButtons hideRunButton={false}>
        <div id="slider-cell">
          <svg id="slider"
               xmlns="http://www.w3.org/2000/svg"
               version="1.1"
               width="150"
               height="50">
              {/* Slow icon. */}
              <clipPath id="slowClipPath">
                <rect width="26" height="12" x="5" y="14" />
              </clipPath>
              <image
                  xlinkHref="/blockly/media/turtle/icons.png"
                  height="42"
                  width="84"
                  x="-21"
                  y="-10"
                  clipPath="url(#slowClipPath)" />
              {/* Fast icon. */}
              <clipPath id="fastClipPath">
                <rect width="26" height="16" x="120" y="10" />
              </clipPath>
              <image
                  xlinkHref="/blockly/media/turtle/icons.png"
                  height="42"
                  width="84"
                  x="120"
                  y="-11"
                  clipPath="url(#fastClipPath)" />
          </svg>
          {" " /* Explicitly insert whitespace so that this behaves like our ejs file*/}
          <img
              id="spinner"
              style={styles.invisible}
              src="/blockly/media/turtle/loading.gif"
              height="15"
              width="15"/>
        </div>
      </GameButtons>
      <BelowVisualization/>
    </span>
  );
};

ArtistVisualizationColumn.propTypes = {
};

module.exports = ArtistVisualizationColumn;
