import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import {announcementShape} from '@cdo/apps/code-studio/announcementsRedux';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {PublishedState} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import CopyrightInfo from '@cdo/apps/templates/CopyrightInfo';
import VerifiedResourcesNotification from '@cdo/apps/templates/courseOverview/VerifiedResourcesNotification';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import DropdownButton from '@cdo/apps/templates/DropdownButton';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import InlineMarkdown from '@cdo/apps/templates/InlineMarkdown';
import Activity from '@cdo/apps/templates/lessonOverview/activities/Activity';
import LessonAgenda from '@cdo/apps/templates/lessonOverview/LessonAgenda';
import LessonNavigationDropdown from '@cdo/apps/templates/lessonOverview/LessonNavigationDropdown';
import {lessonShape} from '@cdo/apps/templates/lessonOverview/lessonPlanShapes';
import ResourceList from '@cdo/apps/templates/lessonOverview/ResourceList';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import currentLocale from '@cdo/apps/util/currentLocale';
import {linkWithQueryParams} from '@cdo/apps/utils';
import {DefaultLocale} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import Announcements from '../../code-studio/components/progress/Announcements';
import FontAwesome from '../../legacySharedComponents/FontAwesome';

import LessonStandards from './LessonStandards';
import StyledCodeBlock from './StyledCodeBlock';

import styles from './lesson-plan.module.scss';

const ResourceActions = {
  PRINT: 'print',
  NAVIGATE: 'navigate',
};

const WINDOW_PRINT = 'windowPrint';

class LessonOverview extends Component {
  static propTypes = {
    lesson: lessonShape.isRequired,
    activities: PropTypes.array,

    // from redux
    announcements: PropTypes.arrayOf(announcementShape),
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    isSignedIn: PropTypes.bool.isRequired,
    isVerifiedInstructor: PropTypes.bool.isRequired,
    hasVerifiedResources: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);

