import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import ScriptSelector from '@cdo/apps/templates/sectionProgress/ScriptSelector';
import {h3Style} from "../../lib/ui/Headings";
import {validScriptPropType, setScriptId} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import TextResponsesTable from './TextResponsesTable';

const styles = {
  header: {
    marginBottom: 0
  },
  table: {
    paddingTop: 10
  }
};

class TextResponses extends Component {
  static propTypes = {
    responses: PropTypes.array.isRequired,
    sectionId: PropTypes.number.isRequired,

    // provided by redux
    validScripts: PropTypes.arrayOf(validScriptPropType).isRequired,
    scriptId: PropTypes.number,
    setScriptId: PropTypes.func.isRequired
  };

  onChangeScript = scriptId => {
    this.props.setScriptId(scriptId);
  };

  render() {
    const {validScripts, scriptId, responses, sectionId} = this.props;

    return (
      <div>
        <div>
          <div style={{...h3Style, ...styles.header}}>
            {i18n.selectACourse()}
          </div>
          <ScriptSelector
            validScripts={validScripts}
            scriptId={scriptId}
            onChange={this.onChangeScript}
          />
        </div>
        <div style={styles.table}>
          <TextResponsesTable
            responses={responses}
            sectionId={sectionId}
          />
        </div>
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
