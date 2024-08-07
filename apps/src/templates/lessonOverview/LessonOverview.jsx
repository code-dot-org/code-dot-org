import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import {announcementShape} from '@cdo/apps/code-studio/announcementsRedux';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {PublishedState} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import styleConstants from '@cdo/apps/styleConstants';
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
import color from '@cdo/apps/util/color';
import currentLocale from '@cdo/apps/util/currentLocale';
import {linkWithQueryParams} from '@cdo/apps/utils';
import {DefaultLocale} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import Announcements from '../../code-studio/components/progress/Announcements';
import FontAwesome from '../../legacySharedComponents/FontAwesome';

import LessonStandards from './LessonStandards';
import StyledCodeBlock from './StyledCodeBlock';

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

    analyticsReporter.sendEvent(
      EVENTS.LESSON_OVERVIEW_PAGE_VISITED_EVENT,
      {
        lessonId: props.lesson.id,
        lessonName: props.lesson.displayName,
        lessonLink: document.location.pathname,
        referrer: document.referrer,
        unitName: props.lesson.unit.displayName,
        unitLink: props.lesson.unit.link,
      },
      PLATFORMS.BOTH
    );
  }

  recordAndHandleResource = (e, firehoseKey, action, url = null) => {
    e.preventDefault(); // Prevent navigation to url until callback
    const event =
      action === ResourceActions.NAVIGATE ? 'open-pdf' : 'print-from-browser';
    firehoseClient.putRecord(
      {
        study: 'pdf-click',
        study_group: 'lesson',
        event: event,
        data_json: JSON.stringify({
          name: this.props.lesson.key,
          pdfType: firehoseKey,
        }),
      },
      {
        includeUserId: true,
        callback: () => {
          if (action === ResourceActions.NAVIGATE && url) {
            window.location.href = url; // Navigate to the URL
          } else if (action === ResourceActions.PRINT) {
            window.print(); // Trigger the print dialog
          }
        },
      }
    );
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
            this.recordAndHandleResource(
              e,
              option.key,
              ResourceActions.NAVIGATE,
              option.url
            )
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
            this.recordAndHandleResource(e, WINDOW_PRINT, ResourceActions.PRINT)
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
          <div style={styles.header}>
            <a
              href={linkWithQueryParams(lesson.unit.link)}
              style={styles.navLink}
            >
              {`< ${lesson.unit.displayName}`}
            </a>
            <div style={styles.dropdowns}>
              <div style={{marginRight: 5}}>
                <DropdownButton
                  color={Button.ButtonColor.gray}
                  customText={
                    <div>
                      <FontAwesome icon="print" style={styles.icon} />
                      <span style={styles.customText}>
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
          <Announcements
            announcements={announcements}
            width={styleConstants['content-width']}
            viewAs={viewAs}
            firehoseAnalyticsData={{
              lesson_id: lesson.id,
            }}
          />
        )}
        {displayVerifiedResourcesNotification && (
          <VerifiedResourcesNotification
            width={styleConstants['content-width']}
            inLesson={true}
          />
        )}
        <h1>
          {i18n.lessonNumbered({
            lessonNumber: lesson.position,
            lessonName: lesson.displayName,
          })}
        </h1>
        <h2>{i18n.minutesLabel({number: lesson.duration})}</h2>
        <div style={styles.frontPage}>
          <div style={styles.left}>
            {lesson.overview && (
              <div>
                <h2 style={styles.titleNoTopMargin}>{i18n.overview()}</h2>
                <EnhancedSafeMarkdown
                  markdown={lesson.overview}
                  expandableImages
                />
              </div>
            )}
            {lesson.purpose && (
              <div>
                <h2>{i18n.purpose()}</h2>
                <EnhancedSafeMarkdown
                  markdown={lesson.purpose}
                  expandableImages
                />
              </div>
            )}
            {lesson.assessmentOpportunities && (
              <div>
                <h2>{i18n.assessmentOpportunities()}</h2>
                <EnhancedSafeMarkdown
                  markdown={lesson.assessmentOpportunities}
                  expandableImages
                />
              </div>
            )}
            {lesson.standards.length > 0 && (
              <div>
                <div style={styles.standardsHeaderAndButton}>
                  <h2>{i18n.standards()}</h2>
                  {lesson.courseVersionStandardsUrl && (
                    <Button
                      __useDeprecatedTag
                      color={Button.ButtonColor.gray}
                      href={lesson.courseVersionStandardsUrl}
                      style={{marginLeft: 50}}
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
                <h2>{i18n.crossCurricularOpportunities()}</h2>
                <LessonStandards standards={lesson.opportunityStandards} />
              </div>
            )}
            <h2>{i18n.agenda()}</h2>
            <LessonAgenda activities={this.props.activities} />
          </div>
          <div style={styles.right}>
            {lesson.objectives.length > 0 && (
              <div>
                <h2 style={styles.titleNoTopMargin}>{i18n.objectives()}</h2>
                <h5>{i18n.objectivesSubheading()}</h5>
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
                <h2>{i18n.preparation()}</h2>
                <EnhancedSafeMarkdown
                  markdown={lesson.preparation}
                  expandableImages
                />
              </div>
            )}
            {Object.keys(lesson.resources).length > 0 && (
              <div id="resource-section">
                <h2>{i18n.links()}</h2>
                <div style={styles.copyResourceWarningArea}>
                  <SafeMarkdown markdown={i18n.copyResourcesWarning()} />
                </div>
                {lesson.resources['Teacher'] && (
                  <div>
                    <h5>{i18n.forTheTeachers()}</h5>
                    <ResourceList
                      resources={lesson.resources['Teacher']}
                      pageType="teacher-lesson-plan"
                    />
                  </div>
                )}
                {lesson.resources['Student'] && (
                  <div>
                    <h5>{i18n.forTheStudents()}</h5>
                    <ResourceList
                      resources={lesson.resources['Student']}
                      pageType="teacher-lesson-plan"
                    />
                  </div>
                )}
                {lesson.resources['All'] && (
                  <div>
                    <h5>{i18n.forAll()}</h5>
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
                <h2 style={styles.titleNoTopMargin}>{i18n.vocabulary()}</h2>
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
                <h2 style={styles.titleNoTopMargin}>{i18n.introducedCode()}</h2>
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
        <h2>{i18n.teachingGuide()}</h2>
        {this.props.activities.map(activity => (
          <Activity activity={activity} key={activity.key} />
        ))}
        <CopyrightInfo />
      </div>
    );
  }
}

const styles = {
  frontPage: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 40,
  },
  customText: {
    margin: '0px 2px',
  },
  icon: {
    margin: '0px 2px',
    fontSize: 16,
    // we want our icon text to be a different size than our button text, which
    // requires we manually offset to get it centered properly
    position: 'relative',
    top: 1,
  },
  left: {
    width: '60%',
    paddingRight: 20,
  },
  right: {
    width: '40%',
    padding: '0px 10px 10px 20px',
    borderLeft: 'solid 1px #333',
  },
  header: {
    margin: '10px 0px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  navLink: {
    fontSize: 14,
    lineHeight: '22px',
    color: color.purple,
    margin: '10px 0px',
  },
  copyResourceWarningArea: {
    color: '#8a6d3b',
    backgroundColor: '#fcf8e3',
    border: '2px solid #f5e79e',
    borderRadius: 4,
    padding: '10px 10px 0px 10px',
  },
  titleNoTopMargin: {
    marginTop: 0,
  },
  dropdowns: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  standardsHeaderAndButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
};

export const UnconnectedLessonOverview = LessonOverview;

export default connect(state => ({
  announcements: state.announcements || [],
  isSignedIn: state.currentUser.signInState === SignInState.SignedIn,
  viewAs: state.viewAs,
  isVerifiedInstructor: state.verifiedInstructor.isVerified,
  hasVerifiedResources: state.verifiedInstructor.hasVerifiedResources,
}))(LessonOverview);
