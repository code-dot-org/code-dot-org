import PropTypes from 'prop-types';
import React, {Component} from 'react';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import ProgressBubble from './ProgressBubble';
import FontAwesome from '../FontAwesome';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import {connect} from 'react-redux';

// Give all of our TDs a padding
const TD = ({style, ...props}) => (
  <td
    style={{
      ...styles.tdStyle,
      ...style
    }}
    {...props}
  />
);
TD.propTypes = {
  style: PropTypes.object
};

class ProgressLegend extends Component {
  static propTypes = {
    excludeCsfColumn: PropTypes.bool.isRequired,
    // Redux
    isRtl: PropTypes.bool
  };

  render() {
    const {excludeCsfColumn, isRtl} = this.props;

    const secondRowRowSpan = 2;

    // Adjust icon and border styles if locale is RTL
    const iconStyle = isRtl ? styles.iconRTL : styles.icon;
    const sideBorderStyle = isRtl ? styles.leftBorder : styles.rightBorder;

    return (
      <table style={styles.table} className="progress-legend">
        <thead>
          <tr style={styles.header}>
            <TD style={styles.headerCell}>{i18n.levelType()}</TD>
            <TD style={styles.headerCell} colSpan={3}>
              {i18n.levelDetails()}
            </TD>
            <TD style={styles.headerCell} colSpan={excludeCsfColumn ? 4 : 5}>
              {i18n.levelStatus()}
            </TD>
          </tr>
          <tr style={styles.secondRow}>
            <TD colSpan={4} />
            <TD>{i18n.notStarted()}</TD>
            <TD>{i18n.inProgress()}</TD>
            {!excludeCsfColumn && (
              <TD>
                <div>{i18n.completed()}</div>
                <div style={styles.secondaryText}>({i18n.tooManyBlocks()})</div>
              </TD>
            )}
            <TD>
              <div>{i18n.completed()}</div>
              {!excludeCsfColumn && (
                <div style={styles.secondaryText}>({i18n.perfect()})</div>
              )}
            </TD>
            <TD>{i18n.assessmentAndSurvey()}</TD>
          </tr>
        </thead>
        <tbody>
          <tr style={styles.subsequentRow}>
            <TD style={sideBorderStyle}>{i18n.concept()}</TD>
            <TD>
              <div style={styles.iconAndText}>
                <FontAwesome icon="file-text" style={iconStyle} />
                {i18n.text()}
              </div>
            </TD>
            <TD>
              <div style={styles.iconAndText}>
                <FontAwesome icon="video-camera" style={iconStyle} />
                {i18n.video()}
              </div>
            </TD>
            <TD style={sideBorderStyle}>
              <div style={styles.iconAndText}>
                <FontAwesome icon="map" style={iconStyle} />
                {i18n.map()}
              </div>
            </TD>
            <TD>
              <div style={styles.center}>
                <ProgressBubble
                  level={{
                    id: '1',
                    status: LevelStatus.not_tried,
                    isLocked: false,
                    isConceptLevel: true,
                    name: `${i18n.concept()}: ${i18n.notStarted()}`
                  }}
                  disabled={false}
                />
              </div>
            </TD>
            <TD>
              <div style={styles.center}>
                <ProgressBubble
                  level={{
                    id: '1',
                    status: LevelStatus.attempted,
                    isLocked: false,
                    isConceptLevel: true,
                    name: `${i18n.concept()}: ${i18n.inProgress()}`
                  }}
                  disabled={false}
                />
              </div>
            </TD>
            {!excludeCsfColumn && <TD>N/A</TD>}
            <TD>
              <div style={styles.center}>
                <ProgressBubble
                  level={{
                    id: '1',
                    status: LevelStatus.perfect,
                    isLocked: false,
                    isConceptLevel: true,
                    name: `${i18n.concept()}: ${i18n.completed()} (${i18n.perfect()})`
                  }}
                  disabled={false}
                />
              </div>
            </TD>
            <TD>N/A</TD>
          </tr>
          <tr style={styles.subsequentRow}>
            <TD style={sideBorderStyle} rowSpan={secondRowRowSpan}>
              {i18n.activity()}
            </TD>
            <TD>
              <div style={styles.iconAndTextDivTop}>
                <FontAwesome icon="scissors" style={iconStyle} />
                {i18n.unplugged()}
              </div>
              <div style={styles.iconAndTextDivBottom}>
                <FontAwesome icon="flag-checkered" style={iconStyle} />
                {i18n.stageExtras()}
              </div>
            </TD>
            <TD>
              <div style={styles.iconAndTextDivTop}>
                <FontAwesome icon="desktop" style={iconStyle} />
                {i18n.online()}
              </div>
              <div style={styles.iconAndTextDivBottom}>
                <FontAwesome icon="check-circle" style={iconStyle} />
                {i18n.progressLegendAssessment()}
              </div>
            </TD>
            <TD style={sideBorderStyle}>
              <div style={styles.iconAndTextDivTop}>
                <FontAwesome icon="list-ul" style={iconStyle} />
                {i18n.question()}
              </div>
              <div style={styles.iconAndTextDivBottom}>
                <FontAwesome icon="sitemap" style={iconStyle} />
                {i18n.choiceLevel()}
              </div>
            </TD>
            <TD rowSpan={secondRowRowSpan}>
              <div style={styles.center}>
                <ProgressBubble
                  level={{
                    id: '1',
                    status: LevelStatus.not_tried,
                    isLocked: false,
                    isConceptLevel: false,
                    name: `${i18n.activity()}: ${i18n.notStarted()}`
                  }}
                  disabled={false}
                />
              </div>
            </TD>
            <TD rowSpan={secondRowRowSpan}>
              <div style={styles.center}>
                <ProgressBubble
                  level={{
                    id: '1',
                    status: LevelStatus.attempted,
                    isLocked: false,
                    isConceptLevel: false,
                    name: `${i18n.activity()}: ${i18n.inProgress()}`
                  }}
                  disabled={false}
                />
              </div>
            </TD>
            {!excludeCsfColumn && (
              <TD rowSpan={secondRowRowSpan}>
                <div style={styles.center}>
                  <ProgressBubble
                    level={{
                      id: '1',
                      status: LevelStatus.passed,
                      isLocked: false,
                      isConceptLevel: false,
                      name: `${i18n.activity()}: ${i18n.completed()} (${i18n.tooManyBlocks()})`
                    }}
                    disabled={false}
                  />
                </div>
              </TD>
            )}
            <TD rowSpan={secondRowRowSpan}>
              <div style={styles.center}>
                <ProgressBubble
                  level={{
                    id: '1',
                    status: LevelStatus.perfect,
                    isLocked: false,
                    isConceptLevel: false,
                    name: `${i18n.activity()}: ${i18n.completed()} (${i18n.perfect()})`
                  }}
                  disabled={false}
                />
              </div>
            </TD>
            <TD rowSpan={secondRowRowSpan}>
              <div style={styles.center}>
                <ProgressBubble
                  level={{
                    id: '1',
                    status: LevelStatus.submitted,
                    isLocked: false,
                    isConceptLevel: false,
                    name: `${i18n.activity()}: ${i18n.submitted()}`
                  }}
                  disabled={false}
                />
              </div>
            </TD>
          </tr>
        </tbody>
      </table>
    );
  }
}

