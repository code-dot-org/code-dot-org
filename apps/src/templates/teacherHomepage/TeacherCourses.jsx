import React from 'react';
import ResourceCard from './ResourceCard';
import CollapsibleSection from './CollapsibleSection';
import i18n from "@cdo/locale";

const TeacherCourses = React.createClass({
  propTypes: {
    codeOrgUrlPrefix: React.PropTypes.string.isRequired
  },

  render() {
    const codeOrgUrlPrefix = this.props.codeOrgUrlPrefix;

    return (
      <CollapsibleSection header={i18n.resources()}>
        <ResourceCard
          title={i18n.teacherCourseHoc()}
          description={""}
          image="../../static/navcard-placeholder.png"
          buttonText={i18n.learnMore()}
          link={`${codeOrgUrlPrefix}/hourofcode/all`}
        />
        <ResourceCard
          title={i18n.teacherCourseElementary()}
          description={""}
          image="../../static/navcard-placeholder.png"
          buttonText={i18n.learnMore()}
          link={`${codeOrgUrlPrefix}/educate/curriculum/elementary-school`}
        />
        <ResourceCard
          title={i18n.teacherCourseMiddle()}
          description={""}
          image="../../static/navcard-placeholder.png"
          buttonText={i18n.learnMore()}
          link={`${codeOrgUrlPrefix}/educate/curriculum/middle-school`}
        />
        <ResourceCard
          title={i18n.teacherCourseHighOlder()}
          description={""}
          image="../../static/navcard-placeholder.png"
          buttonText={i18n.learnMore()}
          link={`${codeOrgUrlPrefix}/educate/curriculum/high-school`}
        />
      </CollapsibleSection>
    );
  }
});

export default TeacherCourses;
