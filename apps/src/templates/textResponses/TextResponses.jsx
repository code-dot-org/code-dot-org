import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {uniq, map, filter} from 'lodash';
import {CSVLink} from 'react-csv';
import i18n from '@cdo/locale';
import ScriptSelector from '@cdo/apps/templates/sectionProgress/ScriptSelector';
import {h3Style} from "../../lib/ui/Headings";
import color from "../../util/color";
import {asyncLoadTextResponses} from './textResponsesRedux';
import TextResponsesTable from './TextResponsesTable';
import Button from '../Button';
import { setScriptId, validScriptPropType } from '@cdo/apps/redux/scriptSelectionRedux';

const CSV_HEADERS = [
  {label: i18n.name(), key: 'studentName'},
  {label: i18n.stage(), key: 'stage'},
  {label: i18n.puzzle(), key: 'puzzle'},
  {label: i18n.question(), key: 'question'},
  {label: i18n.response(), key: 'response'},
];
const DEFAULT_FILTER_KEY = i18n.all();
const PADDING = 8;

const styles = {
  header: {
    marginBottom: 0
  },
  actionRow: {
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
    // provided by redux
    sectionId: PropTypes.number.isRequired,
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

  getResponsesByScript = () => {
    const {responses, scriptId} = this.props;
    return responses[scriptId] || [];
  };

  onChangeScript = scriptId => {
    const {setScriptId, asyncLoadTextResponses, sectionId} = this.props;
    asyncLoadTextResponses(sectionId, scriptId, () => {
      setScriptId(scriptId);
      this.setState({filterByStageName: null});
    });
  };

  renderFilterByStageDropdown = () => {
    const stages = this.getStages();

    // only render filter dropdown if there are 2+ stages
    if (stages.length <= 1) {
      return null;
    }

    return (
      <div style={styles.dropdownContainer}>
        <div style={styles.dropdownLabel}>{i18n.filterByStage()}</div>
        <select
          id="uitest-stage-filter"
          style={styles.dropdown}
          onChange={this.onChangeFilter}
        >
          <option key={DEFAULT_FILTER_KEY}>{DEFAULT_FILTER_KEY}</option>
          {stages.map(stage => <option key={stage}>{stage}</option>)}
        </select>
      </div>
    );
  };

  getStages = () => {
    const stages = uniq(map(this.getResponsesByScript(), 'stage'));
    return stages;
  };

  onChangeFilter = event => {
    const filterByStageName = event.target.value === DEFAULT_FILTER_KEY ? null : event.target.value;
    this.setState({filterByStageName});
  };

  getFilteredResponses = () => {
    const {filterByStageName} = this.state;
    let filteredResponses = [...this.getResponsesByScript()];

    if (filterByStageName) {
      filteredResponses = filter(filteredResponses, ['stage', filterByStageName]);
    }

    return filteredResponses;
  };

  render() {
    const {validScripts, scriptId, sectionId, isLoadingResponses} = this.props;
    const filteredResponses = this.getFilteredResponses();

    return (
      <div id="uitest-responses-tab">
        <div>
          <div style={{...h3Style, ...styles.header}}>
            {i18n.selectACourse()}
          </div>
          <ScriptSelector
            id="uitest-course-dropdown"
            validScripts={validScripts}
            scriptId={scriptId}
            onChange={this.onChangeScript}
          />
        </div>
        {filteredResponses.length > 0 &&
          <div
            id="uitest-response-actions"
            style={styles.actionRow}
          >
            <div>{this.renderFilterByStageDropdown()}</div>
            <CSVLink
              style={styles.buttonContainer}
              filename="responses.csv"
              data={filteredResponses}
              headers={CSV_HEADERS}
            >
              {/* onClick functionality for Button handled by CSVLink */}
              <Button
                text={i18n.downloadCSV()}
                onClick={() => {}}
                color={Button.ButtonColor.white}
              />
            </CSVLink>
          </div>
        }
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
  sectionId: state.sectionData.section.id,
  responses: state.textResponses.responseDataByScript,
  isLoadingResponses: state.textResponses.isLoadingResponses,
  validScripts: state.scriptSelection.validScripts,
  scriptId: state.scriptSelection.scriptId,
}), dispatch => ({
  setScriptId(scriptId) {
    dispatch(setScriptId(scriptId));
  },
  asyncLoadTextResponses(sectionId, scriptId, onComplete) {
    dispatch(asyncLoadTextResponses(sectionId, scriptId, onComplete));
  }
}))(TextResponses);
