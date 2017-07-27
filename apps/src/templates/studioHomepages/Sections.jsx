import React, {PropTypes} from 'react';
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
    sections: PropTypes.array,
    codeOrgUrlPrefix: PropTypes.string.isRequired,
    isRtl: PropTypes.bool.isRequired,
    isTeacher: PropTypes.bool.isRequired,
    canLeave: PropTypes.bool.isRequired,
    validScripts: PropTypes.array,

    //Redux provided
    setSections: PropTypes.func.isRequired,
    setValidAssignments: PropTypes.func.isRequired,
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
          <SectionNotifications
            action={this.state.sectionsAction}
            result={this.state.sectionsResult}
            nameOrId={this.state.sectionsResultName}
          />
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

const SectionNotifications = ({action, result, nameOrId}) => {
  if (action === 'join' && result === 'success') {
    return <JoinSectionSuccessNotification sectionName={nameOrId}/>;
  } else if (action === 'leave' && result === 'success') {
    return <LeaveSectionSuccessNotification sectionName={nameOrId}/>;
  } else if (action === 'join' && result === 'section_notfound') {
    return <JoinSectionNotFoundNotification sectionId={nameOrId}/>;
  } else if (action === 'join' && result === 'fail') {
    return <JoinSectionFailNotification sectionId={nameOrId}/>;
  } else if (action === 'join' && result === 'exists') {
    return <JoinSectionExistsNotification sectionName={nameOrId}/>;
  }
  return null;
};
SectionNotifications.propTypes = {
  action: PropTypes.string,
  result: PropTypes.string,
  nameOrId: PropTypes.string,
};

const JoinSectionSuccessNotification = React.createClass({
  propTypes: {sectionName: PropTypes.string.isRequired},
  render() {
    return (
      <Notification
        type="success"
        notice={i18n.sectionsNotificationSuccess()}
        details={i18n.sectionsNotificationJoinSuccess({sectionName: this.props.sectionName})}
        dismissible
      />
    );
  }
});

const LeaveSectionSuccessNotification = React.createClass({
  propTypes: {sectionName: PropTypes.string.isRequired},
  render() {
    return (
      <Notification
        type="success"
        notice={i18n.sectionsNotificationSuccess()}
        details={i18n.sectionsNotificationLeaveSuccess({sectionName: this.props.sectionName})}
        dismissible
      />
    );
  }
});

const JoinSectionNotFoundNotification = React.createClass({
  propTypes: {sectionId: PropTypes.string.isRequired},
  render() {
    return (
      <Notification
        type="failure"
        notice={i18n.sectionsNotificationFailure()}
        details={i18n.sectionsNotificationJoinNotFound({sectionId: this.props.sectionId})}
        dismissible
      />
    );
  }
});

const JoinSectionFailNotification = React.createClass({
  propTypes: {sectionId: PropTypes.string.isRequired},
  render() {
    return (
      <Notification
        type="failure"
        notice={i18n.sectionsNotificationFailure()}
        details={i18n.sectionsNotificationJoinFail({sectionId: this.props.sectionId})}
        dismissible
      />
    );
  }
});

const JoinSectionExistsNotification = React.createClass({
  propTypes: {sectionName: PropTypes.string.isRequired},
  render() {
    return (
      <Notification
        type="warning"
        notice={i18n.sectionsNotificationSuccess()}
        details={i18n.sectionsNotificationJoinExists({sectionName: this.props.sectionName})}
        dismissible
      />
    );
  }
});
