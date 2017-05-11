import $ from 'jquery';
import React from 'react';
import RecentCoursesCollapsible from './RecentCoursesCollapsible';
import CollapsibleSection from './CollapsibleSection';
import GradientNavCard from './GradientNavCard';
import shapes from './shapes';
import i18n from "@cdo/locale";

const Courses = React.createClass({
  propTypes: {
    courses: shapes.courses,
    englishTeacher: React.PropTypes.bool.isRequired
  },

  componentDidMount() {
    if (this.props.englishTeacher) {
      $('.courseexplorer').appendTo(this.refs.courseExplorer).show();
      $('.tools').appendTo(this.refs.toolExplorer).show();
    } else {
      $('.all-courses').appendTo(this.refs.allCourses).show();
    }
  },

  render() {
    const { courses, englishTeacher } = this.props;

    return (
      <div>
        <RecentCoursesCollapsible courses={courses}/>

        {englishTeacher ? (
          <div>
            <div ref="courseExplorer"/>

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

            <div ref="toolExplorer"/>
          </div>
        ) : (
          <div>
            <div ref="allCourses"/>
          </div>
        )}
      </div>
    );
  }
});

export default Courses;
