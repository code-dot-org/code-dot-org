import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {navigateToHref} from '@cdo/apps/utils';

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

class SelectSectionDropdown extends React.Component {
  static propTypes = {
    // Provided by redux.
    sections: PropTypes.object,
    selectedSectionId: PropTypes.number
  };

  onChange = event => {
    const sectionId = event.target.value;
    navigateToHref(`/teacher_dashboard/sections/${sectionId}`);
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
          {Object.keys(sections).map(id => (
            <option key={id} value={id}>
              {sections[id].name}
            </option>
          ))}
        </select>
      </div>
    );
  }
}

export const UnconnectedSelectSectionDropdown = SelectSectionDropdown;

export default connect(state => ({
  sections: state.teacherSections.sections,
  selectedSectionId: state.teacherSections.selectedSectionId
}))(SelectSectionDropdown);
