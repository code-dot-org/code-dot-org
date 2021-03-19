import PropTypes from 'prop-types';
import React, {Component} from 'react';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import InlineMarkdown from '@cdo/apps/templates/InlineMarkdown';

const styles = {
  main: {
    width: '100%'
  },
  header: {
    backgroundColor: color.purple,
    color: color.white,
    border: 'solid 1px' + color.charcoal
  },
  object: {
    backgroundColor: color.lightest_gray,
    color: color.charcoal,
    border: 'solid 1px' + color.charcoal
  },
  entries: {
    color: color.charcoal,
    border: 'solid 1px' + color.charcoal
  }
};

export default class RollupLessonEntry extends Component {
  static propTypes = {
    lesson: PropTypes.object
  };

  render() {
    return (
      <div style={styles.main}>
        <div style={styles.header}>
          {i18n.lessonNumbered({
            lessonNumber: this.props.lesson.position,
            lessonName: this.props.lesson.displayName
          })}
        </div>
        <div style={styles.object}>Vocabulary</div>
        <div style={styles.entries}>
          {this.props.lesson.vocabularies.map(vocab => (
            <li key={vocab.key}>
              <InlineMarkdown
                markdown={`**${vocab.word}** - ${vocab.definition}`}
              />
            </li>
          ))}
        </div>
      </div>
    );
  }
}
