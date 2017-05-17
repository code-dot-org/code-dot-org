import React from 'react';
import RecentCoursesCollapsible from './RecentCoursesCollapsible';
import CollapsibleSection from './CollapsibleSection';
import ResourceCard from './ResourceCard';
import shapes from './shapes';
import i18n from "@cdo/locale";

const StudentHomepage = React.createClass({
  propTypes: {
    courses: shapes.courses
  },

  render() {
    const { courses } = this.props;

    return (
      <div>
        <RecentCoursesCollapsible
          courses={courses}
          showAllCoursesLink={true}
        />

        <CollapsibleSection header={i18n.resources()}>
          <ResourceCard
            title={i18n.courses()}
            description={i18n.coursesCardDescription()}
            image="../../static/navcard-placeholder.png"
            buttonText={i18n.coursesCardAction()}
            link="/courses"
          />
          <ResourceCard
            title={i18n.projectGalleryCard()}
            description={i18n.projectGalleryCardDescription()}
            image="../../static/navcard-placeholder.png"
            buttonText={i18n.projectGalleryCardAction()}
            link="/gallery"
          />
        </CollapsibleSection>
      </div>
    );
  }
});

export default StudentHomepage;
