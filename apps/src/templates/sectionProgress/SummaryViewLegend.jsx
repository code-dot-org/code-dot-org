import React, { PropTypes, Component } from 'react';
import ProgressBox from './ProgressBox';
import color from "@cdo/apps/util/color";
import i18n from '@cdo/locale';

const styles = {
  legendBox: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.lightest_gray,
    backgroundColor: color.white,
    display: 'inline-block',
    marginTop: 20,
  },
  progressBox: {
    float: 'left',
    padding: 10,
    width: 130,
    marginLeft: 10,
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
    height: 40,
    width: '100%',
    marginBottom: 5,
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
          <ProgressBox
            started={false}
            incomplete={20}
            imperfect={0}
            perfect={0}
          />
        </div>
        <div style={styles.progressBox}>
          <div style={styles.labelBox}>
            <div>{i18n.inProgress()}</div>
          </div>
          <ProgressBox
            started={true}
            incomplete={20}
            imperfect={0}
            perfect={0}
          />
        </div>
        <div style={styles.progressBox}>
          <div style={styles.labelBox}>
            <div>{i18n.completed()}</div>
            {showCSFProgressBox &&
              <div style={styles.parenthetical}>({i18n.perfect()})</div>
            }
          </div>
          <ProgressBox
            started={true}
            incomplete={0}
            imperfect={0}
            perfect={20}
          />
        </div>
        {showCSFProgressBox &&
          <div style={styles.progressBox}>
            <div style={styles.labelBox}>
              <div>{i18n.completed()}</div>
              <div style={styles.parenthetical}>({i18n.tooManyBlocks()})</div>
            </div>
            <ProgressBox
              started={true}
              incomplete={0}
              imperfect={20}
              perfect={0}
            />
          </div>
        }
      </div>
    );
  }
}
