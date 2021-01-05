import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Activity from '@cdo/apps/templates/lessonOverview/activities/Activity';
import i18n from '@cdo/locale';
import {announcementShape} from '@cdo/apps/code-studio/announcementsRedux';
import Announcements from '../../code-studio/components/progress/Announcements';
import {connect} from 'react-redux';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import InlineMarkdown from '@cdo/apps/templates/InlineMarkdown';
import styleConstants from '@cdo/apps/styleConstants';
import color from '@cdo/apps/util/color';
import LessonNavigationDropdown from '@cdo/apps/templates/lessonOverview/LessonNavigationDropdown';
import {lessonShape} from '@cdo/apps/templates/lessonOverview/lessonPlanShapes';
import LessonAgenda from '@cdo/apps/templates/lessonOverview/LessonAgenda';

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
  }
};

class LessonOverview extends Component {
  static propTypes = {
    lesson: lessonShape.isRequired,
    activities: PropTypes.array,

    // from redux
    announcements: PropTypes.arrayOf(announcementShape),
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    isSignedIn: PropTypes.bool.isRequired
  };

  linkWithQueryParams = link => {
    const queryParams = window.location.search || '';
    return link + queryParams;
  };

  normalizeUrl = url => {
    const httpRegex = /https?:\/\//;
    if (httpRegex.test(url)) {
      return url;
    } else {
      return 'https://' + url;
    }
  };

  compileResourceList = key => {
    const {lesson} = this.props;
    return (
      <ul>
        {lesson.resources[key].map(resource => (
          <li key={resource.key}>
            <a
              href={this.normalizeUrl(resource.url)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {resource.name}
            </a>
            {resource.type && ` -  ${resource.type}`}
            {resource.download_url && (
              <span>
                {' ('}
                <a
                  href={this.normalizeUrl(resource.download_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                >{`${i18n.download()}`}</a>
                {')'}
              </span>
            )}
          </li>
        ))}
      </ul>
    );
  };

  render() {
    const {lesson, announcements, isSignedIn, viewAs} = this.props;
    return (
      <div>
        <div style={styles.header}>
          <a
            href={this.linkWithQueryParams(lesson.unit.link)}
            style={styles.navLink}
          >
            {`< ${lesson.unit.displayName}`}
          </a>
          <LessonNavigationDropdown lesson={lesson} />
        </div>
        {isSignedIn && (
          <Announcements
            announcements={announcements}
            width={styleConstants['content-width']}
            viewAs={viewAs}
          />
        )}
        <h1>
          {lesson.lockable
            ? lesson.displayName
            : i18n.lessonNumbered({
                lessonNumber: lesson.position,
                lessonName: lesson.displayName
              })}
        </h1>

        <div style={styles.frontPage}>
          <div style={styles.left}>
            {lesson.overview && (
              <div>
                <h2 style={styles.titleNoTopMargin}>{i18n.overview()}</h2>
                <SafeMarkdown markdown={lesson.overview} />
              </div>
            )}
            {lesson.purpose && (
              <div>
                <h2>{i18n.purpose()}</h2>
                <SafeMarkdown markdown={lesson.purpose} />
              </div>
            )}
            {lesson.assessmentOpportunities && (
              <div>
                <h2>{i18n.assessmentOpportunities()}</h2>
                <SafeMarkdown markdown={lesson.assessmentOpportunities} />
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
                <SafeMarkdown markdown={lesson.preparation} />
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
                    {this.compileResourceList('Teacher')}
                  </div>
                )}
                {lesson.resources['Student'] && (
                  <div>
                    <h5>{i18n.forTheStudents()}</h5>
                    {this.compileResourceList('Student')}
                  </div>
                )}
                {lesson.resources['All'] && (
                  <div>
                    <h5>{i18n.forAll()}</h5>
                    {this.compileResourceList('All')}
                  </div>
                )}
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

export const UnconnectedLessonOverview = LessonOverview;

export default connect(state => ({
  announcements: state.announcements || [],
  isSignedIn: state.currentUser.signInState === SignInState.SignedIn,
  viewAs: state.viewAs
}))(LessonOverview);
