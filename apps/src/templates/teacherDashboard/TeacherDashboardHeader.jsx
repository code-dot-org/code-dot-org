import FontAwesome from './../FontAwesome';
import React from 'react';
import {connect} from 'react-redux';
import {switchToSection} from './urlHelpers';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import SmallChevronLink from '../SmallChevronLink';
import SelectSectionDropdown from './SelectSectionDropdown';
import SelectSectionButton from './SelectSectionButton';
import TeacherDashboardNavigation from './TeacherDashboardNavigation';
import {SetScriptIdEditSectionDialog} from './EditSectionDialog';
import {beginEditingSection} from './teacherSectionsRedux';
import Button from '../Button';
import DropdownButton from '../DropdownButton';

const styles = {
  headerContainer: {
  },
  headerSectionPrompt: {
    fontWeight: 'bold'
  },
  headerSubtext: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  headerButtons: {
    display:'flex'
  },
};


class TeacherDashboardHeader extends React.Component {
  static propTypes = {
    sectionScript: PropTypes.object.isRequired,
    selectedSection: PropTypes.object.isRequired,
    sections: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props)
    this.getDropdownOptions = this.getDropdownOptions.bind(this)
  }

  getDropdownOptions() {
      let sections = this.props.sections
      let selectedSection = this.props.selectedSection
      let options = Object.keys(sections).map(function(sectionId, i)  {
            let section = sections[sectionId]
            let linkProps = {
              id: sectionId,
              onClick: (link) => switchToSection(sectionId, selectedSection.id)
            }
            let icon = undefined;
            if (sectionId == selectedSection.id) {
                icon = <FontAwesome icon="check"/>
            }
            return <a key={i} id={sectionId} onClick={(link) => switchToSection(link.id) }>
              {icon} {section.name}
            </a>
        })
      return options
  }

  render() {
    return (
      <div>
        <SmallChevronLink
          link="/home#classroom-sections"
          linkText={i18n.viewAllSections()}
          isRtl={true}
          chevronSide="left"
        />
        <div>
          <div>
            <h1>{this.props.selectedSection.name}</h1>
            <div style={styles.headerSubtext}>
              <div>
                  <span style={styles.headerSectionPrompt}>Assigned to:</span>
                  {this.props.sectionScript.name}
              </div>
              <div style={styles.headerButtons}>
                <Button
                  onClick={() => {
                    this.props.dispatch(
                      beginEditingSection(this.props.selectedSection.id)
                    );
                  }}
                  icon="gear"
                  color="gray"
                  text="Edit section details"
                />
                <DropdownButton
                    text="Select section"
                    color="gray"
                >
                    {this.getDropdownOptions()}
                </DropdownButton>
              </div>
            </div>
          </div>
        </div>
        <TeacherDashboardNavigation />
        <SetScriptIdEditSectionDialog />
      </div>
    );
  }
}

export default connect(state => {
/*  let currentSectionId = state.teacherSections.selectedSectionId;
  let currentSectionName =
    state.teacherSections.sections[currentSectionId].name;


  let allSections = state.teacherSections.sections
*/
  let sections = state.teacherSections.sections;

  let selectedSectionId = state.teacherSections.selectedSectionId;
  let selectedSection = sections[selectedSectionId]

  let sectionScriptId = state.scriptSelection.scriptId;
  let sectionScript = state.scriptSelection.validScripts.filter(
    script => script.id === sectionScriptId
  )[0];
  return {sections, selectedSection, sectionScript};
})(TeacherDashboardHeader);
