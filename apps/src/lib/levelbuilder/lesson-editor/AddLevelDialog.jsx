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

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    fontFamily: '"Gotham 4r", sans-serif, sans-serif'
  },
  dialogContent: {
    display: 'flex',
    flexDirection: 'column'
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    margin: 15
  },
  rightColumn: {
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
    currentLevels: PropTypes.array,
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
      currentPage: 1
    };
  }

  componentDidMount() {
    $.ajax({
      url: `/levels/get_filters`,
      method: 'GET',
      contentType: 'application/json;charset=UTF-8'
    }).done((data, _, request) => {
      this.setState({searchFields: data});
    });

    $.ajax({
      url: `/levels/get_filtered_levels?page=${this.state.currentPage}`,
      method: 'GET',
      contentType: 'application/json;charset=UTF-8'
    }).done(data => {
      this.setState({levels: data});
    });
  }

  handleSearch = (levelName, levelType, scriptId, ownerId) => {
    let queryParams = {page: this.state.currentPage};
    if (levelName) {
      queryParams.name = levelName;
    }
    if (levelType) {
      queryParams.level_type = levelType;
    }
    if (scriptId) {
      queryParams.script_id = scriptId;
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
      this.setState({levels: data});
    });
  };

  handleToggle = value => {
    this.setState({methodOfAddingLevel: value});
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
          <div style={styles.leftColumn}>
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
                />
                <AddLevelTable addLevel={this.props.addLevel} />
              </div>
            )}
            {this.state.methodOfAddingLevel === 'Create New Level' && (
              <CreateNewLevelInputs />
            )}
          </div>
          <div style={styles.rightColumn}>
            <h4>Levels in Progression</h4>
            <div style={styles.levelsBox}>
              {/*TODO Hook up removeLevel for the addLevelDialog*/}
              {this.props.currentLevels.map(level => (
                <LevelToken
                  key={level.position + '_' + level.ids[0]}
                  level={level}
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
