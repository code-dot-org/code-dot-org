import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import {announcementShape} from '@cdo/apps/code-studio/announcementsRedux';
import Announcements from '../../code-studio/components/progress/Announcements';
import {connect} from 'react-redux';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import InlineMarkdown from '@cdo/apps/templates/InlineMarkdown';
import styleConstants from '@cdo/apps/styleConstants';
import color from '@cdo/apps/util/color';
import LessonNavigationDropdown from '@cdo/apps/templates/lessonOverview/LessonNavigationDropdown';
import ResourceList from '@cdo/apps/templates/lessonOverview/ResourceList';
import {studentLessonShape} from '@cdo/apps/templates/lessonOverview/lessonPlanShapes';
import {linkWithQueryParams} from '@cdo/apps/utils';
import Button from '@cdo/apps/templates/Button';
import StyledCodeBlock from './StyledCodeBlock';

class StudentLessonOverview extends Component {
  static propTypes = {
    lesson: studentLessonShape.isRequired,

    // from redux
    announcements: PropTypes.arrayOf(announcementShape),
    isSignedIn: PropTypes.bool.isRequired
  };

  render() {
    const {lesson, announcements, isSignedIn} = this.props;
    return (
      <div>
        <div className="lesson-overview-header">
          <div style={styles.header}>
            <a
              href={linkWithQueryParams(lesson.unit.link)}
              style={styles.navLink}
            >
              {`< ${lesson.unit.displayName}`}
            </a>
            <div>
              {lesson.studentLessonPlanPdfUrl && (
                <Button
                  __useDeprecatedTag
                  color={Button.ButtonColor.gray}
                  download
                  href={lesson.studentLessonPlanPdfUrl}
                  style={{marginRight: 10}}
                  target="_blank"
                  text={i18n.print()}
                />
              )}
              <LessonNavigationDropdown
                lesson={lesson}
                isStudentLessonPlan={true}
              />
            </div>
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
            <EnhancedSafeMarkdown
              markdown={lesson.overview}
              expandableImages={true}
            />
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
        {lesson.resources.length > 0 && (
          <div id="resource-section">
            <h2>{i18n.resources()}</h2>
            <ResourceList
              resources={lesson.resources}
              pageType="student-lesson-plan"
            />
          </div>
        )}
      </div>
    );
  }
}

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

export const UnconnectedStudentLessonOverview = StudentLessonOverview;

export default connect(state => ({
  announcements: state.announcements || [],
  isSignedIn: state.currentUser.signInState === SignInState.SignedIn
}))(StudentLessonOverview);
