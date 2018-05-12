import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {uniq, map, filter} from 'lodash';
import {CSVLink} from 'react-csv';
import i18n from '@cdo/locale';
import ScriptSelector from '@cdo/apps/templates/sectionProgress/ScriptSelector';
import {h3Style} from "../../lib/ui/Headings";
import color from "../../util/color";
import {validScriptPropType, setScriptId} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import {asyncLoadTextResponses} from './textResponsesRedux';
import TextResponsesTable from './TextResponsesTable';
import Button from '../Button';

const CSV_HEADERS = [
  {label: i18n.name(), key: 'studentName'},
  {label: i18n.stage(), key: 'stage'},
  {label: i18n.puzzle(), key: 'puzzle'},
  {label: i18n.question(), key: 'question'},
  {label: i18n.response(), key: 'response'},
];
const DEFAULT_FILTER_KEY = "all";
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
  buttonContainer: {
    display: 'flex',
    textDecoration: 'none'
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
    return (
      <div style={styles.dropdownContainer}>
        <div style={styles.dropdownLabel}>{i18n.filterByStage()}</div>
        <select
          style={styles.dropdown}
          onChange={this.onChangeStageFilter}
        >
          <option key={DEFAULT_FILTER_KEY}>{i18n.all()}</option>
          {this.getStages().map(stage => <option key={stage}>{stage}</option>)}
        </select>
      </div>
    );
  };

  getStages = () => {
    const {responses, scriptId} = this.props;
    const stages = uniq(map(responses[scriptId], 'stage'));
    return stages;
  };

  onChangeStageFilter = event => {
    const filterByStageName = event.target.value === DEFAULT_FILTER_KEY ? null : event.target.value;
    this.setState({filterByStageName});
  };

  getFilteredResponses = () => {
    const {filterByStageName} = this.state;
    const {responses, scriptId} = this.props;
    let filteredResponses = [...responses[scriptId]];

    if (filterByStageName) {
      filteredResponses = filter(filteredResponses, ['stage', filterByStageName]);
    }
    return filteredResponses;
  };

  render() {
    const {validScripts, scriptId, sectionId, isLoadingResponses} = this.props;
    const filteredResponses = this.getFilteredResponses();

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
          <CSVLink
            style={styles.buttonContainer}
            filename="responses.csv"
            data={filteredResponses}
            headers={CSV_HEADERS}
          >
            <Button
              text="Download CSV"
              onClick={() => {}}
              color={Button.ButtonColor.white}
            />
          </CSVLink>
        </div>
        <div style={styles.table}>
          <TextResponsesTable
            responses={filteredResponses}
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
