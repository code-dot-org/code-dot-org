import React from 'react';
import ReactDOM from 'react-dom';
import HeaderBanner from '../HeaderBanner';
import RecentCourses from './RecentCourses';
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
          header={i18n.myCourses()}
          isRtl={false}
          isTeacher={false}
        />

      </div>
    );
  }
});

export default StudentHomepage;
