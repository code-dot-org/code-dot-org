import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import ResourceCard from './ResourceCard';
import ContentContainer from '../ContentContainer';
import i18n from "@cdo/locale";
import {CourseBlocksHoc} from './CourseBlocks';

const styles = {
  horizontalSpacer: {
    width: 20,
    height: 1,
    float: 'left'
  }
};

const TeacherAssignablesCatalog = React.createClass({
  propTypes: {
    codeOrgUrlPrefix: React.PropTypes.string.isRequired,
    isRtl: React.PropTypes.bool.isRequired
  },

  componentDidMount() {
    // The components used here are implemented in legacy HAML/CSS rather than React.
    $('.hour-of-code-courses').appendTo(ReactDOM.findDOMNode(this.refs.hocCourses)).show();
  },

  render() {
    const { codeOrgUrlPrefix, isRtl } = this.props;

    return (
      <div>
        <ContentContainer
          heading={i18n.teacherCoursesHeading()}
          description={i18n.teacherCoursesDescription()}
          isRtl={isRtl}
        >
          <ResourceCard
            isJumbo={true}
            title={i18n.teacherCourseElementary()}
            description={i18n.teacherCourseElementaryDescription()}
            buttonText={i18n.learnMore()}
            link={`${codeOrgUrlPrefix}/educate/curriculum/elementary-school`}
            isRtl={isRtl}
          />
          <div style={styles.horizontalSpacer}/>
          <ResourceCard
            isJumbo={true}
            title={i18n.teacherCourseMiddle()}
            description={i18n.teacherCourseMiddleDescription()}
            buttonText={i18n.learnMore()}
            link={`${codeOrgUrlPrefix}/educate/curriculum/middle-school`}
            isRtl={isRtl}
          />
          <div style={styles.horizontalSpacer}/>
          <ResourceCard
            isJumbo={true}
            title={i18n.teacherCourseHighOlder()}
            description={i18n.teacherCourseHighDescription()}
            buttonText={i18n.learnMore()}
            link={`${codeOrgUrlPrefix}/educate/curriculum/high-school`}
            isRtl={isRtl}
          />
        </ContentContainer>

        <ContentContainer
          heading={i18n.teacherCourseHoc()}
          description={i18n.teacherCourseHocDescription()}
          isRtl={isRtl}
          linkText={i18n.teacherCourseHocLinkText()}
          link={`${codeOrgUrlPrefix}/hourofcode/overview`}
          showLink={true}
        >
          <CourseBlocksHoc rowCount={2}/>
        </ContentContainer>
      </div>
    );
  }
});

export default TeacherAssignablesCatalog;
