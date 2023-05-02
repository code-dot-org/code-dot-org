import $ from 'jquery';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import ContentContainer from '../ContentContainer';
import {
  AdministratorResourcesActionBlock,
  CscInfoActionBlock,
} from './TwoColumnActionBlock';
import {CourseBlocksHoc} from './CourseBlocks';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import ProfessionalLearningSkinnyBanner from '../ProfessionalLearningSkinnyBanner';
import i18n from '@cdo/locale';
import CourseBlocksWrapper from '@cdo/apps/templates/studioHomepages/CourseBlocksWrapper';
import {
  TeacherGradeBandCards,
  ToolsAIExtrasCard,
  ToolsWidgetsCard,
  ToolsCards,
} from '@cdo/apps/util/courseBlockCardsConstants';

/**
 * This is the main content for the Courses page for a teacher using English,
 * though it may also be shown for a signed-out user using English.
 */
class CoursesTeacherEnglish extends Component {
  static propTypes = {
    showAiCard: PropTypes.bool,
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
          <ProfessionalLearningSkinnyBanner />

          <ContentContainer
            heading={i18n.courseExplorerHeading()}
            description={i18n.courseExplorerDescription()}
            link={'/home/#recent-courses'}
            linkText={i18n.viewMyRecentCourses()}
          >
            <ProtectedStatefulDiv ref="courseExplorer" />
          </ContentContainer>

          <CourseBlocksWrapper
            heading={i18n.courseBlocksGradeBandsContainerHeading()}
            description={i18n.courseBlocksGradeBandsContainerDescription()}
            cards={TeacherGradeBandCards}
          />

          <CscInfoActionBlock />

          <CourseBlocksHoc />

          <div id="uitest-course-blocks-tools">
            <CourseBlocksWrapper
              heading={i18n.courseBlocksToolsTitleTeacher()}
              description={i18n.standaloneToolsDescription()}
              cards={
                this.props.showAiCard
                  ? ToolsCards.concat(ToolsAIExtrasCard)
                  : ToolsCards.concat(ToolsWidgetsCard)
              }
            />
          </div>

          <AdministratorResourcesActionBlock />
        </div>
      </div>
    );
  }
}

export default CoursesTeacherEnglish;
