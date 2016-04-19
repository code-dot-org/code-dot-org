var msg = require('../locale');
var commonStyles = require('../commonStyles');

var GameButtons = require('../templates/GameButtons');
var BelowVisualization = require('../templates/BelowVisualization');

var CalcVisualizationColumn = function (props) {
  return (
    <span>
      <div id="visualization">
        <svg version="1.1" id="svgCalc">
          <image id="background" height="400" width="400" x="0" y="0" xlinkHref="/blockly/media/skins/calc/background.png"></image>
          <g id="userExpression" className="expr" transform="translate(0, 100)">
          </g>
          <g id="answerExpression" className="expr" transform="translate(0, 350)">
          </g>
        </svg>
      </div>
      <GameButtons hideRunButton={false}/>
      <BelowVisualization inputOutputTable={props.inputOutputTable}/>
    </span>
  );
};

CalcVisualizationColumn.propTypes = {
  inputOutputTable: React.PropTypes.arrayOf(
    React.PropTypes.arrayOf(React.PropTypes.number)
  )
};

module.exports = CalcVisualizationColumn;
