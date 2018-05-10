import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import ScriptSelector from '@cdo/apps/templates/sectionProgress/ScriptSelector';
import {h3Style} from "../../lib/ui/Headings";
import {validScriptPropType, setScriptId} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import {asyncLoadTextResponses} from './textResponsesRedux';
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
    sectionId: PropTypes.number.isRequired,

    // provided by redux
    responses: PropTypes.object.isRequired,
    isLoadingResponses: PropTypes.bool.isRequired,
    validScripts: PropTypes.arrayOf(validScriptPropType).isRequired,
    scriptId: PropTypes.number,
    setScriptId: PropTypes.func.isRequired,
    asyncLoadTextResponses: PropTypes.func.isRequired
  };

  onChangeScript = scriptId => {
    const {setScriptId, asyncLoadTextResponses, sectionId} = this.props;
    asyncLoadTextResponses(sectionId, scriptId, () => {
      setScriptId(scriptId);
    });
  };

  render() {
    const {validScripts, scriptId, responses, sectionId, isLoadingResponses} = this.props;
    const scriptResponses = responses[scriptId];

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
            responses={scriptResponses}
            sectionId={sectionId}
            isLoading={isLoadingResponses}
          />
        </div>
      </div>
    );
  }
}

export const UnconnectedTextResponses = TextResponses;

export default connect(state => ({
  responses: state.textResponses.responseDataByScript,
  isLoadingResponses: state.textResponses.isLoadingResponses,
  validScripts: state.sectionProgress.validScripts,
  scriptId: state.sectionProgress.scriptId,
}), dispatch => ({
  setScriptId(scriptId) {
    dispatch(setScriptId(scriptId));
  },
  asyncLoadTextResponses(sectionId, scriptId, onComplete) {
    dispatch(asyncLoadTextResponses(sectionId, scriptId, onComplete));
  }
}))(TextResponses);
