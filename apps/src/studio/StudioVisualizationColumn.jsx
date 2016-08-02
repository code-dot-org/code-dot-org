var React = require('react');
var msg = require('@cdo/locale');

var GameButtons = require('../templates/GameButtons').default;
var ArrowButtons = require('../templates/ArrowButtons');
var BelowVisualization = require('../templates/BelowVisualization');
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';

var StudioVisualizationColumn = function (props) {
  return (
    <span>
      <ProtectedVisualizationDiv>
        <svg version="1.1" id="svgStudio"/>
      </ProtectedVisualizationDiv>
      <GameButtons>
        <ArrowButtons/>

        {props.finishButton && <div id="share-cell" className="share-cell-none">
          <button id="finishButton" className="share">
            <img src="/blockly/media/1x1.gif"/>
            {msg.finish()}
          </button>
        </div>}
      </GameButtons>
      <BelowVisualization/>
    </span>
  );
};

StudioVisualizationColumn.propTypes = {
  finishButton: React.PropTypes.bool.isRequired
};

module.exports = StudioVisualizationColumn;
