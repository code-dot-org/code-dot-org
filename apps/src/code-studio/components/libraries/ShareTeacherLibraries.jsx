import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import SortedTableSelect from '@cdo/apps/code-studio/components/SortedTableSelect';
import {
  sectionsNameAndId, asyncLoadSectionData
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {setPersonalProjects} from '@cdo/apps/templates/projects/projectsRedux';

import {getStore} from '@cdo/apps/redux';

class ShareTeacherLibraries extends React.Component {
  static propTypes = {
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
    sectionsIds: [],
    selectedLibraryId: null
  }

  componentDidMount() {
    this.props.setPersonalProjects();
    this.props.asyncLoadSectionData();
  }

  render() {
    const {sections, personalProjectsList} = this.props;
    debugger;
    // const projects = personalProjectsList.projects || [];
    const libraries = personalProjectsList.filter(
      project => project.libraryName
    ).map(
      project => {return {name: project.name, id: project.channel}}
    );

    return (
      <SortedTableSelect
        rowData={sections}
        onRowChecked={(sectionIds) => this.setState({sectionsIds: sectionIds})}
        options={libraries}
        onChooseOption={(libraryId) => this.setState({selectedLibraryId: libraryId})}
      >
        <p>more goes here</p>
      </SortedTableSelect>
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
    setPersonalProjects
  }
)(ShareTeacherLibraries);