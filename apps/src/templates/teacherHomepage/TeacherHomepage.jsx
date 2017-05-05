import React from 'react';
import AnnouncementsCollapsible from './AnnouncementsCollapsible';
import RecentCoursesCollapsible from './RecentCoursesCollapsible';
import ManageSectionsCollapsible from './ManageSectionsCollapsible';
import CollapsibleSection from './CollapsibleSection';
import GradientNavCard from './GradientNavCard';
import i18n from "@cdo/locale";

const TeacherHomepage = React.createClass({
  propTypes: {
    courses: React.PropTypes.array,
    sections: React.PropTypes.array,
    announcements: React.PropTypes.array.isRequired,
  },

  render() {
    const { courses, sections, announcements } = this.props;

    return (
      <div>
        <AnnouncementsCollapsible announcements={announcements}/>

        <RecentCoursesCollapsible courses={courses}/>

        <ManageSectionsCollapsible sections={sections}/>

        <CollapsibleSection header={i18n.resources()}>
          <GradientNavCard
            title={i18n.teacherCommunity()}
            description={i18n.teacherCommunityDescription()}
            image="../../static/navcard-placeholder.png"
            buttonText={i18n.joinCommunity()}
            link="https://forum.code.org"
          />
          <GradientNavCard
            title={i18n.professionalLearning()}
            description={i18n.professionalLearningDescription()}
            image="../../static/navcard-placeholder.png"
            buttonText={i18n.learnMore()}
            link="/my-professional-learning"
          />
          <GradientNavCard
            title={i18n.standardsAndFramework()}
            description={i18n.standardsAndFrameworkDescription()}
            image="../../static/navcard-placeholder.png"
            buttonText={i18n.reviewDocuments()}
            link="https://code.org/teacher-dashboard#/plan"
          />
          <GradientNavCard
            title={i18n.findGuestSpeaker()}
            description={i18n.findGuestSpeakerDescription()}
            image="../../static/navcard-placeholder.png"
            buttonText={i18n.inspireStudents()}
            link="https://code.org/volunteer/local"
          />
        </CollapsibleSection>
      </div>
    );
  }
});

export default TeacherHomepage;
