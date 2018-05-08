import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import ScriptSelector from '@cdo/apps/templates/sectionProgress/ScriptSelector';
import {h3Style} from "../../lib/ui/Headings";
import {validScriptPropType, setScriptId} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';

const styles = {
  emptyInfoText: {
    paddingTop: 20
  }
};

class TextResponses extends Component {
  static propTypes = {
    responses: PropTypes.array.isRequired,

    // provided by redux
    validScripts: PropTypes.arrayOf(validScriptPropType).isRequired,
    scriptId: PropTypes.number,
    setScriptId: PropTypes.func.isRequired
  };

  onChangeScript = scriptId => {
    this.props.setScriptId(scriptId);
  };

  renderResponsesTable = () => {
    const {responses} = this.props;
    if (!responses.length) {
      return <div style={styles.emptyInfoText}>{i18n.emptyTextResponsesTable()}</div>;
    }
  };

  render() {
    const {validScripts, scriptId} = this.props;

    return (
      <div>
        <div>
          <div style={h3Style}>
            {i18n.selectACourse()}
          </div>
          <ScriptSelector
            validScripts={validScripts}
            scriptId={scriptId}
            onChange={this.onChangeScript}
          />
        </div>
        {this.renderResponsesTable()}
      </div>
    );
  }
}

export const UnconnectedTextResponses = TextResponses;

export default connect(state => ({
  validScripts: state.sectionProgress.validScripts,
  scriptId: state.sectionProgress.scriptId,
}), dispatch => ({
  setScriptId(scriptId) {
    dispatch(setScriptId(scriptId));
  }
}))(TextResponses);
