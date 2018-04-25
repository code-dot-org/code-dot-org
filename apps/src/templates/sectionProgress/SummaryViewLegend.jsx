import React, { PropTypes, Component } from 'react';
import ProgressBox from './ProgressBox';
import color from "@cdo/apps/util/color";
import i18n from '@cdo/locale';

const styles = {
  legendBox: {
    borderWidth: 1,
    float: 'left',
    display: 'inline-block',
    marginTop: 20,
    boxSizing: 'content-box',
  },
  progressBox: {
    float: 'left',
    width: 130,
    borderColor: color.lightest_gray,
    borderWidth: 2,
    borderBottomStyle: 'solid',
    borderRightStyle: 'solid',
  },
  leftBorder: {
    borderColor: color.lightest_gray,
    borderWidth: 2,
    borderLeftStyle: 'solid',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color.charcoal,
    float: 'left',
    paddingTop: 10,
    paddingBottom: 10,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: 900,
    color: color.charcoal,
  },
  parenthetical: {
    fontSize: 10,
    color: color.charcoal,
  },
  labelBox: {
    padding: 10,
    height: 60,
    width: '100%',
    backgroundColor: color.lightest_gray,
  },
  boxContainer: {
    padding: '15px 30px',
  }
};

export default class SummaryViewLegend extends Component {
  static propTypes = {
    showCSFProgressBox: PropTypes.bool
  };

  render() {
    const { showCSFProgressBox } = this.props;
    const headingStyle = {
      ...styles.heading,
      width: showCSFProgressBox ? '48%' : '100%'
    };

    return (
      <div style={styles.legendBox}>
        <div>
          <div style={headingStyle}>{i18n.levelStatus()}</div>
          {showCSFProgressBox &&
            <div style={headingStyle}>{i18n.completionStatus()}</div>
          }
        </div>
        <div style={styles.progressBox}>
          <div style={styles.labelBox}>
            <div>{i18n.notStarted()}</div>
          </div>
          <div style={{...styles.boxContainer, ...styles.leftBorder}}>
            <ProgressBox
              started={false}
              incomplete={20}
              imperfect={0}
              perfect={0}
            />
          </div>
        </div>
        <div style={styles.progressBox}>
          <div style={styles.labelBox}>
            <div>{i18n.inProgress()}</div>
          </div>
          <div style={styles.boxContainer}>
            <ProgressBox
              started={true}
              incomplete={20}
              imperfect={0}
              perfect={0}
            />
          </div>
        </div>
        <div style={styles.progressBox}>
          <div style={styles.labelBox}>
            <div>{i18n.completed()}</div>
            {showCSFProgressBox &&
              <div style={styles.parenthetical}>({i18n.perfect()})</div>
            }
          </div>
          <div style={styles.boxContainer}>
            <ProgressBox
              started={true}
              incomplete={0}
              imperfect={0}
              perfect={20}
            />
          </div>
        </div>
        {showCSFProgressBox &&
          <div style={styles.progressBox}>
            <div style={styles.labelBox}>
              <div>{i18n.completed()}</div>
              <div style={styles.parenthetical}>({i18n.tooManyBlocks()})</div>
            </div>
            <div style={styles.boxContainer}>
              <ProgressBox
                started={true}
                incomplete={0}
                imperfect={20}
                perfect={0}
              />
            </div>
          </div>
        }
      </div>
    );
  }
}
