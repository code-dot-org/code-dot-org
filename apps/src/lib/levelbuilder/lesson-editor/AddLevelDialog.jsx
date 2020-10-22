import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import Button from '@cdo/apps/templates/Button';
import LevelToken from '@cdo/apps/lib/levelbuilder/lesson-editor/LevelToken';
import ToggleGroup from '@cdo/apps/templates/ToggleGroup';
import AddLevelTable from '@cdo/apps/lib/levelbuilder/lesson-editor/AddLevelTable';
import AddLevelFilters from '@cdo/apps/lib/levelbuilder/lesson-editor/AddLevelFilters';
import CreateNewLevelInputs from '@cdo/apps/lib/levelbuilder/lesson-editor/CreateNewLevelInputs';
import $ from 'jquery';
import queryString from 'query-string';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

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

export default class AddLevelDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleConfirm: PropTypes.func.isRequired,
    currentScriptLevels: PropTypes.array,
    addLevel: PropTypes.func,
    activityPosition: PropTypes.number,
    activitySectionPosition: PropTypes.number
  };

  constructor(props) {
    super(props);

    this.state = {
      methodOfAddingLevel: 'Find Level',
      levels: null,
      searchFields: null,
      currentPage: 1,
      levelName: '',
      levelType: null,
      scriptId: null,
      ownerId: null,
      numPages: 0
    };
  }

  componentDidMount() {
    $.ajax({
      url: `/levels/get_filters`,
      method: 'GET',
      contentType: 'application/json;charset=UTF-8'
    }).done((data, _, request) => {
      this.setState({
        searchFields: data,
        levelType: data.levelOptions[0][1],
        scriptId: data.scriptOptions[0][1],
        ownerId: data.ownerOptions[0][1]
      });
    });

    $.ajax({
      url: `/levels/get_filtered_levels?page=${this.state.currentPage}`,
      method: 'GET',
      contentType: 'application/json;charset=UTF-8'
    }).done(data => {
      console.log(data);
      this.setState({levels: data.levels, numPages: data.numPages});
    });
  }

  handleSearch = () => {
    let queryParams = {page: this.state.currentPage};
    if (this.state.levelName) {
      queryParams.name = this.state.levelName;
    }
    if (this.state.levelType) {
      queryParams.level_type = this.state.levelType;
    }
    if (this.state.scriptId) {
      queryParams.script_id = this.state.scriptId;
    }
    if (this.state.ownerId) {
      queryParams.owner_id = this.state.ownerId;
    }

    const url =
      '/levels/get_filtered_levels?' + queryString.stringify(queryParams);

    $.ajax({
      url: url,
      method: 'GET',
      contentType: 'application/json;charset=UTF-8'
    }).done((data, _, request) => {
      this.setState({levels: data.levels, numPages: data.numPages});
    });
  };

  handleToggle = value => {
    this.setState({methodOfAddingLevel: value});
  };

  setCurrentPage = value => {
    this.setState({currentPage: value}, this.handleSearch);
  };

  handleChangeLevelName = event => {
    this.setState({levelName: event.target.value});
  };

  handleChangeLevelType = event => {
    this.setState({levelType: event.target.value});
  };

  handleChangeScript = event => {
    this.setState({scriptId: event.target.value});
  };

  handleChangeOwner = event => {
    this.setState({ownerId: event.target.value});
  };

  render() {
    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        handleClose={this.props.handleConfirm}
        useUpdatedStyles
        style={styles.dialog}
      >
        <h2>Add Levels</h2>
        <div style={styles.dialogContent}>
          {this.state.levels && this.state.searchFields && (
            <div style={styles.topArea}>
              <ToggleGroup
                selected={this.state.methodOfAddingLevel}
                onChange={this.handleToggle}
              >
                <button type="button" value={'Find Level'}>
                  Find Level
                </button>
                <button type="button" value={'Create New Level'}>
                  Create New Level
                </button>
              </ToggleGroup>
              {this.state.methodOfAddingLevel === 'Find Level' && (
                <div style={styles.filtersAndLevels}>
                  <AddLevelFilters
                    searchFields={this.state.searchFields}
                    handleSearch={this.handleSearch}
                    handleChangeLevelName={this.handleChangeLevelName}
                    handleChangeLevelType={this.handleChangeLevelType}
                    handleChangeScript={this.handleChangeScript}
                    handleChangeOwner={this.handleChangeOwner}
                    ownerId={this.state.ownerId}
                    scriptId={this.state.scriptId}
                    levelName={this.state.levelName}
                    levelType={this.state.levelType}
                  />
                  <AddLevelTable
                    setCurrentPage={this.setCurrentPage}
                    currentPage={this.state.currentPage}
                    addLevel={this.props.addLevel}
                    levels={this.state.levels}
                    numPages={this.state.numPages}
                  />
                </div>
              )}
              {this.state.methodOfAddingLevel === 'Create New Level' && (
                <CreateNewLevelInputs
                  levelOptions={this.state.searchFields.levelOptions}
                  addLevel={this.props.addLevel}
                />
              )}
            </div>
          )}
          {(!this.state.levels || !this.state.searchFields) && (
            <FontAwesome icon="spinner" className="fa-spin" />
          )}
          <div style={styles.bottomArea}>
            <h4>Levels in Progression</h4>
            <div style={styles.levelsBox}>
              {/*TODO Hook up removeLevel for the addLevelDialog*/}
              {this.props.currentScriptLevels.map(scriptLevel => (
                <LevelToken
                  key={scriptLevel.position + '_' + scriptLevel.activeId[0]}
                  scriptLevel={scriptLevel}
                  removeLevel={() => {
                    console.log('remove level');
                  }}
                  activitySectionPosition={this.props.activitySectionPosition}
                  activityPosition={this.props.activityPosition}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter rightAlign>
          <Button
            text={i18n.closeAndSave()}
            onClick={this.props.handleConfirm}
            color={Button.ButtonColor.orange}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}
