import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import i18n from '@cdo/locale';
import ScriptSelector from '@cdo/apps/templates/sectionProgress/ScriptSelector';
import {h3Style} from "../../lib/ui/Headings";
import color from "../../util/color";
import {validScriptPropType, setScriptId} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import {asyncLoadTextResponses} from './textResponsesRedux';
import TextResponsesTable from './TextResponsesTable';
import Button from '../Button';

// TODO: abstract into constants
const PADDING = 8;

const styles = {
  header: {
    marginBottom: 0
  },
  tableHeader: {
    height: 47,
    width: '100%',
    padding: PADDING,
    marginTop: 20,
    backgroundColor: color.table_header,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  dropdownContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  dropdownLabel: {
    fontFamily: '"Gotham 5r", sans-serif'
  },
  dropdown: {
    display: 'block',
    boxSizing: 'border-box',
    height: 30,
    paddingLeft: PADDING,
    paddingRight: PADDING,
    marginLeft: PADDING
  },
  table: {
    paddingTop: PADDING / 4
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

  state = {
    filterByStageName: null
  };

  onChangeScript = scriptId => {
    const {setScriptId, asyncLoadTextResponses, sectionId} = this.props;
    asyncLoadTextResponses(sectionId, scriptId, () => {
      setScriptId(scriptId);
    });
  };

  renderStageFilterDropdown = () => {
    // TODO: i18n
    return (
      <div style={styles.dropdownContainer}>
        <div style={styles.dropdownLabel}>Filter by stage:</div>
        <select
          style={styles.dropdown}
          onChange={this.onChangeStageFilter}
        >
          <option key="All">All</option>
          {this.getStages().map(stage => <option key={stage}>{stage}</option>)}
        </select>
      </div>
    );
  };

  getStages = () => {
    const {responses, scriptId} = this.props;
    const stages = _.uniq(_.map(responses[scriptId], 'stage'));
    return stages;
  };

  onChangeStageFilter = event => {
    const filterByStageName = event.target.value === "All" ? null : event.target.value;
    this.setState({filterByStageName});
  };

  getFilteredResponses = () => {
    const {filterByStageName} = this.state;
    const {responses, scriptId} = this.props;
    let filteredResponses = [...responses[scriptId]];

    if (filterByStageName) {
      filteredResponses = _.filter(filteredResponses, ['stage', filterByStageName]);
    }
    return filteredResponses;
  };

  render() {
    const {validScripts, scriptId, sectionId, isLoadingResponses} = this.props;

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
        <div style={styles.tableHeader}>
          {this.renderStageFilterDropdown()}
          <Button
            text="Download CSV"
            onClick={() => {}}
            color={Button.ButtonColor.white}
          />
        </div>
        <div style={styles.table}>
          <TextResponsesTable
            responses={this.getFilteredResponses()}
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
