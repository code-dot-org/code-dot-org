import PropTypes from 'prop-types';
import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';
import {uniq, map, filter} from 'lodash';
import {CSVLink} from 'react-csv';
import i18n from '@cdo/locale';
import UnitSelector from '@cdo/apps/templates/sectionProgress/UnitSelector';
import {h3Style} from '../../lib/ui/Headings';
import color from '../../util/color';
import TextResponsesTable from './TextResponsesTable';
import Button from '../Button';
import TextResponsesLessonSelector from '@cdo/apps/templates/textResponses/TextResponsesLessonSelector';
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
const PADDING = 8;

function TextResponses({
  sectionId,
  validScripts,
  scriptId,
  scriptName,
  setScriptId
}) {
  const [textResponsesByScript, setTextResponsesByScript] = useState({});
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);
  const [filterByLessonName, setFilterByLessonName] = useState(null);

  useEffect(() => {
    asyncLoadTextResponses(sectionId, scriptId);
  }, [scriptId, sectionId]);

  const asyncLoadTextResponses = (sectionId, scriptId) => {
    // Don't load data if it's already stored in state.
    if (textResponsesByScript[scriptId]) {
      return;
    }

    setIsLoadingResponses(true);

    loadTextResponsesFromServer(sectionId, scriptId)
      .then(textResponses => {
        setTextResponses(scriptId, textResponses);
        setIsLoadingResponses(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoadingResponses(false);
      });
  };

  const setTextResponses = (scriptId, textResponses) => {
    const newTextResponsesByScript = {
      ...textResponsesByScript,
      [scriptId]: textResponses
    };
    setTextResponsesByScript(newTextResponsesByScript);
  };

  const onChangeScript = scriptId => {
    setScriptId(scriptId);
    setFilterByLessonName(null);
  };

  const responsesForCurrentScript = textResponsesByScript[scriptId] || [];

  let filteredResponses = [...responsesForCurrentScript];
  if (filterByLessonName) {
    filteredResponses = filter(filteredResponses, [
      'lesson',
      filterByLessonName
    ]);
  }

  const lessons = uniq(map(responsesForCurrentScript, 'lesson'));

  return (
    <div>
      <div style={styles.unitSelection}>
        <div style={{...h3Style, ...styles.header}}>{i18n.selectACourse()}</div>
        <UnitSelector
          validScripts={validScripts}
          scriptId={scriptId}
          onChange={onChangeScript}
        />
      </div>
      {filteredResponses.length > 0 && (
        <div id="uitest-response-actions" style={styles.actionRow}>
          <TextResponsesLessonSelector
            lessons={lessons}
            onChangeFilter={lessonName => setFilterByLessonName(lessonName)}
          />
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

TextResponses.propTypes = {
  // Provided by redux.
  sectionId: PropTypes.number.isRequired,
  validScripts: PropTypes.arrayOf(validScriptPropType).isRequired,
  scriptId: PropTypes.number,
  scriptName: PropTypes.string,
  setScriptId: PropTypes.func.isRequired
};

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
