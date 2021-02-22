import PropTypes from 'prop-types';
import React, {Component} from 'react';
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
import {reducedLessonShape} from '@cdo/apps/templates/lessonOverview/lessonPlanShapes';

const styles = {
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
  titleNoTopMargin: {
    marginTop: 0
  }
};

class StudentLessonOverview extends Component {
  static propTypes = {
    lesson: reducedLessonShape.isRequired,

    // from redux
    announcements: PropTypes.arrayOf(announcementShape),
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

  createResourceListItem = resource => (
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
  );

  render() {
    const {lesson, announcements, isSignedIn} = this.props;
    let lessonResources = [];
    if (lesson.resources['Student']) {
      lessonResources = lessonResources.concat(lesson.resources['Student']);
    }
    if (lesson.resources['All']) {
      lessonResources = lessonResources.concat(lesson.resources['All']);
    }
    return (
      <div>
        <div className="lesson-overview-header">
          <div style={styles.header}>
            <a
              href={this.linkWithQueryParams(lesson.unit.link)}
              style={styles.navLink}
            >
              {`< ${lesson.unit.displayName}`}
            </a>
            <LessonNavigationDropdown lesson={lesson} />
          </div>
        </div>
        {isSignedIn && (
          <Announcements
            announcements={announcements}
            width={styleConstants['content-width']}
            viewAs={ViewType.Student}
          />
        )}
        <h1>
          {i18n.lessonNumbered({
            lessonNumber: lesson.position,
            lessonName: lesson.displayName
          })}
        </h1>
        {lesson.overview && (
          <div>
            <h2 style={styles.titleNoTopMargin}>{i18n.overview()}</h2>
            <SafeMarkdown markdown={lesson.overview} />
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
        {lessonResources.length > 0 && (
          <div id="resource-section">
            <h2>Resources</h2>
            <div>
              <ul>
                {lessonResources.map(resource =>
                  this.createResourceListItem(resource)
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export const UnconnectedStudentLessonOverview = StudentLessonOverview;

export default connect(state => ({
  announcements: state.announcements || [],
  isSignedIn: state.currentUser.signInState === SignInState.SignedIn
}))(StudentLessonOverview);
