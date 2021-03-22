import PropTypes from 'prop-types';
import React, {Component} from 'react';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import InlineMarkdown from '@cdo/apps/templates/InlineMarkdown';
import {studio} from '@cdo/apps/lib/util/urlHelpers';
import ResourceList from '@cdo/apps/templates/lessonOverview/ResourceList';

const styles = {
  main: {
    width: '100%'
  },
  header: {
    backgroundColor: color.purple,
    color: color.white,
    border: 'solid 1px' + color.charcoal,
    padding: '0px 10px'
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
    padding: 10
  }
};

export default class RollupLessonEntry extends Component {
  static propTypes = {
    objectToRollUp: PropTypes.string,
    lesson: PropTypes.object
  };

  /* TO DO: Do something nice when there are no things in that lesson */

  render() {
    return (
      <div style={styles.main}>
        <div style={styles.header}>
          <h3>
            {i18n.lessonNumbered({
              lessonNumber: this.props.lesson.position,
              lessonName: this.props.lesson.displayName
            })}
          </h3>
        </div>
        <div style={styles.object}>
          <h4>{this.props.objectToRollUp}</h4>
        </div>
        <div style={styles.entries}>
          {this.props.objectToRollUp === 'Vocabulary' &&
            this.props.lesson.vocabularies.map(vocab => (
              <li key={vocab.key}>
                <InlineMarkdown
                  markdown={`**${vocab.word}** - ${vocab.definition}`}
                />
              </li>
            ))}
          {this.props.objectToRollUp === 'Code' &&
            this.props.lesson.programmingExpressions.map(expression => (
              <li key={expression.name}>
                <a
                  href={studio(expression.link)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {expression.name}
                </a>
              </li>
            ))}
          {this.props.objectToRollUp === 'Resources' && (
            <div>
              {this.props.lesson.resources['Teacher'] && (
                <div>
                  <h5>{i18n.forTheTeachers()}</h5>
                  <ResourceList
                    resources={this.props.lesson.resources['Teacher']}
                  />
                </div>
              )}
              {this.props.lesson.resources['Student'] && (
                <div>
                  <h5>{i18n.forTheStudents()}</h5>
                  <ResourceList
                    resources={this.props.lesson.resources['Student']}
                  />
                </div>
              )}
              {this.props.lesson.resources['All'] && (
                <div>
                  <h5>{i18n.forAll()}</h5>
                  <ResourceList
                    resources={this.props.lesson.resources['All']}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}
