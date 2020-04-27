import React, {Component} from 'react';
import i18n from '@cdo/locale';
import ProgressBoxForLessonNumber from './ProgressBoxForLessonNumber';

const styles = {
  key: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  keyItems: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    margin: '0 10px'
  }
};

export default class StandardsLegendForPrint extends Component {
  render() {
    return (
      <div style={styles.key}>
        <strong>{i18n.keyWithColon()}</strong>
        <span style={styles.keyItems}>
          {i18n.completedLessons()}
          <ProgressBoxForLessonNumber completed={true} lessonNumber={1} />
        </span>
        <span style={styles.keyItems}>
          {i18n.uncompletedLessons()}
          <ProgressBoxForLessonNumber completed={false} lessonNumber={1} />
        </span>
      </div>
    );
  }
}