    analyticsReporter.sendEvent(EVENTS.LESSON_OVERVIEW_PAGE_VISITED_EVENT, {
      lessonId: props.lesson.id,
      lessonName: props.lesson.displayName,
      lessonLink: document.location.pathname,
      referrer: document.referrer,
      unitName: props.lesson.unit.displayName,
      unitLink: props.lesson.unit.link,
    });
  }

  handleResource = (e, action, url = null) => {
    e.preventDefault(); // Prevent navigation to url until callback
    if (action === ResourceActions.NAVIGATE && url) {
      window.location.href = url; // Navigate to the URL
    } else if (action === ResourceActions.PRINT) {
      window.print(); // Trigger the print dialog
    }
    return false;
  };

  compilePdfDropdownOptions = () => {
    const {lessonPlanPdfUrl, scriptResourcesPdfUrl, unit} = this.props.lesson;

    const showOverviewPDFOption =
      unit.publishedState !== PublishedState.pilot &&
      unit.publishedState !== PublishedState.in_development;

    const options = [];
    if (lessonPlanPdfUrl && showOverviewPDFOption) {
      options.push({
        key: 'singleLessonPlan',
        name: i18n.printLessonPlan(),
        url: lessonPlanPdfUrl,
      });
    }
    if (scriptResourcesPdfUrl) {
      options.push({
        key: 'scriptResources',
        name: i18n.printHandouts(),
        url: scriptResourcesPdfUrl,
      });
    }
    return options;
  };

  renderPrintOptions = () => {
    const pdfDropdownOptions = this.compilePdfDropdownOptions();

    if (pdfDropdownOptions.length > 0 && currentLocale() === DefaultLocale) {
      return pdfDropdownOptions.map(option => (
        <a
          key={option.key}
          onClick={e =>
            this.handleResource(e, ResourceActions.NAVIGATE, option.url)
          }
          href={option.url}
        >
          {option.name}
        </a>
      ));
    } else {
      return [
        <a
          key={WINDOW_PRINT}
          onClick={e =>
            this.handleResource(e, WINDOW_PRINT, ResourceActions.PRINT)
          }
          href="#"
        >
          {i18n.printLessonPlan()}
        </a>,
      ];
    }
  };

  render() {
    const {
      lesson,
      announcements,
      isSignedIn,
      viewAs,
      isVerifiedInstructor,
      hasVerifiedResources,
    } = this.props;

    const displayVerifiedResourcesNotification =
      viewAs === ViewType.Instructor &&
      !isVerifiedInstructor &&
      hasVerifiedResources;

    return (
      <div className="lesson-overview">
        <div className="lesson-overview-header">
          <div className={styles.header}>
            <a
              href={linkWithQueryParams(lesson.unit.link)}
              className={styles.navLink}
            >
              {`< ${lesson.unit.displayName}`}
            </a>
            <div className={styles.dropdowns}>
              <div className={styles.printDropdown}>
                <DropdownButton
                  color={Button.ButtonColor.gray}
                  customText={
                    <div>
                      <FontAwesome icon="print" className={styles.printIcon} />
                      <span className={styles.customText}>
                        {i18n.printingOptions()}
                      </span>
                    </div>
                  }
                >
                  {this.renderPrintOptions()}
                </DropdownButton>
              </div>
              <LessonNavigationDropdown lesson={lesson} />
            </div>
          </div>
        </div>
        {isSignedIn && (
          <Announcements announcements={announcements} viewAs={viewAs} />
        )}
        {displayVerifiedResourcesNotification && (
          <VerifiedResourcesNotification inLesson={true} />
        )}
        <Typography variant="h2" component="h1" className="uitest-lesson-title">
          {lesson.title}
        </Typography>
        <Typography variant="h4" component="h2">
          {i18n.minutesLabel({number: lesson.duration})}
        </Typography>
        <div className={styles.frontPage}>
          <div className={styles.left}>
            {lesson.overview && (
              <div>
                <Typography
                  variant="h4"
                  component="h2"
                  className={styles.titleNoTopMargin}
                >
                  {i18n.overview()}
                </Typography>
                <EnhancedSafeMarkdown
                  markdown={lesson.overview}
                  expandableImages
                />
              </div>
            )}
            {lesson.purpose && (
              <div>
                <Typography variant="h4" component="h2">
                  {i18n.purpose()}
                </Typography>
                <EnhancedSafeMarkdown
                  markdown={lesson.purpose}
                  expandableImages
                />
              </div>
            )}
            {lesson.assessmentOpportunities && (
              <div>
                <Typography variant="h4" component="h2">
                  {i18n.assessmentOpportunities()}
                </Typography>
                <EnhancedSafeMarkdown
                  markdown={lesson.assessmentOpportunities}
                  expandableImages
                />
              </div>
            )}
            {lesson.standards.length > 0 && (
              <div>
                <div className={styles.standardsHeaderAndButton}>
                  <Typography variant="h4" component="h2">
                    {i18n.standards()}
                  </Typography>
                  {lesson.courseVersionStandardsUrl && (
                    <Button
                      __useDeprecatedTag
                      color={Button.ButtonColor.gray}
                      href={lesson.courseVersionStandardsUrl}
                      className={styles.fullCourseAlignmentButton}
                      target="_blank"
                      text={i18n.fullCourseAlignment()}
                    />
                  )}
                </div>
                <LessonStandards standards={lesson.standards} />
              </div>
            )}
            {lesson.opportunityStandards.length > 0 && (
              <div>
                <Typography variant="h4" component="h2">
                  {i18n.crossCurricularOpportunities()}
                </Typography>
                <LessonStandards standards={lesson.opportunityStandards} />
              </div>
            )}
            <Typography variant="h4" component="h2">
              {i18n.agenda()}
            </Typography>
            <LessonAgenda activities={this.props.activities} />
          </div>
          <div className={styles.right}>
            {lesson.objectives.length > 0 && (
              <div>
                <Typography
                  variant="h4"
                  component="h2"
                  className={styles.titleNoTopMargin}
                >
                  {i18n.objectives()}
                </Typography>
                <Typography variant="h5" component="h3">
                  {i18n.objectivesSubheading()}
                </Typography>
                <ul>
                  {lesson.objectives.map(objective => (
                    <li key={objective.id}>
                      <InlineMarkdown markdown={objective.description} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {lesson.preparation && (
              <div>
                <Typography variant="h4" component="h2">
                  {i18n.preparation()}
                </Typography>
                <EnhancedSafeMarkdown
                  markdown={lesson.preparation}
                  expandableImages
                />
              </div>
            )}
            {Object.keys(lesson.resources).length > 0 && (
              <div id="resource-section">
                <Typography variant="h4" component="h2">
                  {i18n.links()}
                </Typography>
                <div className={styles.copyResourceWarningArea}>
                  <SafeMarkdown markdown={i18n.copyResourcesWarning()} />
                </div>
                {lesson.resources['Teacher'] && (
                  <div>
                    <Typography variant="h5" component="h3">
                      {i18n.forTheTeachers()}
                    </Typography>
                    <ResourceList
                      resources={lesson.resources['Teacher']}
                      pageType="teacher-lesson-plan"
                    />
                  </div>
                )}
                {lesson.resources['Student'] && (
                  <div>
                    <Typography variant="h5" component="h3">
                      {i18n.forTheStudents()}
                    </Typography>
                    <ResourceList
                      resources={lesson.resources['Student']}
                      pageType="teacher-lesson-plan"
                    />
                  </div>
                )}
                {lesson.resources['All'] && (
                  <div>
                    <Typography variant="h5" component="h3">
                      {i18n.forAll()}
                    </Typography>
                    <ResourceList
                      resources={lesson.resources['All']}
                      pageType="teacher-lesson-plan"
                    />
                  </div>
                )}
              </div>
            )}

            {lesson.vocabularies.length > 0 && (
              <div>
                <Typography
                  variant="h4"
                  component="h2"
                  className={styles.titleNoTopMargin}
                >
                  {i18n.vocabulary()}
                </Typography>
                <ul>
                  {lesson.vocabularies.map(vocab => (
                    <li key={vocab.key}>
                      <InlineMarkdown
                        markdown={`**${vocab.word}** - ${vocab.definition}`}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {lesson.programmingExpressions.length > 0 && (
              <div id="unit-test-introduced-code">
                <Typography
                  variant="h4"
                  component="h2"
                  className={styles.titleNoTopMargin}
                >
                  {i18n.introducedCode()}
                </Typography>
                <ul>
                  {lesson.programmingExpressions.map(expression => (
                    <li key={expression.name}>
                      <StyledCodeBlock programmingExpression={expression} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <Typography variant="h2">{i18n.teachingGuide()}</Typography>
        {this.props.activities.map(activity => (
          <Activity activity={activity} key={activity.key} />
        ))}
        <CopyrightInfo />
      </div>
    );
  }
}

export const UnconnectedLessonOverview = LessonOverview;

export default connect(state => ({
  announcements: state.announcements || [],
  isSignedIn: state.currentUser.signInState === SignInState.SignedIn,
  viewAs: state.viewAs,
  isVerifiedInstructor: state.verifiedInstructor.isVerified,
  hasVerifiedResources: state.verifiedInstructor.hasVerifiedResources,
}))(LessonOverview);
