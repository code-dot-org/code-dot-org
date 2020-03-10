import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import SortedTableSelect from '@cdo/apps/code-studio/components/SortedTableSelect';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import {
  sectionsNameAndId, asyncLoadSectionData
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {setPersonalProjects, updateProjectLibrary} from '@cdo/apps/templates/projects/projectsRedux';

import {getStore} from '@cdo/apps/redux';

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
    personalProjectsList: PropTypes.array.isRequired
  }
  state={
    selectedSections: [],
    selectedLibraryId: null,
    doneLoading: false,
    sharedSections: []
  }

  componentDidMount() {
    this.props.setPersonalProjects(() => this.setState({doneLoading: true}));
    this.props.asyncLoadSectionData();
  }

  assignLibrary = () => {
    const {selectedSections, selectedLibraryId} = this.state;
    this.props.updateProjectLibrary(selectedLibraryId, {sharedWith: selectedSections.map(section => section.id)});
    console.log(this.state.selectedSections)
    console.log(this.state.selectedLibraryId)
    this.setState({sharedSections: [...selectedSections]})
    // debugger;
  }

  onChooseOption = (event) => {
    debugger;
    const id = event.target.value;
    const project = this.props.personalProjectsList.find(project => project.channel === id);
    const sharedSections = (project && project.sharedWith) ? this.props.sections.filter(section => project.sharedWith.includes(section.id)) : [];
    // const sharedSections = this.props.sections.filter(section => project.sharedWith.includes(section.id));
    this.setState({selectedLibraryId: id, sharedSections: sharedSections, selectedSections: [...sharedSections]});
  }

  displaySharedSections = () => {
    debugger;
    const {sharedSections} = this.state;
    return (
      sharedSections.map(section => {
        return <li key={section.id}>{section.name}</li>;
      })
    );
  }

  onSelectAll = shouldSelectAll => {
    if (shouldSelectAll) {
      this.setState({selectedSections: this.props.sections});
    } else {
      this.setState({selectedSections: []});
    }
  };

  onSectionSelected = id => {
    this.setState(
      state => {
        if (state.selectedSections.find(section => section.id === id)) {
          state.selectedSections = state.selectedSections.filter(section => section.id !== id);
        } else {
          state.selectedSections.push(this.props.sections.find(section => section.id === id));
        }
        return state;
      }
    );
  };

  render() {
    const {sections, personalProjectsList, onCancel} = this.props;
    const {doneLoading, selectedSections} = this.state;
    // debugger;
    // const projects = personalProjectsList.projects || [];
    const libraries = personalProjectsList.filter(
      project => project.libraryName
    ).map(
      project => {return {name: project.name, id: project.channel}}
    );

    const rowData = sections.map(section => ({
      ...section,
      isChecked: !!selectedSections.find(selectedSection => selectedSection.id === section.id)
    }));

    return (
      <div>
        <SortedTableSelect
          rowData={rowData}
          onRowChecked={(selectedSectionId) => this.onSectionSelected(selectedSectionId)}
          options={libraries}
          onChooseOption={this.onChooseOption}
          onSelectAll={(shouldSelectAll) => this.onSelectAll(shouldSelectAll)}
        >
          <div>
            <p>This library is shared with the following sections:</p>
            <ul>{this.displaySharedSections()}</ul>
            </div>
        </SortedTableSelect>
        <Button
          onClick={onCancel}
          color={Button.ButtonColor.gray}
          text={i18n.dialogCancel()}
        >
        </Button>
        <Button
          onClick={this.assignLibrary}
          text={'assign library'}
        >
        </Button>
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