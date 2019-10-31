import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {navigateToHref} from '@cdo/apps/utils';
import {getVisibleSections} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {TeacherDashboardPath} from '@cdo/apps/templates/teacherDashboard/TeacherDashboardNavigation';
import _ from 'lodash';
import firehoseClient from '../../lib/util/firehose';

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
    sections: PropTypes.array,
    selectedSectionId: PropTypes.number
  };

  onChange = event => {
    const sectionId = event.target.value;
    const baseUrl = `/teacher_dashboard/sections/${sectionId}/`;
    const currentTab = _.last(_.split(window.location.pathname, '/'));
    const teacherNavigationTabs = _.values(TeacherDashboardPath);
    const sectionUrl = _.includes(teacherNavigationTabs, `/${currentTab}`)
      ? baseUrl.concat(currentTab)
      : baseUrl;
    navigateToHref(sectionUrl);

    firehoseClient.putRecord(
      {
        study: 'teacher_dashboard_actions',
        study_group: currentTab,
        event: 'change_section',
        data_json: JSON.stringify({
          section_id: this.props.selectedSectionId,
          old_section_id: this.props.selectedSectionId,
          new_section_id: sectionId
        })
      },
      {includeUserId: true}
    );
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

export const UnconnectedSelectSectionDropdown = SelectSectionDropdown;

export default connect(state => ({
  sections: getVisibleSections(state),
  selectedSectionId: state.teacherSections.selectedSectionId
}))(SelectSectionDropdown);
