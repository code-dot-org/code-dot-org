import {Button as MuiButton, Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import SortedTableSelect from '@cdo/apps/code-studio/components/SortedTableSelect';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import {
  setPersonalProjects,
  updateProjectLibrary,
} from '@cdo/apps/templates/projects/projectsRedux';
import {asyncLoadSectionData} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {sectionsNameAndId} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import i18n from '@cdo/locale';

import LibraryIdCopier from './LibraryIdCopier';

export class ShareTeacherLibraries extends React.Component {
  static propTypes = {
    onCancel: PropTypes.func.isRequired,

    // from redux
    sections: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        id: PropTypes.number.isRequired,
      })
    ).isRequired,
    personalProjectsList: PropTypes.array.isRequired,
    asyncLoadSectionData: PropTypes.func.isRequired,
    setPersonalProjects: PropTypes.func.isRequired,
    updateProjectLibrary: PropTypes.func.isRequired,
    loadingFinished: PropTypes.bool.isRequired,
  };

  state = {
    selectedSections: [],
    selectedLibraryId: null,
    sharedSections: [],
  };

  componentDidMount() {
    const {setPersonalProjects, asyncLoadSectionData} = this.props;
    setPersonalProjects();
    asyncLoadSectionData();
  }

  assignLibrary = () => {
    const {selectedSections, selectedLibraryId} = this.state;
    const {updateProjectLibrary} = this.props;
    updateProjectLibrary(selectedLibraryId, {
      sharedWith: selectedSections.map(section => section.id),
    });
    this.setState({sharedSections: [...selectedSections]});
  };

  onChooseOption = event => {
    const {personalProjectsList, sections} = this.props;
    const id = event.target.value;
    const project = personalProjectsList.find(
      project => project.channel === id
    );
    const sharedSections =
      project && project.sharedWith
        ? sections.filter(section => project.sharedWith.includes(section.id))
        : [];
    this.setState({
      selectedLibraryId: id,
      sharedSections: sharedSections,
      selectedSections: [...sharedSections],
    });
  };

  displaySharedSections = () => {
    const {sharedSections} = this.state;
    if (sharedSections.length === 0) {
      return <Typography variant="body2">{i18n.libraryNotShared()}</Typography>;
    } else {
      return (
        <div>
          <Typography variant="body2">
            {i18n.librarySharedSections()}
          </Typography>
          <ul>
            {sharedSections.map(section => {
              return <li key={section.id}>{section.name}</li>;
            })}
          </ul>
        </div>
      );
    }
  };

  onSelectAll = shouldSelectAll => {
    const {sections} = this.props;
    if (shouldSelectAll) {
      this.setState({selectedSections: sections});
    } else {
      this.setState({selectedSections: []});
    }
  };

  onSectionSelected = id => {
    const {sections} = this.props;
    this.setState(state => {
      if (state.selectedSections.find(section => section.id === id)) {
        state.selectedSections = state.selectedSections.filter(
          section => section.id !== id
        );
      } else {
        state.selectedSections.push(
          sections.find(section => section.id === id)
        );
      }
      return state;
    });
  };

  render() {
    const {sections, personalProjectsList, onCancel, loadingFinished} =
      this.props;
    const {selectedSections, selectedLibraryId} = this.state;
    const libraries = personalProjectsList
      .filter(project => project.libraryName)
      .map(project => {
        return {name: project.libraryName, id: project.channel};
      });

    const rowData = sections.map(section => ({
      ...section,
      isChecked: !!selectedSections.find(
        selected => selected.id === section.id
      ),
    }));

    return (
      <div>
        {loadingFinished ? (
          <div>
            <Typography variant="body2">
              {i18n.shareTeacherLibraryDescription()}
            </Typography>
            <SortedTableSelect
              rowData={rowData}
              onRowChecked={id => this.onSectionSelected(id)}
              options={libraries}
              onChooseOption={this.onChooseOption}
              onSelectAll={shouldSelectAll => this.onSelectAll(shouldSelectAll)}
              optionsDescriptionText={i18n.libraryName() + ':'}
              tableDescriptionText={i18n.selectAssignedLibrarySections()}
            >
              {selectedLibraryId ? (
                <div style={{marginTop: 16}}>
                  <LibraryIdCopier channelId={selectedLibraryId} />
                  <Typography
                    variant="body2"
                    gutterBottom
                    sx={{marginTop: '12px'}}
                  >
                    {i18n.shareLibraryAccess()}
                  </Typography>
                  <div>{this.displaySharedSections()}</div>
                </div>
              ) : (
                <Typography variant="body3">
                  {i18n.selectLibraryForOptions()}
                </Typography>
              )}
            </SortedTableSelect>
            <div style={styles.footer}>
              <MuiButton
                variant="outlined"
                color="secondary"
                onClick={onCancel}
              >
                {i18n.closeDialog()}
              </MuiButton>
              <MuiButton
                variant="contained"
                color="primary"
                disabled={!selectedLibraryId}
                onClick={this.assignLibrary}
              >
                {i18n.shareLibraryButton()}
              </MuiButton>
            </div>
          </div>
        ) : (
          <Spinner />
        )}
      </div>
    );
  }
}

const styles = {
  footer: {
    display: 'flex',
    flexFlow: 'row',
    justifyContent: 'space-between',
    margin: 2,
    paddingTop: 10,
  },
};

export default connect(
  state => ({
    personalProjectsList: state.projects.personalProjectsList.projects || [],
    sections: sectionsNameAndId(state.teacherSections),
    loadingFinished: state.teacherSections.asyncLoadComplete,
  }),
  {
    asyncLoadSectionData,
    setPersonalProjects,
    updateProjectLibrary,
  }
)(ShareTeacherLibraries);
