import React, { PropTypes, Component } from 'react';
import ProgressBox from './ProgressBox';
import color from "@cdo/apps/util/color";

const styles = {
  legendBox: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: color.gray,
    backgroundColor: color.white,
    float: 'left',
    display: 'inline-block'
  },
  progressBox: {
    float: 'left',
    padding: 10,
    width: 130,
    marginLeft: 10,
    border: '1px solid red',
  },
  heading: {
    fontSize: 16,
    fontWeight: 900,
    width: '48%',
    // float: 'left',
    paddingTop: 10,
    paddingBottom: 10,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 900,
  },
  parenthetical: {
    fontSize: 12,
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

    return (
      <div style={styles.legendBox}>
        <div style={styles.heading}>Lesson Status</div>
        <div style={styles.heading}>Completion Status</div>
        <div style={styles.progressBox}>
          <div style={styles.labelBox}>
            <div>Not started</div>
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
            <div>Started</div>
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
            <div>Completed</div>
            {showCSFProgressBox &&
              <div style={styles.parenthetical}>(perfect)</div>
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
              <div>Completed</div>
              <div style={styles.parenthetical}>(too many blocks)</div>
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
