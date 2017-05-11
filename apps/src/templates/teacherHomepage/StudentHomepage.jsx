import React from 'react';
import RecentCoursesCollapsible from './RecentCoursesCollapsible';
import CollapsibleSection from './CollapsibleSection';
import GradientNavCard from './GradientNavCard';
import shapes from './shapes';
import i18n from "@cdo/locale";

const StudentHomepage = React.createClass({
  propTypes: {
    courses: shapes.courses
  },

  componentDidMount() {
    $('#user_hero').appendTo(this.refs.userHero).show();
  },

  render() {
    const { courses } = this.props;

    return (
      <div>
        <div ref="userHero"/>

        <RecentCoursesCollapsible courses={courses}/>

        <CollapsibleSection header={i18n.resources()}>
          <GradientNavCard
            title={i18n.courses()}
            description={i18n.coursesCardDescription()}
            image="../../static/navcard-placeholder.png"
            buttonText={i18n.coursesCardAction()}
            link="/courses"
          />
          <GradientNavCard
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
