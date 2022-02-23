import PropTypes from 'prop-types';
import React, {useState, useEffect} from 'react';
import ToggleGroup from '@cdo/apps/templates/ToggleGroup';
import AddLevelTable from '@cdo/apps/lib/levelbuilder/lesson-editor/AddLevelTable';
import AddLevelFilters from '@cdo/apps/lib/levelbuilder/lesson-editor/AddLevelFilters';
import CreateNewLevelInputs from '@cdo/apps/lib/levelbuilder/lesson-editor/CreateNewLevelInputs';
import $ from 'jquery';
import queryString from 'query-string';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {connect} from 'react-redux';

function AddLevelDialogTop(props) {
  const [methodOfAddingLevel, setMethodOfAddingLevel] = useState('Find Level');
  const [levels, setLevels] = useState([]);
  const [loadingLevels, setLoadingLevels] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [levelName, setLevelName] = useState('');
  const [levelType, setLevelType] = useState(
    props.searchOptions.levelOptions[0][1]
  );
  const [unitId, setUnitId] = useState(props.searchOptions.scriptOptions[0][1]);
  const [ownerId, setOwnerId] = useState(
    props.searchOptions.ownerOptions[0][1]
  );
  const [numPages, setNumPages] = useState(0);

  useEffect(() => {
    handleSearch();
  }, []);

  const setCurrentPageAndSearch = value => {
    setCurrentPage(value);
    handleSearch();
  };

  const handleSearch = () => {
    let queryParams = {page: currentPage};
    if (levelName) {
      queryParams.name = levelName;
    }
    if (levelType) {
      queryParams.level_type = levelType;
    }
    if (unitId) {
      queryParams.script_id = unitId;
    }
    if (ownerId) {
      queryParams.owner_id = ownerId;
    }

    const url =
      '/levels/get_filtered_levels?' + queryString.stringify(queryParams);

    $.ajax({
      url: url,
      method: 'GET',
      contentType: 'application/json;charset=UTF-8'
    }).done((data, _, request) => {
      setLevels(data.levels);
      setNumPages(data.numPages);
      setLoadingLevels(false);
    });
  };

  return (
    <div>
      {!loadingLevels && (
        <div style={styles.topArea}>
          <ToggleGroup
            selected={methodOfAddingLevel}
            onChange={value => setMethodOfAddingLevel(value)}
          >
            <button type="button" value={'Find Level'}>
              Find Level
            </button>
            <button type="button" value={'Create New Level'}>
              Create New Level
            </button>
          </ToggleGroup>
          {methodOfAddingLevel === 'Find Level' && (
            <div style={styles.filtersAndLevels}>
              <AddLevelFilters
                handleSearch={handleSearch}
                handleChangeLevelName={event =>
                  setLevelName(event.target.value)
                }
                handleChangeLevelType={event =>
                  setLevelType(event.target.value)
                }
                handleChangeUnit={event => setUnitId(event.target.value)}
                handleChangeOwner={event => setOwnerId(event.target.value)}
                ownerId={ownerId}
                unitId={unitId}
                levelName={levelName}
                levelType={levelType}
              />
              <AddLevelTable
                setCurrentPage={setCurrentPageAndSearch}
                currentPage={currentPage}
                addLevel={props.addLevel}
                levels={levels}
                numPages={numPages}
              />
            </div>
          )}
          {methodOfAddingLevel === 'Create New Level' && (
            <CreateNewLevelInputs
              levelOptions={props.searchOptions.levelOptions}
              addLevel={props.addLevel}
            />
          )}
        </div>
      )}
      {loadingLevels && <FontAwesome icon="spinner" className="fa-spin" />}
    </div>
  );
}

AddLevelDialogTop.propTypes = {
  addLevel: PropTypes.func.isRequired,

  // from redux
  searchOptions: PropTypes.object.isRequired
};

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    width: 1100,
    fontFamily: '"Gotham 4r", sans-serif, sans-serif',
    marginLeft: -600
  },
  dialogContent: {
    display: 'flex',
    flexDirection: 'column'
  },
  topArea: {
    display: 'flex',
    flexDirection: 'column',
    margin: 15
  },
  bottomArea: {
    display: 'flex',
    flexDirection: 'column',
    margin: 15
  },
  textArea: {
    width: '95%'
  },
  levelsBox: {
    border: '1px solid black',
    width: '95%',
    height: '100%',
    padding: 10
  },
  filtersAndLevels: {
    display: 'flex',
    flexDirection: 'column'
  }
};

export const UnconnectedAddLevelDialogTop = AddLevelDialogTop;

export default connect(state => ({
  searchOptions: state.levelSearchingInfo.searchOptions
}))(AddLevelDialogTop);
