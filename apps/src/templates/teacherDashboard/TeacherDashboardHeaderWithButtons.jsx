import FontAwesome from './../FontAwesome';
import React from 'react';
import {connect} from 'react-redux';
import {
  switchToSection,
  recordSwitchToSection,
  recordOpenEditSectionDetails
} from './sectionHelpers';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import SmallChevronLink from '../SmallChevronLink';
import {ReloadAfterEditSectionDialog} from './EditSectionDialog';
import {beginEditingSection} from './teacherSectionsRedux';
import Button from '../Button';
import DropdownButton from '../DropdownButton';
import experiments from '@cdo/apps/util/experiments';

const styles = {
  sectionPrompt: {
    fontWeight: 'bold'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '5px'
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column-reverse'
  },
  buttonSection: {
    display: 'flex'
  },
  buttonWithMargin: {
    marginRight: '5px'
  }
};

class TeacherDashboardHeaderWithButtons extends React.Component {
  static propTypes = {
    sections: PropTypes.object.isRequired,
    selectedSectionId: PropTypes.number.isRequired,
    selectedSectionScript: PropTypes.object.isRequired,
    openEditSectionDialog: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.getDropdownOptions = this.getDropdownOptions.bind(this);
    this.selectedSection = this.props.sections[this.props.selectedSectionId];
  }

  experimentDropdownButton() {
    if (
      experiments.isEnabled(
        experiments.TEACHER_DASHBOARD_SECTION_BUTTONS_ALTERNATE_TEXT
      )
    ) {
      return (
        <DropdownButton size="narrow" color="gray" text={i18n.switchSection()}>
          {this.getDropdownOptions('from_button_switch_section')}
        </DropdownButton>
      );
    } else {
      return (
        <DropdownButton size="narrow" color="gray" text={i18n.selectSection()}>
          {this.getDropdownOptions('from_button_select_section')}
        </DropdownButton>
      );
    }
  }

  getDropdownOptions(optionMetricName) {
    let self = this;
    let sections = this.props.sections;
    let options = Object.keys(sections).map(function(key, i) {
      let section = sections[key];
      let optionOnClick = () => {
        switchToSection(section.id, self.selectedSection.id);
        recordSwitchToSection(
          section.id,
          self.selectedSection.id,
          optionMetricName
        );
      };
      let icon = undefined;
      if (section.id === self.selectedSection.id) {
        icon = <FontAwesome icon="check" />;
      }
      return (
        <a key={i} id={section.id} onClick={optionOnClick}>
          {icon} {section.name}
        </a>
      );
    });
    return options;
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
        <div style={styles.header}>
          <div>
            <h1>{this.selectedSection.name}</h1>
            <div>
              <span style={styles.sectionPrompt}>
                {i18n.assignedToWithColon()}{' '}
              </span>
              {this.props.selectedSectionScript.name}
            </div>
          </div>
          <div style={styles.rightColumn}>
            <div style={styles.buttonSection}>
              <Button
                __useDeprecatedTag
                onClick={() => {
                  this.props.openEditSectionDialog(this.selectedSection.id);
                  recordOpenEditSectionDetails(
                    this.selectedSection.id,
                    'dashboard_header'
                  );
                }}
                icon="gear"
                size="narrow"
                color="gray"
                text={i18n.editSectionDetails()}
                style={styles.buttonWithMargin}
              />
              {this.experimentDropdownButton()}
            </div>
          </div>
        </div>
        <ReloadAfterEditSectionDialog />
      </div>
    );
  }
}

export const UnconnectedTeacherDashboardHeaderWithButtons = TeacherDashboardHeaderWithButtons;

export default connect(
  state => {
    let sections = state.teacherSections.sections;
    let selectedSectionId = state.teacherSections.selectedSectionId;

    let selectedSectionScriptId = state.scriptSelection.scriptId;
    let selectedSectionScript = state.scriptSelection.validScripts.filter(
      script => script.id === selectedSectionScriptId
    )[0];
    return {sections, selectedSectionId, selectedSectionScript};
  },
  dispatch => {
    return {
      openEditSectionDialog: id => dispatch(beginEditingSection(id))
    };
  }
)(TeacherDashboardHeaderWithButtons);
