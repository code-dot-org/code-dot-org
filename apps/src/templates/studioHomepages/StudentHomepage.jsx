import React from 'react';
import ReactDOM from 'react-dom';
import HeaderBanner from '../HeaderBanner';
import RecentCourses from './RecentCourses';
import StudentResources from './StudentResources';
import shapes from './shapes';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import i18n from "@cdo/locale";

const styles = {
  userHero: {
    paddingTop: 10
  }
};

const StudentHomepage = React.createClass({
  propTypes: {
    courses: shapes.courses
  },

  componentDidMount() {
    // The component used here is implemented in legacy HAML/CSS rather than React.
    $('#user_hero').appendTo(ReactDOM.findDOMNode(this.refs.userHero)).show();
  },

  render() {
    const { courses } = this.props;

    return (
      <div>
        <HeaderBanner
          headingText={i18n.homepageHeading()}
        />

        <ProtectedStatefulDiv
          style={styles.userHero}
          ref="userHero"
        />

        <RecentCourses
          courses={courses}
          showAllCoursesLink={true}
          header={i18n.recentCourses()}
          isRtl={false}
        />

        <StudentResources/>

      </div>
    );
  }
});

export default StudentHomepage;
