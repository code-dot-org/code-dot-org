import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import i18n from "@cdo/locale";
import experiments, {SECTION_FLOW_2017} from '@cdo/apps/util/experiments';
import ContentContainer from '../ContentContainer';
import {SectionsSetUpMessage} from './SetUpMessage';
import JoinSection from './JoinSection';
import JoinSectionNotifications from './JoinSectionNotifications';
import OwnedSections from '../teacherDashboard/OwnedSections';
import SectionsTable from '../studioHomepages/SectionsTable';
import {asyncLoadSectionData} from '../teacherDashboard/teacherSectionsRedux';
import AddSectionDialog from "../teacherDashboard/AddSectionDialog";

const StudentSections = React.createClass({
  propTypes: {
    sections: React.PropTypes.array, // student sections!  Teacher sections are in redux
    codeOrgUrlPrefix: React.PropTypes.string.isRequired,
    isRtl: React.PropTypes.bool.isRequired,
    isTeacher: React.PropTypes.bool.isRequired,
    canLeave: React.PropTypes.bool.isRequired,
    teacherHomepage: React.PropTypes.bool,

    //Redux provided
    numTeacherSections: PropTypes.number.isRequired,
    asyncLoadSectionData: PropTypes.func.isRequired,
  },

  componentDidMount(){
    this.props.asyncLoadSectionData();
  },

  getInitialState() {
    return {
      studentSections: this.props.sections,
      sectionsAction: null,
      sectionsResult: null,
      sectionsResultName: null
    };
  },

  updateSections(studentSections) {
    this.setState({studentSections});
  },

  updateSectionsResult(action, result, name) {
    this.setState({
      sectionsAction: action,
      sectionsResult: result,
      sectionsResultName: name
    });
  },

  render() {
    const {numTeacherSections, codeOrgUrlPrefix, isRtl, isTeacher, canLeave} = this.props;
    const studentSections = this.state.studentSections;
    const numStudentSections = studentSections.length;
    const isStudent = !isTeacher;
    const editSectionsUrl = `${codeOrgUrlPrefix}/teacher-dashboard#/sections`;
    const enrolledInASection = studentSections.length > 0;
    const enrollmentDescription = isTeacher ? "" : i18n.enrollmentDescription();
    const sectionFlow2017 = experiments.isEnabled(SECTION_FLOW_2017);

    return (
      <div className="sectionsContainer">
        <ContentContainer
          heading={i18n.sectionsTitle()}
          linkText={i18n.manageSections()}
          link={editSectionsUrl}
          showLink={isTeacher && !sectionFlow2017}
          isRtl={isRtl}
          description={enrollmentDescription}
        >
          <JoinSectionNotifications
            action={this.state.sectionsAction}
            result={this.state.sectionsResult}
            nameOrId={this.state.sectionsResultName}
          />
          {isTeacher && numTeacherSections > 0 && sectionFlow2017 && (
            <OwnedSections/>
          )}
          {(
            (isTeacher && numTeacherSections > 0 && !sectionFlow2017)
            ||
            (isStudent && numStudentSections > 0)
          ) && (
            <SectionsTable
              sections={studentSections}
              isRtl={isRtl}
              isTeacher={isTeacher}
              canLeave={canLeave}
              updateSections={this.updateSections}
              updateSectionsResult={this.updateSectionsResult}
            />
          )}
          {isTeacher && numTeacherSections === 0 && (
            <SectionsSetUpMessage isRtl={isRtl}/>
          )}
          {isTeacher && numTeacherSections === 0 && sectionFlow2017 && (
            <AddSectionDialog handleImportOpen={() => {}/* TODO */}/>
          )}
          {isStudent && (
            <JoinSection
              enrolledInASection={enrolledInASection}
              updateSections={this.updateSections}
              updateSectionsResult={this.updateSectionsResult}
            />
          )}
        </ContentContainer>
      </div>
    );
  }
});
export default connect(state => ({
  numTeacherSections: state.teacherSections.sectionIds.length
}), {
  asyncLoadSectionData,
})(StudentSections);
