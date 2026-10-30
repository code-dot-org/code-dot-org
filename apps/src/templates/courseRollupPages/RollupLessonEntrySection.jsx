import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import InlineMarkdown from '@cdo/apps/templates/InlineMarkdown';
import LessonStandards, {
  ExpandMode,
} from '@cdo/apps/templates/lessonOverview/LessonStandards';
import ResourceList from '@cdo/apps/templates/lessonOverview/ResourceList';
import i18n from '@cdo/locale';

import StyledCodeBlock from '../lessonOverview/StyledCodeBlock';

import {lessonShape} from './rollupShapes';

import style from './courseRollup.module.scss';

export default class RollupLessonEntrySection extends Component {
  static propTypes = {
    objectToRollUp: PropTypes.string,
    lesson: lessonShape,
  };

  render() {
    let lessonHasResources =
      this.props.lesson.resources['Teacher'] ||
      this.props.lesson.resources['Student'] ||
      this.props.lesson.resources['All'];

    return (
      <div className={style.section}>
        {(this.props.objectToRollUp === 'Resources' ||
          this.props.objectToRollUp === 'Prep') && (
          <div className={style.sectionObject}>
            <Typography
              variant="inherit"
              component="h4"
              className={style.sectionHeading}
            >
              {this.props.objectToRollUp === 'Resources'
                ? i18n.resources()
                : i18n.preparation()}
            </Typography>
          </div>
        )}
        <div className={style.sectionEntries}>
          {this.props.objectToRollUp === 'Vocabulary' &&
            this.props.lesson.vocabularies.length > 0 &&
            this.props.lesson.vocabularies.map(vocab => (
              <li key={vocab.key}>
                <InlineMarkdown
                  markdown={`**${vocab.word}** - ${vocab.definition}`}
                />
              </li>
            ))}
          {this.props.objectToRollUp === 'Vocabulary' &&
            this.props.lesson.vocabularies.length <= 0 && (
              <Typography
                variant="inherit"
                component="p"
                className={style.emptyMessage}
              >
                {i18n.rollupNoVocab()}
              </Typography>
            )}
          {this.props.objectToRollUp === 'Code' &&
            this.props.lesson.programmingExpressions.length > 0 && (
              <ul>
                {this.props.lesson.programmingExpressions.map(expression => (
                  <li key={expression.name}>
                    <StyledCodeBlock programmingExpression={expression} />
                  </li>
                ))}
              </ul>
            )}
          {this.props.objectToRollUp === 'Code' &&
            this.props.lesson.programmingExpressions.length <= 0 && (
              <Typography
                variant="inherit"
                component="p"
                className={style.emptyMessage}
              >
                {i18n.rollupNoCode()}
              </Typography>
            )}
          {this.props.objectToRollUp === 'Resources' && lessonHasResources && (
            <div>
              {this.props.lesson.resources['Teacher'] && (
                <div>
                  <Typography
                    variant="inherit"
                    component="h5"
                    className={style.resourceHeading}
                  >
                    {i18n.forTheTeachers()}
                  </Typography>
                  <ResourceList
                    resources={this.props.lesson.resources['Teacher']}
                    pageType="resources-rollup"
                  />
                </div>
              )}
              {this.props.lesson.resources['Student'] && (
                <div>
                  <Typography
                    variant="inherit"
                    component="h5"
                    className={style.resourceHeading}
                  >
                    {i18n.forTheStudents()}
                  </Typography>
                  <ResourceList
                    resources={this.props.lesson.resources['Student']}
                    pageType="resources-rollup"
                  />
                </div>
              )}
              {this.props.lesson.resources['All'] && (
                <div>
                  <Typography
                    variant="inherit"
                    component="h5"
                    className={style.resourceHeading}
                  >
                    {i18n.forAll()}
                  </Typography>
                  <ResourceList
                    resources={this.props.lesson.resources['All']}
                    pageType="resources-rollup"
                  />
                </div>
              )}
            </div>
          )}
          {this.props.objectToRollUp === 'Resources' && !lessonHasResources && (
            <Typography
              variant="inherit"
              component="p"
              className={style.emptyMessage}
            >
              {i18n.rollupNoResources()}
            </Typography>
          )}
          {this.props.objectToRollUp === 'Prep' &&
            this.props.lesson.preparation && (
              <EnhancedSafeMarkdown
                markdown={this.props.lesson.preparation}
                expandableImages
              />
            )}
          {this.props.objectToRollUp === 'Prep' &&
            !this.props.lesson.preparation && (
              <Typography
                variant="inherit"
                component="p"
                className={style.emptyMessage}
              >
                {i18n.rollupNoPrep()}
              </Typography>
            )}
          {this.props.objectToRollUp === 'Standards' &&
            this.props.lesson.standards.length > 0 && (
              <LessonStandards
                standards={this.props.lesson.standards}
                expandMode={ExpandMode.ALL}
              />
            )}
          {this.props.objectToRollUp === 'Standards' &&
            this.props.lesson.standards.length <= 0 && (
              <Typography
                variant="inherit"
                component="p"
                className={style.emptyMessage}
              >
                {i18n.rollupNoStandards()}
              </Typography>
            )}
        </div>
      </div>
    );
  }
}
