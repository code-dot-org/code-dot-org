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
    const {lesson, announcements, isSignedIn} = this.props;
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
        {Object.keys(lesson.resources).length > 0 && (
          <div id="resource-section">
            <h2>Resources</h2>
            {lesson.resources['Student'] && (
              <div>{this.compileResourceList('Student')}</div>
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
    );
  }
}

export const UnconnectedStudentLessonOverview = StudentLessonOverview;

export default connect(state => ({
  announcements: state.announcements || [],
  isSignedIn: state.currentUser.signInState === SignInState.SignedIn
}))(StudentLessonOverview);
