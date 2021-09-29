import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ToggleGroup from '@cdo/apps/templates/ToggleGroup';
import AddLevelTable from '@cdo/apps/lib/levelbuilder/lesson-editor/AddLevelTable';
import AddLevelFilters from '@cdo/apps/lib/levelbuilder/lesson-editor/AddLevelFilters';
import CreateNewLevelInputs from '@cdo/apps/lib/levelbuilder/lesson-editor/CreateNewLevelInputs';
import $ from 'jquery';
import queryString from 'query-string';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {connect} from 'react-redux';

class AddLevelDialogTop extends Component {
  static propTypes = {
    addLevel: PropTypes.func.isRequired,

    // from redux
    searchOptions: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      methodOfAddingLevel: 'Find Level',
      levels: [],
      loadingLevels: true,
      currentPage: 1,
      levelName: '',
      levelType: props.searchOptions.levelOptions[0][1],
      unitId: props.searchOptions.scriptOptions[0][1],
      ownerId: props.searchOptions.ownerOptions[0][1],
      numPages: 0
    };
  }

  componentDidMount() {
    $.ajax({
      url: `/levels/get_filtered_levels?page=${this.state.currentPage}`,
      method: 'GET',
      contentType: 'application/json;charset=UTF-8'
    }).done(data => {
      this.setState({
        loadingLevels: false,
        levels: data.levels,
        numPages: data.numPages
      });
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
    if (this.state.unitId) {
      queryParams.script_id = this.state.unitId;
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

  handleNewSearch = () => {
    this.setState({currentPage: 1}, this.handleSearch);
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

  handleChangeUnit = event => {
    this.setState({unitId: event.target.value});
  };

  handleChangeOwner = event => {
    this.setState({ownerId: event.target.value});
  };

  render() {
    return (
      <div>
        {!this.state.loadingLevels && (
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
                  handleSearch={this.handleNewSearch}
                  handleChangeLevelName={this.handleChangeLevelName}
                  handleChangeLevelType={this.handleChangeLevelType}
                  handleChangeUnit={this.handleChangeUnit}
                  handleChangeOwner={this.handleChangeOwner}
                  ownerId={this.state.ownerId}
                  unitId={this.state.unitId}
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
                levelOptions={this.props.searchOptions.levelOptions}
                addLevel={this.props.addLevel}
              />
            )}
          </div>
        )}
        {this.state.loadingLevels && (
          <FontAwesome icon="spinner" className="fa-spin" />
        )}
      </div>
    );
  }
}

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
  searchOptions: state.searchOptions
}))(AddLevelDialogTop);
