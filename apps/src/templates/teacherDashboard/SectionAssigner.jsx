import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {sectionForDropdownShape} from './shapes';
import TeacherSectionSelector from './TeacherSectionSelector';
import {selectSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

class SectionAssigner extends Component {
  static propTypes = {
    sections: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
    courseOfferingId: PropTypes.number,
    courseVersionId: PropTypes.number,
    courseId: PropTypes.number,
    scriptId: PropTypes.number,
    forceReload: PropTypes.bool,
    buttonLocationAnalytics: PropTypes.string,
    // Redux provided
    selectSection: PropTypes.func.isRequired,
    assignmentName: PropTypes.string
  };

  onChangeSection = sectionId => {
    this.props.selectSection(sectionId);
  };

  render() {
    const {
      sections,
      courseOfferingId,
      courseVersionId,
      courseId,
      scriptId,
      forceReload,
      assignmentName,
      buttonLocationAnalytics
    } = this.props;

    return (
      <div style={styles.section}>
        <div style={styles.label}>{i18n.currentSection()}</div>
        <div style={styles.content}>
          <TeacherSectionSelector
            sections={sections}
            onChangeSection={this.onChangeSection}
            forceReload={forceReload}
            courseOfferingId={courseOfferingId}
            courseVersionId={courseVersionId}
            unitId={scriptId}
            courseId={courseId}
            courseName={assignmentName}
            buttonLocationAnalytics={buttonLocationAnalytics}
          />
        </div>
      </div>
    );
  }
}

const styles = {
  section: {
    marginBottom: 10
  },
  content: {
    display: 'flex',
    alignItems: 'center'
  },
  label: {
    width: '100%',
    fontSize: 16,
    fontFamily: '"Gotham 5r", sans-serif',
    paddingTop: 10,
    paddingBottom: 10
  }
};

export const UnconnectedSectionAssigner = SectionAssigner;

export default connect(
  state => ({}),
  dispatch => ({
    selectSection(sectionId) {
      dispatch(selectSection(sectionId));
    }
  })
)(SectionAssigner);
