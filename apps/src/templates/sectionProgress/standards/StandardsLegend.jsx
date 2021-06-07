import React, {Component} from 'react';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import ProgressBoxForLessonNumber from './ProgressBoxForLessonNumber';

export default class StandardsLegend extends Component {
  render() {
    return (
      <div style={{marginTop: 20}}>
        <table>
          <thead>
            <tr>
              <td>
                <h3 style={styles.header}>{i18n.lessonStatus()}</h3>
              </td>
            </tr>
            <tr>
              <th style={styles.th}>{i18n.notStarted()}</th>
              <th style={styles.th}>{i18n.inProgress()}</th>
              <th style={styles.th}>{i18n.completed()}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.td}>
                <div style={styles.completedBoxes}>
                  <ProgressBoxForLessonNumber
                    completed={false}
                    inProgress={false}
                    lessonNumber={10}
                  />
                </div>
              </td>
              <td style={styles.td}>
                <div style={styles.completedBoxes}>
                  <ProgressBoxForLessonNumber
                    completed={false}
                    inProgress={true}
                    lessonNumber={2}
                  />
                </div>
              </td>
              <td style={styles.td}>
                <div style={styles.completedBoxes}>
                  <ProgressBoxForLessonNumber
                    completed={true}
                    inProgress={false}
                    lessonNumber={8}
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

const styles = {
  header: {
    fontWeight: 'bold',
    color: color.charcoal,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: '24px'
  },
  th: {
    backgroundColor: color.lightest_gray,
    color: color.charcoal,
    border: `1px solid ${color.lightest_gray}`,
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 14,
    textAlign: 'center',
    padding: 15
  },
  td: {
    border: `1px solid ${color.lightest_gray}`,
    padding: 15
  },
  boxStyle: {
    margin: '0 auto'
  },
  completedBoxes: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center'
  }
};
