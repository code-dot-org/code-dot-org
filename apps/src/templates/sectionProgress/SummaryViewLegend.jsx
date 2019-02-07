import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ProgressBox from './ProgressBox';
import color from "@cdo/apps/util/color";
import i18n from '@cdo/locale';

const styles = {
  header: {
    fontWeight: 'bold',
    color: color.charcoal,
  },
  th: {
    backgroundColor: color.lightest_gray,
    color: color.charcoal,
    border: `1px solid ${color.lightest_gray}`,
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 14,
    textAlign: 'center',
    padding: 15,
  },
  td: {
    border: `1px solid ${color.lightest_gray}`,
    padding: 15,
  },
  boxStyle: {
    margin: '0 auto',
  }
};

export default class SummaryViewLegend extends Component {
  static propTypes = {
    showCSFProgressBox: PropTypes.bool
  };

  render() {
    const {showCSFProgressBox} = this.props;

    return (
      <div style={{marginTop: 30}}>
        <h4 style={styles.header}>{i18n.lessonStatus()}</h4>
        <table>
          <thead>
            <tr>
              <th style={styles.th}>{i18n.notStarted()}</th>
              <th style={styles.th}>{i18n.inProgress()}</th>
              <th style={styles.th}>
                {i18n.completed()}
                {showCSFProgressBox &&
                  <span>
                    <br/>
                    {`(${i18n.perfect()})`}
                  </span>
                }
              </th>
              {showCSFProgressBox &&
                <th style={styles.th}>
                  {i18n.completed()}
                  <br/>
                  {`(${i18n.tooManyBlocks()})`}
                </th>
              }
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
                />
              </td>
              <td style={styles.td}>
                <ProgressBox
                  style={styles.boxStyle}
                  started={true}
                  incomplete={20}
                  imperfect={0}
                  perfect={0}
                />
              </td>
              <td style={styles.td}>
                <ProgressBox
                  style={styles.boxStyle}
                  started={true}
                  incomplete={0}
                  imperfect={0}
                  perfect={20}
                />
              </td>
              {showCSFProgressBox &&
                <td style={styles.td}>
                  <ProgressBox
                    style={styles.boxStyle}
                    started={true}
                    incomplete={0}
                    imperfect={20}
                    perfect={0}
                  />
                </td>
              }
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}
