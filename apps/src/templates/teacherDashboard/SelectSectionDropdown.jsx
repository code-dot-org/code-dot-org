import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {switchToSection, recordSwitchToSection} from './sectionHelpers';
import {getVisibleSections} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

class SelectSectionDropdown extends React.Component {
  static propTypes = {
    // Provided by redux.
    sections: PropTypes.array,
    selectedSectionId: PropTypes.number
  };

  onChange = event => {
    let toSectionId = event.target.value;
    let fromSectionId = this.props.selectedSectionId;
    switchToSection(toSectionId, fromSectionId);
    recordSwitchToSection(toSectionId, fromSectionId, 'from_select');
  };

  render() {
    const {sections, selectedSectionId} = this.props;

    return (
      <div style={styles.container}>
        <span>{i18n.switchSection()}</span>
        <select
          onChange={this.onChange}
          value={selectedSectionId}
          style={styles.dropdown}
        >
          {(sections || []).map(section => (
            <option key={section.id} value={section.id}>
              {section.name}
            </option>
          ))}
        </select>
      </div>
    );
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center'
  },
  dropdown: {
    marginLeft: 10,
    marginBottom: 0
  }
};

export const UnconnectedSelectSectionDropdown = SelectSectionDropdown;

export default connect(state => ({
  sections: getVisibleSections(state),
  selectedSectionId: state.teacherSections.selectedSectionId
}))(SelectSectionDropdown);
