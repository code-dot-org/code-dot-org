import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {sectionForDropdownShape} from './shapes';
import SectionSelectionDropdown from './SectionSelectionDropdown';
import AssignedButton from '@cdo/apps/templates/AssignedButton';
import AssignButton from '@cdo/apps/templates/AssignButton';

const styles = {
  main: {
    display: 'flex'
  }
};

export default class SectionAssigner extends Component {
  static propTypes = {
    sections: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
    selectedSection: PropTypes.object
  };

  state = {
    selectedSection: this.props.selectedSection
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
        <SectionSelectionDropdown
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
