import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {uniq, map, filter} from 'lodash';
import {CSVLink} from 'react-csv';
import i18n from '@cdo/locale';
import UnitSelector from '@cdo/apps/templates/sectionProgress/UnitSelector';
import {h3Style} from '../../lib/ui/Headings';
import color from '../../util/color';
import TextResponsesTable from './TextResponsesTable';
import Button from '../Button';
import {
  setScriptId,
  validScriptPropType,
  getSelectedScriptName
} from '@cdo/apps/redux/unitSelectionRedux';
import {loadTextResponsesFromServer} from '@cdo/apps/templates/textResponses/textReponsesDataApi';

const CSV_HEADERS = [
  {label: i18n.name(), key: 'studentName'},
  {label: i18n.lesson(), key: 'lesson'},
  {label: i18n.puzzle(), key: 'puzzle'},
  {label: i18n.question(), key: 'question'},
  {label: i18n.response(), key: 'response'}
];
const DEFAULT_FILTER_KEY = i18n.all();
const PADDING = 8;

class TextResponses extends Component {
  static propTypes = {
    // Provided by redux.
    sectionId: PropTypes.number.isRequired,
    validScripts: PropTypes.arrayOf(validScriptPropType).isRequired,
    scriptId: PropTypes.number,
    scriptName: PropTypes.string,
    setScriptId: PropTypes.func.isRequired
  };

  state = {
    filterByLessonName: null,
    textResponsesByScript: {},
    isLoadingResponses: false
  };

  componentDidMount() {
    this.asyncLoadTextResponses(this.props.sectionId, this.props.scriptId);
  }

  asyncLoadTextResponses = (sectionId, scriptId, onComplete = () => {}) => {
    // Don't load data if it's already stored in state.
    if (this.state.textResponsesByScript[scriptId]) {
      onComplete();
      return;
    }

    this.setState({isLoadingResponses: true});

    loadTextResponsesFromServer(sectionId, scriptId, (error, data) => {
      if (error) {
        console.error(error);
      } else {
        this.setTextResponses(scriptId, data);
        onComplete();
      }
      this.setState({isLoadingResponses: false});
    });
  };

  setTextResponses = (scriptId, data) => {
    const newTextResponsesByScript = {
      ...this.state.textResponsesByScript,
      [scriptId]: data
    };
    this.setState({textResponsesByScript: newTextResponsesByScript});
  };

  getResponsesByScript = () => {
    const {scriptId} = this.props;
    const {textResponsesByScript} = this.state;
    return textResponsesByScript[scriptId] || [];
  };

  onChangeScript = scriptId => {
    const {setScriptId, sectionId} = this.props;
    this.asyncLoadTextResponses(sectionId, scriptId, () => {
      setScriptId(scriptId);
      this.setState({filterByLessonName: null});
    });
  };

  renderFilterByLessonDropdown = () => {
    const lessons = this.getLessons();

    // only render filter dropdown if there are 2+ lessons
    if (lessons.length <= 1) {
      return null;
    }

    return (
      <div style={styles.dropdownContainer}>
        <div style={styles.dropdownLabel}>{i18n.filterByStage()}</div>
        <select
          id="uitest-lesson-filter"
          style={styles.dropdown}
          onChange={this.onChangeFilter}
        >
          <option key={DEFAULT_FILTER_KEY}>{DEFAULT_FILTER_KEY}</option>
          {lessons.map(lesson => (
            <option key={lesson}>{lesson}</option>
          ))}
        </select>
      </div>
    );
  };

  getLessons = () => {
    const lessons = uniq(map(this.getResponsesByScript(), 'lesson'));
    return lessons;
  };

  onChangeFilter = event => {
    const filterByLessonName =
      event.target.value === DEFAULT_FILTER_KEY ? null : event.target.value;
    this.setState({filterByLessonName});
  };

  getFilteredResponses = () => {
    const {filterByLessonName} = this.state;
    let filteredResponses = [...this.getResponsesByScript()];

    if (filterByLessonName) {
      filteredResponses = filter(filteredResponses, [
        'lesson',
        filterByLessonName
      ]);
    }

    return filteredResponses;
  };

  render() {
    const {validScripts, scriptId, scriptName, sectionId} = this.props;
    const {isLoadingResponses} = this.state;
    const filteredResponses = this.getFilteredResponses();

    return (
      <div>
        <div style={styles.unitSelection}>
          <div style={{...h3Style, ...styles.header}}>
            {i18n.selectACourse()}
          </div>
          <UnitSelector
            validScripts={validScripts}
            scriptId={scriptId}
            onChange={this.onChangeScript}
          />
        </div>
        {filteredResponses.length > 0 && (
          <div id="uitest-response-actions" style={styles.actionRow}>
            <div>{this.renderFilterByLessonDropdown()}</div>
            <CSVLink
              style={styles.buttonContainer}
              filename="responses.csv"
              data={filteredResponses}
              headers={CSV_HEADERS}
            >
              {/* onClick functionality for Button handled by CSVLink */}
              <Button
                __useDeprecatedTag
                text={i18n.downloadCSV()}
                onClick={() => {}}
                color={Button.ButtonColor.white}
              />
            </CSVLink>
          </div>
        )}
        <div style={styles.table}>
          <TextResponsesTable
            responses={filteredResponses}
            sectionId={sectionId}
            isLoading={isLoadingResponses}
            scriptName={scriptName}
          />
        </div>
      </div>
    );
  }
}

const styles = {
  header: {
    marginBottom: 0
  },
  unitSelection: {
    marginTop: 30
  },
  actionRow: {
    height: 47,
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

export const UnconnectedTextResponses = TextResponses;

export default connect(
  state => ({
    sectionId: state.sectionData.section.id,
    validScripts: state.unitSelection.validScripts,
    scriptId: state.unitSelection.scriptId,
    scriptName: getSelectedScriptName(state)
  }),
  dispatch => ({
    setScriptId(scriptId) {
      dispatch(setScriptId(scriptId));
    }
  })
)(TextResponses);
