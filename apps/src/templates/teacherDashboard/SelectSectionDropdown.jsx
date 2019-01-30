import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {navigateToHref} from '@cdo/apps/utils';

class SelectSectionDropdown extends React.Component {
  static propTypes = {
    // Provided by redux.
    sections: PropTypes.object,
    selectedSectionId: PropTypes.number,
  };

  onChange = (event) => {
    const sectionId = event.target.value;
    // TODO: navigate to *same* tab in teacher dashboard
    navigateToHref(`/teacher_dashboard/sections/${sectionId}`);
  };

  render() {
    const {sections, selectedSectionId} = this.props;

    return (
      <select onChange={this.onChange} value={selectedSectionId}>
        {Object.keys(sections).map(id => (
          <option key={id} value={id}>
            {sections[id].name}
          </option>
        ))}
      </select>
    );
  }
}

export const UnconnectedSelectSectionDropdown = SelectSectionDropdown;

export default connect(state => ({
  sections: state.teacherSections.sections,
  selectedSectionId: state.teacherSections.selectedSectionId,
}))(SelectSectionDropdown);
