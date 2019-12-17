import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import SmallChevronLink from '../SmallChevronLink';
import SelectSectionDropdown from './SelectSectionDropdown';
import TeacherDashboardNavigation from './TeacherDashboardNavigation';

const styles = {
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  headerSectionPrompt: {
    fontWeight: 'bold'
  }
};

/*export default*/ class TeacherDashboardHeader extends React.Component {
  static propTypes = {
    currentSectionName: PropTypes.string.isRequired,
    currentScriptName: PropTypes.string.isRequired
  };

  render() {
    return (
      <div>
        <SmallChevronLink
          link="/home#classroom-sections"
          linkText={i18n.viewAllSections()}
          isRtl={true}
          chevronSide="left"
        />
        <div style={styles.headerContainer}>
          <div>
            <h1>{this.props.currentSectionName}</h1>
            <div>
              <span style={styles.headerSectionPrompt}>Assigned to:</span>{' '}
              {this.props.currentScriptName}
            </div>
          </div>
          <SelectSectionDropdown />
        </div>
        <TeacherDashboardNavigation />
      </div>
    );
  }
}

export default connect(state => ({
  currentSectionName:
    state.teacherSections.sections[state.teacherSections.selectedSectionId]
      .name,
  currentScriptName: state.scriptSelection.validScripts.filter(
    script => script.id === state.scriptSelection.scriptId
  )[0].name
}))(TeacherDashboardHeader);
