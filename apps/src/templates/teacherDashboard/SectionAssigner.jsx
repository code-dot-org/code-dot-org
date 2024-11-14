import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import fontConstants from '@cdo/apps/fontConstants';
import {selectSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import i18n from '@cdo/locale';

import {sectionForDropdownShape} from './shapes';
import TeacherSectionSelector from './TeacherSectionSelector';

class SectionAssigner extends Component {
  static propTypes = {
    sections: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
    courseOfferingId: PropTypes.number,
    courseVersionId: PropTypes.number,
    scriptId: PropTypes.number,
    forceReload: PropTypes.bool,
    selectSection: PropTypes.func.isRequired,
    selectedSectionId: PropTypes.number,
    assignmentName: PropTypes.string,
  };

  onChangeSection = sectionId => {
    this.props.selectSection(sectionId);
  };

  state = {
    confirmationMessageOpen: false,
  };

  onReassignConfirm = () => {
    this.setState({
      confirmationMessageOpen: true,
    });
    setTimeout(() => {
      this.setState({
        confirmationMessageOpen: false,
      });
    }, 15000);
  };

  render() {
    const {
      sections,
      courseOfferingId,
      courseVersionId,
      scriptId,
      selectedSectionId,
      forceReload,
    } = this.props;
    const selectedSection = sections.find(
      section => section.id === selectedSectionId
    );

    return (
      <div style={styles.section}>
        <div style={styles.label}>
          <div>{i18n.currentSection()}</div>
          {this.state.confirmationMessageOpen && (
            <span style={styles.confirmText}>{i18n.assignSuccess()}</span>
          )}
        </div>
        <div style={styles.content}>
          <TeacherSectionSelector
            sections={sections}
            onChangeSection={this.onChangeSection}
            selectedSection={selectedSection}
            forceReload={forceReload}
            courseOfferingId={courseOfferingId}
            courseVersionId={courseVersionId}
            unitId={scriptId}
          />
        </div>
      </div>
    );
  }
}

const styles = {
  section: {
    marginBottom: 5,
  },
  content: {
    display: 'flex',
    alignItems: 'center',
  },
  label: {
    width: '100%',
    fontSize: 16,
    ...fontConstants['main-font-semi-bold'],
    paddingTop: 10,
    paddingBottom: 10,
    display: 'flex',
    justifyContent: 'space-between',
  },
  confirmText: {
    fontSize: 12,
    ...fontConstants['main-font-regular'],
  },
};

export const UnconnectedSectionAssigner = SectionAssigner;

export default connect(
  state => ({
    selectedSectionId: state.teacherSections.selectedSectionId,
  }),
  dispatch => ({
    selectSection(sectionId) {
      dispatch(selectSection(sectionId));
    },
  })
)(SectionAssigner);
