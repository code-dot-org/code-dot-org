import React from 'react';
import ContentContainer from '../ContentContainer';
import SetUpMessage from './SetUpMessage';
import JoinSection from './JoinSection';
import Notification from '@cdo/apps/templates/Notification';
import i18n from "@cdo/locale";
import SectionsPage from '../teacherDashboard/SectionsPage';
import SectionsTable from '../studioHomepages/SectionsTable';
import { connect } from 'react-redux';
import {setValidAssignments, setSections} from '../teacherDashboard/teacherSectionsRedux';

const sectionsApiPath = '/dashboardapi/sections/';

const Sections = React.createClass({
  propTypes: {
    sections: React.PropTypes.array,
    codeOrgUrlPrefix: React.PropTypes.string.isRequired,
    isRtl: React.PropTypes.bool.isRequired,
    isTeacher: React.PropTypes.bool.isRequired,
    canLeave: React.PropTypes.bool.isRequired,
    validScripts: React.PropTypes.array,

    //Redux provided
    setSections: React.PropTypes.func.isRequired,
    setValidAssignments: React.PropTypes.func.isRequired,
  },

  componentDidMount(){
    const { setSections, setValidAssignments } = this.props;
    let validCourses;
    let sections;

    const onAsyncLoad = () => {
      if (validCourses && sections) {
        setValidAssignments(validCourses, this.props.validScripts);
        setSections(sections);
      }
    };

    $.getJSON('/dashboardapi/courses').then(response => {
      validCourses = response;
      onAsyncLoad();
    });

    $.getJSON(sectionsApiPath).done(response => {
      sections = response;
      onAsyncLoad();
    });
  },

  getInitialState() {
    return {
      sections: this.props.sections,
      sectionsAction: null,
      sectionsResult: null,
      sectionsResultName: null
    };
  },

  updateSections(sections) {
    this.setState({sections});
  },

  updateSectionsResult(action, result, name) {
    this.setState({
      sectionsAction: action,
      sectionsResult: result,
      sectionsResultName: name
    });
  },

  render() {
    const sections = this.state.sections;
    const { codeOrgUrlPrefix, isRtl, isTeacher, canLeave } = this.props;
    const editSectionsUrl = `${codeOrgUrlPrefix}/teacher-dashboard#/sections`;
    const enrolledInASection = sections.length === 0 ? false : true;
    const enrollmentDescription = isTeacher ? "" : i18n.enrollmentDescription();

    return (
      <div>
        <ContentContainer
          heading={i18n.sectionsTitle()}
          linkText={i18n.manageSections()}
          link={editSectionsUrl}
          showLink={isTeacher}
          isRtl={isRtl}
          description={enrollmentDescription}
        >
        {this.state.sectionsAction === "join" && this.state.sectionsResult === "success" && (
          <JoinSectionSuccessNotification sectionName={this.state.sectionsResultName}/>
        )}
        {this.state.sectionsAction === "leave" && this.state.sectionsResult === "success" && (
          <LeaveSectionSuccessNotification sectionName={this.state.sectionsResultName}/>
        )}
        {this.state.sectionsAction === "join" && this.state.sectionsResult === "section_notfound" && (
          <JoinSectionNotFoundNotification sectionId={this.state.sectionsResultName}/>
        )}
        {this.state.sectionsAction === "join" && this.state.sectionsResult === "fail" && (
          <JoinSectionFailNotification sectionId={this.state.sectionsResultName}/>
        )}
        {this.state.sectionsAction === "join" && this.state.sectionsResult === "exists" && (
          <JoinSectionExistsNotification sectionName={this.state.sectionsResultName}/>
        )}
        {isTeacher && sections.length > 0 && (
          <SectionsPage
            validScripts={this.props.validScripts}
          />
        )}
        {isTeacher && sections.length === 0 && (
          <SetUpMessage
            type="sections"
            codeOrgUrlPrefix={codeOrgUrlPrefix}
            isRtl={isRtl}
            isTeacher={isTeacher}
          />
        )}
        {!isTeacher && sections.length > 0 && (
          <SectionsTable
            sections={sections}
            isRtl={isRtl}
            isTeacher={isTeacher}
            canLeave={canLeave}
            updateSections={this.updateSections}
            updateSectionsResult={this.updateSectionsResult}
          />
        )}
        {!isTeacher && (
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
export default connect(state => ({}), {setValidAssignments, setSections})(Sections);

  const JoinSectionSuccessNotification = React.createClass({
  propTypes: {sectionName: React.PropTypes.string.isRequired},
  render() {
    return (
      <Notification
        type="success"
        notice={i18n.sectionsNotificationSuccess()}
        details={i18n.sectionsNotificationJoinSuccess({sectionName: this.props.sectionName})}
        dismissible={true}
      />
    );
  }
});

const LeaveSectionSuccessNotification = React.createClass({
  propTypes: {sectionName: React.PropTypes.string.isRequired},
  render() {
    return (
      <Notification
        type="success"
        notice={i18n.sectionsNotificationSuccess()}
        details={i18n.sectionsNotificationLeaveSuccess({sectionName: this.props.sectionName})}
        dismissible={true}
      />
    );
  }
});

const JoinSectionNotFoundNotification = React.createClass({
  propTypes: {sectionId: React.PropTypes.string.isRequired},
  render() {
    return (
      <Notification
        type="failure"
        notice={i18n.sectionsNotificationFailure()}
        details={i18n.sectionsNotificationJoinNotFound({sectionId: this.props.sectionId})}
        dismissible={true}
      />
    );
  }
});

const JoinSectionFailNotification = React.createClass({
  propTypes: {sectionId: React.PropTypes.string.isRequired},
  render() {
    return (
      <Notification
        type="failure"
        notice={i18n.sectionsNotificationFailure()}
        details={i18n.sectionsNotificationJoinFail({sectionId: this.props.sectionId})}
        dismissible={true}
      />
    );
  }
});

const JoinSectionExistsNotification = React.createClass({
  propTypes: {sectionName: React.PropTypes.string.isRequired},
  render() {
    return (
      <Notification
        type="warning"
        notice={i18n.sectionsNotificationSuccess()}
        details={i18n.sectionsNotificationJoinExists({sectionName: this.props.sectionName})}
        dismissible={true}
      />
    );
  }
});
