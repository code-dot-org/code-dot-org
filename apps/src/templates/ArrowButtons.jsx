var ProtectedStatefulDiv = require('./ProtectedStatefulDiv');

/**
 * A set of arrow buttons
 */
var ArrowButtons = function (props) {
  return (
    <ProtectedStatefulDiv id="soft-buttons" className="soft-buttons-none">
      <button id="leftButton" disabled className="arrow">
        <img src="/blockly/media/1x1.gif" className="left-btn icon21"/>
      </button>
      {" " /* Explicitly insert whitespace so that this behaves like our ejs file*/}
      <button id="rightButton" disabled className="arrow">
        <img src="/blockly/media/1x1.gif" className="right-btn icon21"/>
      </button>
      {" " /* Explicitly insert whitespace so that this behaves like our ejs file*/}
      <button id="upButton" disabled className="arrow">
        <img src="/blockly/media/1x1.gif" className="up-btn icon21"/>
      </button>
      {" " /* Explicitly insert whitespace so that this behaves like our ejs file*/}
      <button id="downButton" disabled className="arrow">
        <img src="/blockly/media/1x1.gif" className="down-btn icon21"/>
      </button>
    </ProtectedStatefulDiv>
  );
};

module.exports = ArrowButtons;
