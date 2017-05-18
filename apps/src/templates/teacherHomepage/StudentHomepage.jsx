import React from 'react';
import ReactDOM from 'react-dom';
import HeadingBanner from '../HeadingBanner';
import RecentCoursesCollapsible from './RecentCoursesCollapsible';
import CollapsibleSection from './CollapsibleSection';
import ResourceCard from './ResourceCard';
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
        <HeadingBanner
          headingText={i18n.studentHomepageHeadingText()}
          subHeadingText={i18n.studentHomepageSubHeadingText()}
        />

        <ProtectedStatefulDiv
          style={styles.userHero}
          ref="userHero"
        />

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
