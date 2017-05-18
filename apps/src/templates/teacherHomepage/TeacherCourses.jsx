import React from 'react';
import ResourceCard from './ResourceCard';
import CollapsibleSection from './CollapsibleSection';
import i18n from "@cdo/locale";

const TeacherCourses = React.createClass({

  render() {

    return (
      <CollapsibleSection header={i18n.resources()}>
        <ResourceCard
          title={i18n.teacherCourseHoc()}
          description={""}
          image="../../static/navcard-placeholder.png"
          buttonText={i18n.learnMore()}
          link="https://hourofcode.com"
        />
        <ResourceCard
          title={i18n.teacherCourseElementary()}
          description={""}
          image="../../static/navcard-placeholder.png"
          buttonText={i18n.learnMore()}
          link="/courses"
        />
        <ResourceCard
          title={i18n.teacherCourseMiddle()}
          description={""}
          image="../../static/navcard-placeholder.png"
          buttonText={i18n.learnMore()}
          link="/courses"
        />
        <ResourceCard
          title={i18n.teacherCourseHighOlder()}
          description={""}
          image="../../static/navcard-placeholder.png"
          buttonText={i18n.learnMore()}
          link="/courses"
        />
      </CollapsibleSection>
    );
  }
});

export default TeacherCourses;
