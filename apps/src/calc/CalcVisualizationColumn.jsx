var GameButtons = require('../templates/GameButtons');
var BelowVisualization = require('../templates/BelowVisualization');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');

var CalcVisualizationColumn = function (props) {
  return (
    <span>
      <ProtectedStatefulDiv id="visualization">
        <svg version="1.1" id="svgCalc">
          <image id="background" height="400" width="400" x="0" y="0" xlinkHref="/blockly/media/skins/calc/background.png"></image>
          <g id="userExpression" className="expr" transform="translate(0, 100)"/>
          <g id="answerExpression" className="expr" transform="translate(0, 350)"/>
        </svg>
      </ProtectedStatefulDiv>
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
