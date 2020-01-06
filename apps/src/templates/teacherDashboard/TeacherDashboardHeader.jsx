import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import SmallChevronLink from '../SmallChevronLink';
import SelectSectionDropdown from './SelectSectionDropdown';
import TeacherDashboardNavigation from './TeacherDashboardNavigation';
import {SetScriptIdEditSectionDialog} from './EditSectionDialog';
import {beginEditingSection} from './teacherSectionsRedux';
import Button from '../Button';

const styles = {
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  headerSectionPrompt: {
    fontWeight: 'bold'
  }
};

class TeacherDashboardHeader extends React.Component {
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
              <span style={styles.headerSectionPrompt}>Assigned to:</span>
              {` ${this.props.currentScriptName}`}
            </div>
            <Button
              onClick={() => {
                this.props.dispatch(
                  beginEditingSection(this.props.currentSectionId)
                );
              }}
              icon="gear"
              size="default"
              color="gray"
              text="Edit section details"
            />
          </div>
          <SelectSectionDropdown />
        </div>
        <TeacherDashboardNavigation />
        <SetScriptIdEditSectionDialog />
      </div>
    );
  }
}

export default connect(state => {
  let currentSectionId = state.teacherSections.selectedSectionId;
  let currentSectionName =
    state.teacherSections.sections[currentSectionId].name;

  let currentScriptId = state.scriptSelection.scriptId;
  let currentScriptName = state.scriptSelection.validScripts.filter(
    script => script.id === currentScriptId
  )[0].name;

  return {currentSectionName, currentScriptName, currentSectionId};
})(TeacherDashboardHeader);
