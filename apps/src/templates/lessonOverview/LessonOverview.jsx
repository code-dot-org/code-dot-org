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
import Button from '@cdo/apps/templates/Button';
import DropdownButton from '@cdo/apps/templates/DropdownButton';
import LessonAgenda from '@cdo/apps/templates/lessonOverview/LessonAgenda';

const styles = {
  frontPage: {
    display: 'flex',
    flexDirection: 'row'
  },
  left: {
    width: '60%'
  },
  right: {
    width: '40%',
    padding: 10,
    borderLeft: 'solid 1px black'
  },
  header: {
    margin: '10px 0px',
    display: 'flex',
    justifyContent: 'space-between'
  },
  navLink: {
    fontSize: 18,
    color: color.purple
  },
  dropdown: {
    display: 'inline-block'
  }
};

class LessonOverview extends Component {
  static propTypes = {
    lesson: PropTypes.shape({
      unit: PropTypes.shape({
        displayName: PropTypes.string.isRequired,
        link: PropTypes.string.isRequired,
        lessons: PropTypes.arrayOf(
          PropTypes.shape({
            displayName: PropTypes.string.isRequired,
            link: PropTypes.string.isRequired,
            position: PropTypes.number.isRequired,
            lockable: PropTypes.bool.isRequired
          })
        ).isRequired
      }).isRequired,
      position: PropTypes.number.isRequired,
      lockable: PropTypes.bool.isRequired,
      displayName: PropTypes.string.isRequired,
      overview: PropTypes.string.isRequired,
      purpose: PropTypes.string.isRequired,
      preparation: PropTypes.string.isRequired,
      resources: PropTypes.object.isRequired,
      objectives: PropTypes.arrayOf(PropTypes.object).isRequired
    }).isRequired,
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
            <a href={this.normalizeUrl(resource.url)} target="_blank">
              {resource.name}
            </a>
            {resource.type && ` -  ${resource.type}`}
            {resource.download_url && (
              <span>
                {' ('}
                <a
                  href={this.normalizeUrl(resource.download_url)}
                  target="_blank"
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
          <div style={styles.dropdown}>
            <DropdownButton
              text={i18n.otherLessonsInUnit()}
              color={Button.ButtonColor.purple}
            >
              {lesson.unit.lessons.map((l, index) => (
                <a key={index} href={this.linkWithQueryParams(l.link)}>
                  {l.lockable
                    ? l.displayName
                    : `${l.position} ${l.displayName}`}
                </a>
              ))}
            </DropdownButton>
          </div>
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
            <h2>{i18n.overview()}</h2>
            <SafeMarkdown markdown={lesson.overview} />

            <h2>{i18n.purpose()}</h2>
            <SafeMarkdown markdown={lesson.purpose} />

            <h2>{i18n.agenda()}</h2>
            <LessonAgenda activities={this.props.activities} />
          </div>
          <div style={styles.right}>
            {lesson.objectives.length > 0 && (
              <div>
                <h2>{i18n.objectives()}</h2>
                <h3>{i18n.objectivesSubheading()}</h3>
                <ul>
                  {lesson.objectives.map(objective => (
                    <li key={objective.id}>
                      <InlineMarkdown markdown={objective.description} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <h2>{i18n.preparation()}</h2>
            <SafeMarkdown markdown={lesson.preparation} />
            {Object.keys(lesson.resources).length > 0 && (
              <div id="resource-section">
                <h2>{i18n.links()}</h2>
                {lesson.resources['Teacher'] && (
                  <div>
                    <h3>{i18n.forTheTeachers()}</h3>
                    {this.compileResourceList('Teacher')}
                  </div>
                )}
                {lesson.resources['Student'] && (
                  <div>
                    <h3>{i18n.forTheStudents()}</h3>
                    {this.compileResourceList('Student')}
                  </div>
                )}
                {lesson.resources['All'] && (
                  <div>
                    <h3>{i18n.forAll()}</h3>
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
