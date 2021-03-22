import PropTypes from 'prop-types';
import React, {Component} from 'react';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import RollupLessonEntrySection from './RollupLessonEntrySection';

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
    display: 'flex',
    flexDirection: 'row'
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
        <div style={styles.entries}>
          <RollupLessonEntrySection
            objectToRollUp={this.props.objectToRollUp}
            lesson={this.props.lesson}
          />
          {this.props.objectToRollUp === 'Resources' && (
            <RollupLessonEntrySection
              objectToRollUp={'Prep'}
              lesson={this.props.lesson}
            />
          )}
        </div>
      </div>
    );
  }
}
