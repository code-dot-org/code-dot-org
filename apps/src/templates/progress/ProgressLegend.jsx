import React, { Component } from 'react';
import color from "@cdo/apps/util/color";
import NewProgressBubble from './NewProgressBubble';
import FontAwesome from '../FontAwesome';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';

const styles = {
  table: {
    textAlign: 'center',
  },
  header: {
    backgroundColor: color.white,
    color: color.charcoal,
    whiteSpace: 'nowrap'
  },
  secondRow: {
    backgroundColor: color.lightest_gray,
    color: color.charcoal,
    verticalAlign: 'top'
  },
  secondRowCell: {
    padding: 10,
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

export default class ProgressLegend extends Component {
  render() {
    // TODO: i81n
    // TODO: different tables for CSP/CSF
    return (
      <table style={styles.table}>
        <thead>
          <tr style={styles.header}>
            <td>Level Type</td>
            <td colSpan={3}>Level Details</td>
            <td colSpan={5}>Level Status</td>
          </tr>
          <tr style={styles.secondRow}>
            <td style={styles.secondRowCell} colSpan={4}/>
            <td style={styles.secondRowCell}>Not started</td>
            <td style={styles.secondRowCell}>In progress</td>
            <td style={styles.secondRowCell}>
              <div>Completed</div>
              <div style={styles.secondaryText}>(too many blocks)</div>
            </td>
            <td style={styles.secondRowCell}>
              <div>Completed</div>
              <div style={styles.secondaryText}>(perfect)</div>
            </td>
            <td style={styles.secondRowCell}>Submitted</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Concept</td>
            <td>
              <div style={styles.iconAndText}>
                <FontAwesome icon="file-text" style={styles.icon}/>
                Text
              </div>
            </td>
            <td>
              <div style={styles.iconAndText}>
                <FontAwesome icon="video-camera" style={styles.icon}/>
                Video
              </div>
            </td>
            <td>
              <div style={styles.iconAndText}>
                <FontAwesome icon="map" style={styles.icon}/>
                Map
              </div>
            </td>
            <td>
              <NewProgressBubble
                level={{
                  status: LevelStatus.not_tried,
                  isConceptLevel: true,
                  name: "Concept: Not started"
                }}
                disabled={false}
              />
            </td>
            <td>
              <NewProgressBubble
                level={{
                  status: LevelStatus.attempted,
                  isConceptLevel: true,
                  name: "Concept: In progress"
                }}
                disabled={false}
              />
            </td>
            <td>N/A</td>
            <td>
              <NewProgressBubble
                level={{
                  status: LevelStatus.perfect,
                  isConceptLevel: true,
                  name: "Concept: Completed (perfect)"
                }}
                disabled={false}
              />
            </td>
            <td>N/A</td>
          </tr>
          <tr>
            <td>Activity</td>
            <td>
              <div style={styles.iconAndText}>
                <FontAwesome icon="scissors" style={styles.icon}/>
                Unplugged
              </div>
            </td>
            <td>
              <div style={styles.iconAndText}>
                <FontAwesome icon="desktop" style={styles.icon}/>
                Online
              </div>
            </td>
            <td>
              <div style={styles.iconAndText}>
                <FontAwesome icon="check-square-o" style={styles.icon}/>
                Question
              </div>
            </td>
            <td>
              <NewProgressBubble
                level={{
                  status: LevelStatus.not_tried,
                  isConceptLevel: false,
                  name: "Activity: Not started"
                }}
                disabled={false}
              />
            </td>
            <td>
              <NewProgressBubble
                level={{
                  status: LevelStatus.attempted,
                  isConceptLevel: false,
                  name: "Activity: In progress"
                }}
                disabled={false}
              />
            </td>
            <td>
              <NewProgressBubble
                level={{
                  status: LevelStatus.passed,
                  isConceptLevel: false,
                  name: "Activity: Completed (too many blocks)"
                }}
                disabled={false}
              />
            </td>
            <td>
              <NewProgressBubble
                level={{
                  status: LevelStatus.perfect,
                  isConceptLevel: false,
                  name: "Activity: Completed (perfect)"
                }}
                disabled={false}
              />
            </td>
            <td>
              <NewProgressBubble
                level={{
                  status: LevelStatus.submitted,
                  isConceptLevel: false,
                  name: "Activity: Submitted"
                }}
                disabled={false}
              />
            </td>
          </tr>

        </tbody>
      </table>
    );
  }
}
