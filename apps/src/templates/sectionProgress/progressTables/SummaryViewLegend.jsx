import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ProgressBox from '@cdo/apps/templates/sectionProgress/ProgressBox';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

export default class SummaryViewLegend extends Component {
  static propTypes = {
    showCSFProgressBox: PropTypes.bool
  };

  render() {
    const {showCSFProgressBox} = this.props;
    const headerColSpan = showCSFProgressBox ? 2 : 3;

    return (
      <div style={{marginTop: 60}}>
        <table>
          <thead>
            <tr>
              <td colSpan={headerColSpan}>
                <h3 style={styles.header}>{i18n.lessonStatus()}</h3>
              </td>
              {showCSFProgressBox && (
                <td colSpan={2}>
                  <h3 style={styles.header}>{i18n.completionStatus()}</h3>
                </td>
              )}
            </tr>
            <tr>
              <th style={styles.th}>{i18n.notStarted()}</th>
              <th style={styles.th}>{i18n.inProgress()}</th>
              <th style={styles.th}>
                {i18n.completed()}
                {showCSFProgressBox && (
                  <span>
                    <br />
                    {`(${i18n.perfect()})`}
                  </span>
                )}
              </th>
              {showCSFProgressBox && (
                <th style={styles.th}>
                  {i18n.completed()}
                  <br />
                  {`(${i18n.tooManyBlocks()})`}
                </th>
              )}
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
                  lessonIsAllAssessment={false}
                />
              </td>
              <td style={styles.td}>
                <ProgressBox
                  style={styles.boxStyle}
                  started={true}
                  incomplete={20}
                  imperfect={0}
                  perfect={0}
                  lessonIsAllAssessment={false}
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
                    lessonIsAllAssessment={false}
                  />
                  <ProgressBox
                    style={styles.boxStyle}
                    started={true}
                    incomplete={0}
                    imperfect={0}
                    perfect={20}
                    lessonIsAllAssessment={true}
                  />
                </div>
              </td>
              {showCSFProgressBox && (
                <td style={styles.td}>
                  <ProgressBox
                    style={styles.boxStyle}
                    started={true}
                    incomplete={0}
                    imperfect={20}
                    perfect={0}
                    lessonIsAllAssessment={false}
                  />
                </td>
              )}
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
    textAlign: 'center'
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
