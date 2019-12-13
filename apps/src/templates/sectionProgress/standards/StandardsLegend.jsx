import React, {Component} from 'react';
import ProgressBox from '@cdo/apps/templates/sectionProgress/ProgressBox';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

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
    flexDirection: 'row'
  }
};

export default class SummaryViewLegend extends Component {
  render() {
    return (
      <div style={{marginTop: 60}}>
        <table>
          <thead>
            <tr>
              <td>
                <h3 style={styles.header}>{i18n.lessonStatus()}</h3>
              </td>
            </tr>
            <tr>
              <th style={styles.th}>{i18n.notStarted()}</th>
              <th style={styles.th}>{i18n.completed()}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.td}>
                <ProgressBox
                  style={styles.boxStyle}
                  started={false}
                  incomplete={20}
                  imperfect={0}
                  perfect={0}
                  stageIsAllAssessment={false}
                  lessonNumber={10}
                />
              </td>
              <td style={styles.td}>
                <div style={styles.completedBoxes}>
                  <ProgressBox
                    style={styles.boxStyle}
                    started={true}
                    incomplete={0}
                    imperfect={0}
                    perfect={20}
                    stageIsAllAssessment={false}
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
