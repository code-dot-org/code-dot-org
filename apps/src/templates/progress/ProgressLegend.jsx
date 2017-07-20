import React, { PropTypes, Component } from 'react';
import color from "@cdo/apps/util/color";
import NewProgressBubble from './NewProgressBubble';
import FontAwesome from '../FontAwesome';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';

const styles = {
  table: {
    textAlign: 'center',
    cellpadding: 10
  },
  tdStyle: {
    padding: 10,
  },
  header: {
    backgroundColor: color.white,
    color: color.charcoal,
    whiteSpace: 'nowrap',
  },
  secondRow: {
    backgroundColor: color.lightest_gray,
    color: color.charcoal,
    verticalAlign: 'top'
  },
  subsequentRow: {
    backgroundColor: color.white,
    borderWidth: 2,
    borderColor: color.lightest_gray,
    borderStyle: 'solid',
  },
  rightBorder: {
    borderRightStyle: 'solid',
    borderWidth: 2,
    borderColor: color.lightest_gray,
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  secondaryText: {
    fontSize: 10,
  },
  iconAndText: {
    whiteSpace: 'nowrap',
  },
  icon: {
    marginRight: 5,
    size: 20,
  }
};

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

export default class ProgressLegend extends Component {
  render() {
    // TODO: i81n
    // TODO: different tables for CSP/CSF
    return (
      <table style={styles.table}>
        <thead>
          <tr style={styles.header}>
            <TD style={styles.headerCell}>Level Type</TD>
            <TD style={styles.headerCell} colSpan={3}>Level Details</TD>
            <TD style={styles.headerCell} colSpan={5}>Level Status</TD>
          </tr>
          <tr style={styles.secondRow}>
            <TD colSpan={4}/>
            <TD>Not started</TD>
            <TD>In progress</TD>
            <TD>
              <div>Completed</div>
              <div style={styles.secondaryText}>(too many blocks)</div>
            </TD>
            <TD>
              <div>Completed</div>
              <div style={styles.secondaryText}>(perfect)</div>
            </TD>
            <TD>Submitted</TD>
          </tr>
        </thead>
        <tbody>
          <tr style={styles.subsequentRow}>
            <TD style={styles.rightBorder}>Concept</TD>
            <TD>
              <div style={styles.iconAndText}>
                <FontAwesome icon="file-text" style={styles.icon}/>
                Text
              </div>
            </TD>
            <TD>
              <div style={styles.iconAndText}>
                <FontAwesome icon="video-camera" style={styles.icon}/>
                Video
              </div>
            </TD>
            <TD style={styles.rightBorder}>
              <div style={styles.iconAndText}>
                <FontAwesome icon="map" style={styles.icon}/>
                Map
              </div>
            </TD>
            <TD>
              <NewProgressBubble
                level={{
                  status: LevelStatus.not_tried,
                  isConceptLevel: true,
                  name: "Concept: Not started"
                }}
                disabled={false}
              />
            </TD>
            <TD>
              <NewProgressBubble
                level={{
                  status: LevelStatus.attempted,
                  isConceptLevel: true,
                  name: "Concept: In progress"
                }}
                disabled={false}
              />
            </TD>
            <TD>N/A</TD>
            <TD>
              <NewProgressBubble
                level={{
                  status: LevelStatus.perfect,
                  isConceptLevel: true,
                  name: "Concept: Completed (perfect)"
                }}
                disabled={false}
              />
            </TD>
            <TD>N/A</TD>
          </tr>
          <tr style={styles.subsequentRow}>
            <TD style={styles.rightBorder}>Activity</TD>
            <TD>
              <div style={styles.iconAndText}>
                <FontAwesome icon="scissors" style={styles.icon}/>
                Unplugged
              </div>
            </TD>
            <TD>
              <div style={styles.iconAndText}>
                <FontAwesome icon="desktop" style={styles.icon}/>
                Online
              </div>
            </TD>
            <TD style={styles.rightBorder}>
              <div style={styles.iconAndText}>
                <FontAwesome icon="check-square-o" style={styles.icon}/>
                Question
              </div>
            </TD>
            <TD>
              <NewProgressBubble
                level={{
                  status: LevelStatus.not_tried,
                  isConceptLevel: false,
                  name: "Activity: Not started"
                }}
                disabled={false}
              />
            </TD>
            <TD>
              <NewProgressBubble
                level={{
                  status: LevelStatus.attempted,
                  isConceptLevel: false,
                  name: "Activity: In progress"
                }}
                disabled={false}
              />
            </TD>
            <TD>
              <NewProgressBubble
                level={{
                  status: LevelStatus.passed,
                  isConceptLevel: false,
                  name: "Activity: Completed (too many blocks)"
                }}
                disabled={false}
              />
            </TD>
            <TD>
              <NewProgressBubble
                level={{
                  status: LevelStatus.perfect,
                  isConceptLevel: false,
                  name: "Activity: Completed (perfect)"
                }}
                disabled={false}
              />
            </TD>
            <TD>
              <NewProgressBubble
                level={{
                  status: LevelStatus.submitted,
                  isConceptLevel: false,
                  name: "Activity: Submitted"
                }}
                disabled={false}
              />
            </TD>
          </tr>

        </tbody>
      </table>
    );
  }
}
