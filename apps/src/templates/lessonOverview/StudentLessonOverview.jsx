import {Markdown, extensions} from '@code-dot-org/markdown';
import {Box, Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import {announcementShape} from '@cdo/apps/code-studio/announcementsRedux';
import {levelsForLessonId} from '@cdo/apps/code-studio/progressReduxSelectors';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import Button from '@cdo/apps/legacySharedComponents/Button';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import LessonNavigationDropdown from '@cdo/apps/templates/lessonOverview/LessonNavigationDropdown';
import {studentLessonShape} from '@cdo/apps/templates/lessonOverview/lessonPlanShapes';
import ResourceList from '@cdo/apps/templates/lessonOverview/ResourceList';
import ProgressLessonContent from '@cdo/apps/templates/progress/ProgressLessonContent';
import {levelWithProgressType} from '@cdo/apps/templates/progress/progressTypes';
import {linkWithQueryParams} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import Announcements from '../../code-studio/components/progress/Announcements';

import StyledCodeBlock from './StyledCodeBlock';

import styles from './lesson-plan.module.scss';

class StudentLessonOverview extends Component {
  static propTypes = {
    lesson: studentLessonShape.isRequired,

    // from redux
    lessonLevels: PropTypes.arrayOf(levelWithProgressType),
    announcements: PropTypes.arrayOf(announcementShape),
    isSignedIn: PropTypes.bool.isRequired,
  };

  renderLevels = () => {
    return this.props.lessonLevels?.length ? (
      <ProgressLessonContent
        levels={this.props.lessonLevels}
        disabled={false}
      />
    ) : (
      i18n.lessonContainsNoLevels()
    );
  };

  // Built once per instance: Markdown rebuilds its processor whenever the
  // extension list changes identity. The lookup reads current props.
  markdownExtensions = [
    // No expandableImages: the syntax appears only in activity section
    // descriptions, which ActivitySection renders.
    extensions.lenientHeadings,
    extensions.lenientLinkDestinations,
    extensions.visualCodeBlock,
    extensions.vocabularyDefinition({
      lookup: term => this.props.lesson.vocabularyDefinitions?.[term],
    }),
    extensions.inlineStyles,
    extensions.details,
  ];

  render() {
    const {lesson, announcements, isSignedIn} = this.props;
    return (
      <div className={styles.studentLessonOverview}>
        <div className="lesson-overview-header">
          <div className={styles.header}>
            <a
              href={linkWithQueryParams(lesson.unit.link)}
              className={styles.navLink}
            >
              {`< ${lesson.unit.displayName}`}
            </a>
            <div className={styles.headerActions}>
              {lesson.studentLessonPlanPdfUrl && (
                <Button
                  __useDeprecatedTag
                  color={Button.ButtonColor.gray}
                  download
                  href={lesson.studentLessonPlanPdfUrl}
                  className={styles.printButton}
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
            viewAs={ViewType.Participant}
          />
        )}
        <Typography variant="h2" component="h1" sx={{mb: 1}}>
          {lesson.title}
        </Typography>
        {lesson.overview && (
          <Box sx={{mb: 1}}>
            <Typography
              variant="h4"
              component="h2"
              className={styles.titleNoTopMargin}
            >
              {i18n.overview()}
            </Typography>
            <Markdown
              content={lesson.overview}
              extensions={this.markdownExtensions}
              bodyVariant="body4"
            />
          </Box>
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
                  <Markdown
                    inline
                    content={`**${vocab.word}** - ${vocab.definition}`}
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
        {lesson.resources.length > 0 && (
          <div id="resource-section">
            <Typography variant="h4" component="h2">
              {i18n.resources()}
            </Typography>
            <ResourceList
              resources={lesson.resources}
              pageType="student-lesson-plan"
            />
          </div>
        )}
        <div id="level-section">
          <Typography variant="h4" component="h2">
            {i18n.levels()}
          </Typography>
          {this.renderLevels()}
        </div>
      </div>
    );
  }
}

export const UnconnectedStudentLessonOverview = StudentLessonOverview;

export default connect((state, ownProps) => ({
  announcements: state.announcements || [],
  isSignedIn: state.currentUser.signInState === SignInState.SignedIn,
  lessonLevels: levelsForLessonId(state.progress, ownProps.lesson.id),
}))(StudentLessonOverview);
