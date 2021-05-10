import PropTypes from 'prop-types';
import React, {Component} from 'react';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import InlineMarkdown from '@cdo/apps/templates/InlineMarkdown';
import ResourceList from '@cdo/apps/templates/lessonOverview/ResourceList';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import LessonStandards, {
  ExpandMode
} from '@cdo/apps/templates/lessonOverview/LessonStandards';
import StyledCodeBlock from '../lessonOverview/StyledCodeBlock';
import {lessonShape} from './rollupShapes';

export default class RollupLessonEntrySection extends Component {
  static propTypes = {
    objectToRollUp: PropTypes.string,
    lesson: lessonShape
  };

  render() {
    let lessonHasResources =
      this.props.lesson.resources['Teacher'] ||
      this.props.lesson.resources['Student'] ||
      this.props.lesson.resources['All'];

    return (
      <div style={styles.main}>
        {(this.props.objectToRollUp === 'Resources' ||
          this.props.objectToRollUp === 'Prep') && (
          <div style={styles.object}>
            <h4>{this.props.objectToRollUp}</h4>
          </div>
        )}
        <div style={styles.entries}>
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
              <p>{i18n.rollupNoVocab()}</p>
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
              <p>{i18n.rollupNoCode()}</p>
            )}
          {this.props.objectToRollUp === 'Resources' && lessonHasResources && (
            <div>
              {this.props.lesson.resources['Teacher'] && (
                <div>
                  <h5>{i18n.forTheTeachers()}</h5>
                  <ResourceList
                    resources={this.props.lesson.resources['Teacher']}
                    pageType="resources-rollup"
                  />
                </div>
              )}
              {this.props.lesson.resources['Student'] && (
                <div>
                  <h5>{i18n.forTheStudents()}</h5>
                  <ResourceList
                    resources={this.props.lesson.resources['Student']}
                    pageType="resources-rollup"
                  />
                </div>
              )}
              {this.props.lesson.resources['All'] && (
                <div>
                  <h5>{i18n.forAll()}</h5>
                  <ResourceList
                    resources={this.props.lesson.resources['All']}
                    pageType="resources-rollup"
                  />
                </div>
              )}
            </div>
          )}
          {this.props.objectToRollUp === 'Resources' && !lessonHasResources && (
            <p>{i18n.rollupNoResources()}</p>
          )}
          {this.props.objectToRollUp === 'Prep' &&
            this.props.lesson.preparation && (
              <EnhancedSafeMarkdown
                markdown={this.props.lesson.preparation}
                expandableImages
              />
            )}
          {this.props.objectToRollUp === 'Prep' &&
            !this.props.lesson.preparation && <p>{i18n.rollupNoPrep()}</p>}
          {this.props.objectToRollUp === 'Standards' &&
            this.props.lesson.standards.length > 0 && (
              <LessonStandards
                standards={this.props.lesson.standards}
                expandMode={ExpandMode.ALL}
              />
            )}
          {this.props.objectToRollUp === 'Standards' &&
            this.props.lesson.standards.length <= 0 && (
              <p>{i18n.rollupNoStandards()}</p>
            )}
        </div>
      </div>
    );
  }
}

const styles = {
  main: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  object: {
    backgroundColor: color.lightest_gray,
    color: color.charcoal,
    border: 'solid 1px' + color.charcoal,
    padding: '0px 10px'
  },
  entries: {
    color: color.charcoal,
    border: 'solid 1px' + color.charcoal,
    padding: 10,
    height: '100%'
  }
};