const styles = {
  table: {
    textAlign: 'center',
    width: '100%',
    // Margin to get it to line up with ProgressLesson
    marginLeft: 3,
    marginRight: 3,
    marginTop: 60
  },
  tdStyle: {
    padding: 10,
    borderStyle: 'none'
  },
  header: {
    backgroundColor: color.white,
    color: color.charcoal,
    whiteSpace: 'nowrap'
  },
  secondRow: {
    backgroundColor: color.lightest_gray,
    color: color.charcoal,
    borderWidth: 2,
    borderColor: color.lightest_gray,
    borderStyle: 'solid',
    verticalAlign: 'top'
  },
  subsequentRow: {
    backgroundColor: color.white,
    borderWidth: 2,
    borderColor: color.lightest_gray,
    borderStyle: 'solid'
  },
  rightBorder: {
    borderRightStyle: 'solid',
    borderWidth: 2,
    borderColor: color.lightest_gray
  },
  leftBorder: {
    borderLeftStyle: 'solid',
    borderWidth: 2,
    borderColor: color.lightest_gray
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 18
  },
  secondaryText: {
    fontSize: 10
  },
  iconAndText: {
    whiteSpace: 'nowrap'
  },
  iconAndTextDiv: {
    whiteSpace: 'nowrap',
    paddingBottom: 16
  },
  iconAndTextDivTop: {
    whiteSpace: 'nowrap',
    paddingTop: 10,
    paddingBottom: 16
  },
  iconAndTextDivBottom: {
    whiteSpace: 'nowrap',
    paddingBottom: 10
  },
  icon: {
    marginRight: 5,
    size: 20
  },
  iconRTL: {
    marginLeft: 5,
    size: 20
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

export const UnconnectedProgressLegend = ProgressLegend;

export default connect(state => ({
  isRtl: state.isRtl
}))(ProgressLegend);
