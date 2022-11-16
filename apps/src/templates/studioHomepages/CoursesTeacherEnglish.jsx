import $ from 'jquery';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import ContentContainer from '../ContentContainer';
import {
  AdministratorResourcesActionBlock,
  CscInfoActionBlock
} from './TwoColumnActionBlock';
import {CourseBlocksHoc} from './CourseBlocks';
import CourseBlocksTools from './CourseBlocksTools';
import CourseBlocksTeacherGradeBands from './CourseBlocksTeacherGradeBands';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import i18n from '@cdo/locale';
import CourseBlocksWrapper from '@cdo/apps/templates/studioHomepages/CourseBlocksWrapper';

const TEACHER_CARDS = [
  {
    linkId: 'course-block-grade-band-elementary',
    linkClass: 'linktag',
    heading: i18n.courseBlocksGradeBandsElementary(),
    description: i18n.courseBlocksGradeBandsElementaryDescription(),
    buttonText: i18n.courseBlocksGradeBandsElementaryButton(),
    path: '/educate/curriculum/elementary-school'
  },
  {
    linkId: 'course-block-grade-band-middle',
    linkClass: 'linktag',
    heading: i18n.courseBlocksGradeBandsMiddle(),
    description: i18n.courseBlocksGradeBandsMiddleDescription(),
    buttonText: i18n.courseBlocksGradeBandsMiddleButton(),
    path: '/educate/curriculum/middle-school'
  },
  {
    linkId: 'course-block-grade-band-high',
    linkClass: 'linktag',
    heading: i18n.courseBlocksGradeBandsHigh(),
    description: i18n.courseBlocksGradeBandsHighDescription(),
    buttonText: i18n.courseBlocksGradeBandsHighButton(),
    path: '/educate/curriculum/high-school'
  }
];

/**
 * This is the main content for the Courses page for a teacher using English,
 * though it may also be shown for a signed-out user using English.
 */
class CoursesTeacherEnglish extends Component {
  static propTypes = {
    showAiCard: PropTypes.bool
  };

  componentDidMount() {
    // The components used here are implemented in legacy HAML/CSS rather than React.
    $('.courseexplorer')
      .appendTo(ReactDOM.findDOMNode(this.refs.courseExplorer))
      .show();
  }

  render() {
    return (
      <div>
        <div>
          <ContentContainer
            heading={i18n.courseExplorerHeading()}
            description={i18n.courseExplorerDescription()}
            link={'/home/#recent-courses'}
            linkText={i18n.viewMyRecentCourses()}
          >
            <ProtectedStatefulDiv ref="courseExplorer" />
          </ContentContainer>

          <CourseBlocksTeacherGradeBands />
          <CourseBlocksWrapper
            heading={i18n.courseBlocksGradeBandsContainerHeading()}
            description={i18n.courseBlocksGradeBandsContainerDescription()}
            cards={TEACHER_CARDS}
          />

          <CscInfoActionBlock />

          <CourseBlocksHoc />

          <CourseBlocksTools isEnglish showAiCard={this.props.showAiCard} />

          <AdministratorResourcesActionBlock />
        </div>
      </div>
    );
  }
}

export default CoursesTeacherEnglish;
