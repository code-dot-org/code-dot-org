import PropTypes from 'prop-types';
import React, {Component} from 'react';
import CourseBlocksGradeBands from './CourseBlocksGradeBands';
import ContentContainer from '../ContentContainer';
import i18n from '@cdo/locale';

class CourseBlocksStudentGradeBands extends Component {
  static propTypes = {
    showContainer: PropTypes.bool.isRequired,
    hideBottomMargin: PropTypes.bool.isRequired
  };

  cards = [
    {
      heading: i18n.courseBlocksGradeBandsK5(),
      description: i18n.courseBlocksGradeBandsK5Description(),
      path: '/student/elementary'
    },
    {
      heading: i18n.courseBlocksGradeBands612(),
      description: i18n.courseBlocksGradeBands612Description(),
      path: '/student/middle-high'
    },
    {
      heading: i18n.courseBlocksGradeBandsUniversity(),
      description: i18n.courseBlocksGradeBandsUniversityDescription(),
      path: '/beyond'
    }
  ];

  render() {
    const {showContainer, hideBottomMargin} = this.props;
    const link = showContainer ? '/home/#recent-courses' : '';
    const linkText = showContainer ? i18n.viewMyRecentCourses() : '';
    const heading = showContainer
      ? i18n.courseBlocksGradeBandsContainerHeading()
      : '';
    const description = showContainer
      ? i18n.courseBlocksGradeBandsContainerDescription()
      : '';

    return (
      <ContentContainer
        link={link}
        linkText={linkText}
        heading={heading}
        description={description}
        hideBottomMargin={hideBottomMargin}
      >
        <CourseBlocksGradeBands cards={this.cards} />
      </ContentContainer>
    );
  }
}

export default CourseBlocksStudentGradeBands;
