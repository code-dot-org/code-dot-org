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
          image="hourofcode"
          buttonText={i18n.learnMore()}
          link={`${codeOrgUrlPrefix}/hourofcode/overview`}
        />
        <ResourceCard
          title={i18n.teacherCourseElementary()}
          description={""}
          image="elementary"
          buttonText={i18n.learnMore()}
          link={`${codeOrgUrlPrefix}/educate/curriculum/elementary-school`}
        />
        <ResourceCard
          title={i18n.teacherCourseMiddle()}
          description={""}
          image="middleschool"
          buttonText={i18n.learnMore()}
          link={`${codeOrgUrlPrefix}/educate/curriculum/middle-school`}
        />
        <ResourceCard
          title={i18n.teacherCourseHighOlder()}
          description={""}
          image="highschool"
          buttonText={i18n.learnMore()}
          link={`${codeOrgUrlPrefix}/educate/curriculum/high-school`}
        />
      </CollapsibleSection>
    );
  }
});

export default TeacherCourses;
