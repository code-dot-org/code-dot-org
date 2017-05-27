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
          description={i18n.teacherCourseHocDescription()}
          image="hourofcode"
          buttonText={i18n.learnMore()}
          link={`${codeOrgUrlPrefix}/hourofcode/overview`}
        />
        <ResourceCard
          title={i18n.teacherCourseElementary()}
          description={i18n.teacherCourseElementaryDescription()}
          image="elementary"
          buttonText={i18n.learnMore()}
          link={`${codeOrgUrlPrefix}/educate/curriculum/elementary-school`}
        />
        <ResourceCard
          title={i18n.teacherCourseMiddle()}
          description={i18n.teacherCourseMiddleDescription()}
          image="middleschool"
          buttonText={i18n.learnMore()}
          link={`${codeOrgUrlPrefix}/educate/curriculum/middle-school`}
        />
        <ResourceCard
          title={i18n.teacherCourseHighOlder()}
          description={i18n.teacherCourseHighDescription()}
          image="highschool"
          buttonText={i18n.learnMore()}
          link={`${codeOrgUrlPrefix}/educate/curriculum/high-school`}
        />
      </CollapsibleSection>
    );
  }
});

export default TeacherCourses;
