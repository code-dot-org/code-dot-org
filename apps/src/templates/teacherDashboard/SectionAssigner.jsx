import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {sectionForDropdownShape} from './shapes';
import TeacherSectionSelector from './TeacherSectionSelector';
import AssignedButton from '@cdo/apps/templates/AssignedButton';
import AssignButton from '@cdo/apps/templates/AssignButton';
import {selectSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

const styles = {
  main: {
    display: 'flex'
  }
};

class SectionAssigner extends Component {
  static propTypes = {
    sections: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
    selectedSectionId: PropTypes.string,
    selectSection: PropTypes.func.isRequired
  };

  state = {
    selectedSection: this.props.sections.find(
      section => section.id === parseInt(this.props.selectedSectionId)
    )
  };

  onChangeSection = sectionId => {
    const {sections} = this.props;
    const selectedSection = sections.find(section => section.id === sectionId);
    this.setSelectedSection(selectedSection);
  };

  setSelectedSection = section => {
    this.setState({selectedSection: section});
  };

  render() {
    const {sections} = this.props;
    const {selectedSection} = this.state;

    return (
      <div style={styles.main}>
        <TeacherSectionSelector
          sections={sections}
          onChangeSection={this.onChangeSection}
          selectedSection={selectedSection}
        />
        {selectedSection.isAssigned && <AssignedButton />}
        {!selectedSection.isAssigned && <AssignButton />}
      </div>
    );
  }
}

export const UnconnectedSectionAssigner = SectionAssigner;

export default connect(
  state => ({
    selectedSectionId: state.teacherSections.selectedSectionId
  }),
  dispatch => ({
    selectSection(sectionId) {
      dispatch(selectSection(sectionId));
    }
  })
)(SectionAssigner);
