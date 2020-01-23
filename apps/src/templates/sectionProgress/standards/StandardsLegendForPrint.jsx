import React, {Component} from 'react';
import i18n from '@cdo/locale';
import ProgressBoxForLessonNumber from './ProgressBoxForLessonNumber';

const styles = {
  key: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  keyItems: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    margin: '0 10px'
  }
};

export default class StandardsLegend extends Component {
  render() {
    return (
      <div style={styles.key}>
        <strong>{i18n.key()}</strong>
        <span style={styles.keyItems}>
          {i18n.completedLessons()}
          <ProgressBoxForLessonNumber completed={true} lessonNumber={1} />
        </span>
        <span style={styles.keyItems}>
          {i18n.uncompeltedLessons()}
          <ProgressBoxForLessonNumber completed={false} lessonNumber={1} />
        </span>
      </div>
    );
  }
}
