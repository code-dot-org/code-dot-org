var ProtectedStatefulDiv = require('./ProtectedStatefulDiv');
var msg = require('../locale');
var commonStyles = require('../commonStyles');

var styles = {
  noPadding: {
    padding: 0
  }
};

var CodeWorkspace = function (props) {
  return (
    <span>
      <ProtectedStatefulDiv id="headers" dir={props.localeDirection}>
        <div id="codeModeHeaders">
          <div id="toolbox-header" className="workspace-header">
            <i id="hide-toolbox-icon" style={commonStyles.hidden} className="fa fa-chevron-circle-right"/>
            <span>{props.editCode ? msg.toolboxHeaderDroplet() : msg.toolboxHeader()}</span>
          </div>
          <div id="show-toolbox-header" className="workspace-header" style={commonStyles.hidden}>
            <i id="show-toolbox-icon" className="fa fa-chevron-circle-right"></i>
            <span>{msg.showToolbox()}</span>
          </div>
          <div id="show-code-header" className="workspace-header workspace-header-button">
            <span>
              <img src="/blockly/media/applab/blocks_glyph.gif" className="blocks-glyph" />
              <i className="fa fa-code"/>
              <span style={styles.noPadding}>{msg.showCodeHeader()}</span>
            </span>
          </div>
          {!props.readonlyWorkspace && <div id="clear-puzzle-header" className="workspace-header workspace-header-button">
            <span>
              <i className="fa fa-undo"/>
              <span style={styles.noPadding}>{msg.clearPuzzle()}</span>
            </span>
          </div>}
          <div id="versions-header" className="workspace-header workspace-header-button">
            <span>
              <i className="fa fa-clock-o"/>
              <span style={styles.noPadding}>{msg.showVersionsHeader()}</span>
            </span>
          </div>
          <div id="workspace-header" className="workspace-header">
            <span id="workspace-header-span">
              {props.readonlyWorkspace ? msg.readonlyWorkspaceHeader() : msg.workspaceHeaderShort()}
            </span>
            <div id="blockCounter">
              <div id="blockUsed" className='block-counter-default'>
              </div>
              <span> / </span>
              <span id="idealBlockNumber"></span>
              <span>{" " + msg.blocks()}</span>
            </div>
          </div>
        </div>
      </ProtectedStatefulDiv>
      {props.editCode && <ProtectedStatefulDiv id="codeTextbox"/>}
      {props.extraControlRows}
    </span>
  );
};

CodeWorkspace.propTypes = {
  localeDirection: React.PropTypes.oneOf(['rtl', 'ltr']).isRequired,
  editCode: React.PropTypes.bool.isRequired,
  readonlyWorkspace: React.PropTypes.bool.isRequired,
  extraControlRows: React.PropTypes.string, // TODO - dangerously set html?
};

module.exports = CodeWorkspace;
