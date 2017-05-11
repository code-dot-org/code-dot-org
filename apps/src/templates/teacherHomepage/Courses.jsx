import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import RecentCoursesCollapsible from './RecentCoursesCollapsible';
import CollapsibleSection from './CollapsibleSection';
import GradientNavCard from './GradientNavCard';
import color from "../../util/color";
import shapes from './shapes';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import i18n from "@cdo/locale";

const styles = {
  heading: {
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 20,
    fontSize: 24,
    fontFamily: 'Gotham 3r',
    zIndex: 2,
    color: color.charcoal,
    width: 940
  }
};

const Courses = React.createClass({
  propTypes: {
    courses: shapes.courses,
    isEnglish: React.PropTypes.bool.isRequired,
    isTeacher: React.PropTypes.bool.isRequired
  },

  componentDidMount() {
    // The components used here are are implemented in legacy HAML/CSS rather than React.
    if (this.props.isEnglish && this.props.isTeacher) {
      $('.courseexplorer').appendTo(ReactDOM.findDOMNode(this.refs.courseExplorer)).show();
      $('.tools').appendTo(ReactDOM.findDOMNode(this.refs.toolExplorer)).show();
    } else {
      $('.all-courses').appendTo(ReactDOM.findDOMNode(this.refs.allCourses)).show();
    }
  },

  render() {
    const { courses, isEnglish, isTeacher } = this.props;

    return (
      <div>
        {courses && (
          <RecentCoursesCollapsible courses={courses}/>
        )}

        {isEnglish && isTeacher && (
          <div>
            <div style={styles.heading}>
              {i18n.courseExplorerHeading()}
            </div>
            <div>
              {i18n.courseExplorerDescription()}
            </div>
            <ProtectedStatefulDiv ref="courseExplorer"/>

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

            <div style={styles.heading}>
              {i18n.toolExplorerHeading()}
            </div>
            <div>
              {i18n.toolExplorerDescription()}
            </div>
            <ProtectedStatefulDiv ref="toolExplorer"/>
          </div>
        )}

        {!(isEnglish && isTeacher) && (
          <div>
            <ProtectedStatefulDiv ref="allCourses"/>
          </div>
        )}
      </div>
    );
  }
});

export default Courses;
