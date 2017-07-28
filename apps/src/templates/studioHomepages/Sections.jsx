import React, {PropTypes} from 'react';
import $ from 'jquery';
import ContentContainer from '../ContentContainer';
import SetUpMessage from './SetUpMessage';
import JoinSection from './JoinSection';
import Notification from '@cdo/apps/templates/Notification';
import i18n from "@cdo/locale";
import SectionsPage from '../teacherDashboard/SectionsPage';
import SectionsTable from '../studioHomepages/SectionsTable';
import { connect } from 'react-redux';
import {setValidAssignments, setSections} from '../teacherDashboard/teacherSectionsRedux';
import experiments from '@cdo/apps/util/experiments';

const sectionsApiPath = '/dashboardapi/sections/';

const Sections = React.createClass({
  propTypes: {
    sections: React.PropTypes.array,
    codeOrgUrlPrefix: React.PropTypes.string.isRequired,
    isRtl: React.PropTypes.bool.isRequired,
    isTeacher: React.PropTypes.bool.isRequired,
    canLeave: React.PropTypes.bool.isRequired,
    validScripts: React.PropTypes.array,
    teacherHomepage: React.PropTypes.bool,

    //Redux provided
    setSections: PropTypes.func.isRequired,
    setValidAssignments: PropTypes.func.isRequired,
    numSections: PropTypes.number.isRequired,
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
    const { numSections } = this.props;
    const sections = this.state.sections;
    const { codeOrgUrlPrefix, isRtl, isTeacher, canLeave } = this.props;
    const editSectionsUrl = `${codeOrgUrlPrefix}/teacher-dashboard#/sections`;
    const enrolledInASection = sections.length === 0 ? false : true;
    const enrollmentDescription = isTeacher ? "" : i18n.enrollmentDescription();
    const sectionFlow2017 = experiments.isEnabled('section-flow-2017');

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
          <SectionNotifications
            action={this.state.sectionsAction}
            result={this.state.sectionsResult}
            nameOrId={this.state.sectionsResultName}
          />
          {isTeacher && numSections > 0 && sectionFlow2017 && (
            <SectionsPage
              className="sectionPage"
              validScripts={this.props.validScripts}
              teacherHomepage={this.props.teacherHomepage}
            />
          )}
          {numSections > 0 && !sectionFlow2017 && (
            <SectionsTable
              sections={sections}
              isRtl={isRtl}
              isTeacher={isTeacher}
              canLeave={canLeave}
              updateSections={this.updateSections}
              updateSectionsResult={this.updateSectionsResult}
            />
          )}
          {isTeacher && numSections === 0 && (
            <SetUpMessage
              type="sections"
              codeOrgUrlPrefix={codeOrgUrlPrefix}
              isRtl={isRtl}
              isTeacher={isTeacher}
            />
          )}
          {!isTeacher && numSections > 0 && (
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
export default connect(state => ({numSections: state.teacherSections.sectionIds.length}), {setValidAssignments, setSections})(Sections);

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
