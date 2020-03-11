import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import SortedTableSelect from '@cdo/apps/code-studio/components/SortedTableSelect';
// import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import Button from '@cdo/apps/templates/Button';
// import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import {
  sectionsNameAndId,
  asyncLoadSectionData
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {
  setPersonalProjects,
  updateProjectLibrary
} from '@cdo/apps/templates/projects/projectsRedux';

const styles = {
  container: {
    fontSize: 13,
    lineHeight: '18px',
    color: color.dark_charcoal
  },
  footer: {
    display: 'flex',
    flexFlow: 'row',
    justifyContent: 'space-between',
    margin: 2,
    paddingTop: 10
  }
};

class ShareTeacherLibraries extends React.Component {
  static propTypes = {
    onCancel: PropTypes.func.isRequired,
    // from redux
    sections: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        id: PropTypes.number.isRequired
      })
    ).isRequired,
    personalProjectsList: PropTypes.array.isRequired,
    asyncLoadSectionData: PropTypes.func.isRequired,
    setPersonalProjects: PropTypes.func.isRequired,
    updateProjectLibrary: PropTypes.func.isRequired
  };

  state = {
    selectedSections: [],
    selectedLibraryId: null,
    sharedSections: []
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
      sharedWith: selectedSections.map(section => section.id)
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
      selectedSections: [...sharedSections]
    });
  };

  displaySharedSections = () => {
    const {sharedSections} = this.state;
    if (sharedSections.length === 0) {
      return <p>{i18n.libraryNotShared()}</p>;
    } else {
      return (
        <div>
          <p>{i18n.librarySharedSections()}</p>
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
    const {sections, personalProjectsList, onCancel} = this.props;
    const {selectedSections, selectedLibraryId} = this.state;
    const libraries = personalProjectsList
      .filter(project => project.libraryName)
      .map(project => {
        return {name: project.name, id: project.channel};
      });

    const rowData = sections.map(section => ({
      ...section,
      isChecked: !!selectedSections.find(selected => selected.id === section.id)
    }));

    return (
      <div style={styles.container}>
        <p>{i18n.shareTeacherLibraryDescription()}</p>
        <SortedTableSelect
          rowData={rowData}
          onRowChecked={id => this.onSectionSelected(id)}
          options={libraries}
          onChooseOption={this.onChooseOption}
          onSelectAll={shouldSelectAll => this.onSelectAll(shouldSelectAll)}
          optionsDescriptionText={i18n.libraryName()}
        >
          <div>{selectedLibraryId && this.displaySharedSections()}</div>
        </SortedTableSelect>
        <div style={styles.footer}>
          <Button
            onClick={onCancel}
            color={Button.ButtonColor.gray}
            text={i18n.closeDialog()}
          />
          <Button
            onClick={this.assignLibrary}
            text={i18n.shareLibraryButton()}
          />
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    personalProjectsList: state.projects.personalProjectsList.projects || [],
    sections: sectionsNameAndId(state.teacherSections)
  }),
  {
    asyncLoadSectionData,
    setPersonalProjects,
    updateProjectLibrary
  }
)(ShareTeacherLibraries);
