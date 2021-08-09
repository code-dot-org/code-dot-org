import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import Activity from '@cdo/apps/templates/lessonOverview/activities/Activity';
import Button from '@cdo/apps/templates/Button';
import DropdownButton from '@cdo/apps/templates/DropdownButton';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import InlineMarkdown from '@cdo/apps/templates/InlineMarkdown';
import LessonAgenda from '@cdo/apps/templates/lessonOverview/LessonAgenda';
import LessonNavigationDropdown from '@cdo/apps/templates/lessonOverview/LessonNavigationDropdown';
import {linkWithQueryParams} from '@cdo/apps/utils';
import ResourceList from '@cdo/apps/templates/lessonOverview/ResourceList';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import styleConstants from '@cdo/apps/styleConstants';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {announcementShape} from '@cdo/apps/code-studio/announcementsRedux';
import {lessonShape} from '@cdo/apps/templates/lessonOverview/lessonPlanShapes';
import Announcements from '../../code-studio/components/progress/Announcements';
import LessonStandards from './LessonStandards';
import StyledCodeBlock from './StyledCodeBlock';
import VerifiedResourcesNotification from '@cdo/apps/templates/courseOverview/VerifiedResourcesNotification';

class LessonOverview extends Component {
  static propTypes = {
    lesson: lessonShape.isRequired,
    activities: PropTypes.array,

    // from redux
    announcements: PropTypes.arrayOf(announcementShape),
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    isSignedIn: PropTypes.bool.isRequired,
    isVerifiedTeacher: PropTypes.bool.isRequired,
    hasVerifiedResources: PropTypes.bool.isRequired
  };

  recordAndNavigateToPdf = (e, firehoseKey, url) => {
    // Prevent navigation to url until callback
    e.preventDefault();
    firehoseClient.putRecord(
      {
        study: 'pdf-click',
        study_group: 'lesson',
        event: 'open-pdf',
        data_json: JSON.stringify({
          name: this.props.lesson.key,
          pdfType: firehoseKey
        })
      },
      {
        includeUserId: true,
        callback: () => {
          window.location.href = url;
        }
      }
    );
    return false;
  };

  compilePdfDropdownOptions = () => {
    const {lessonPlanPdfUrl, scriptResourcesPdfUrl} = this.props.lesson;
    const options = [];
    if (lessonPlanPdfUrl) {
      options.push({
        key: 'singleLessonPlan',
        name: i18n.printLessonPlan(),
        url: lessonPlanPdfUrl
      });
    }
    if (scriptResourcesPdfUrl) {
      options.push({
        key: 'scriptResources',
        name: i18n.printHandouts(),
        url: scriptResourcesPdfUrl
      });
    }
    return options;
  };

  render() {
    const {
      lesson,
      announcements,
      isSignedIn,
      viewAs,
      isVerifiedTeacher,
      hasVerifiedResources
    } = this.props;

    const displayVerifiedResourcesNotification =
      viewAs === ViewType.Teacher && !isVerifiedTeacher && hasVerifiedResources;

    const pdfDropdownOptions = this.compilePdfDropdownOptions();

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
              {pdfDropdownOptions.length > 0 && (
                <div style={{marginRight: 5}}>
                  <DropdownButton
                    color={Button.ButtonColor.gray}
                    text={i18n.printingOptions()}
                  >
                    {pdfDropdownOptions.map(option => (
                      <a
                        key={option.key}
                        onClick={e =>
                          this.recordAndNavigateToPdf(e, option.key, option.url)
                        }
                        href={option.url}
                      >
                        {option.name}
                      </a>
                    ))}
                  </DropdownButton>
                </div>
              )}
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
              lesson_id: lesson.id
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
            lessonName: lesson.displayName
          })}
        </h1>

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
      </div>
    );
  }
}

const styles = {
  frontPage: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 40
  },
  left: {
    width: '60%',
    paddingRight: 20
  },
  right: {
    width: '40%',
    padding: '0px 10px 10px 20px',
    borderLeft: 'solid 1px #333'
  },
  header: {
    margin: '10px 0px',
    display: 'flex',
    justifyContent: 'space-between'
  },
  navLink: {
    fontSize: 14,
    lineHeight: '22px',
    color: color.purple,
    margin: '10px 0px'
  },
  copyResourceWarningArea: {
    color: '#8a6d3b',
    backgroundColor: '#fcf8e3',
    border: '2px solid #f5e79e',
    borderRadius: 4,
    padding: '10px 10px 0px 10px'
  },
  titleNoTopMargin: {
    marginTop: 0
  },
  dropdowns: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  standardsHeaderAndButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  }
};

export const UnconnectedLessonOverview = LessonOverview;

export default connect(state => ({
  announcements: state.announcements || [],
  isSignedIn: state.currentUser.signInState === SignInState.SignedIn,
  viewAs: state.viewAs,
  isVerifiedTeacher: state.verifiedTeacher.isVerified,
  hasVerifiedResources: state.verifiedTeacher.hasVerifiedResources
}))(LessonOverview);
