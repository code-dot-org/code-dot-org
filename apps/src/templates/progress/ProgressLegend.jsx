import React, { PropTypes, Component } from 'react';
import color from "@cdo/apps/util/color";
import i18n from '@cdo/locale';
import ProgressBubble from './ProgressBubble';
import FontAwesome from '../FontAwesome';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';

const styles = {
  table: {
    textAlign: 'center',
    width: '100%',
    // Margin to get it to line up with ProgressLesson
    marginLeft: 3,
    marginRight: 3,
    marginTop: 60,
  },
  tdStyle: {
    padding: 10,
    borderStyle: 'none',
  },
  header: {
    backgroundColor: color.white,
    color: color.charcoal,
    whiteSpace: 'nowrap',
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
    borderStyle: 'solid',
  },
  rightBorder: {
    borderRightStyle: 'solid',
    borderWidth: 2,
    borderColor: color.lightest_gray,
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 18,
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
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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
  static propTypes = {
    excludeCsfColumn: PropTypes.bool.isRequired,
  };

  render() {
    const { excludeCsfColumn } = this.props;
    return (
      <table style={styles.table}>
        <thead>
          <tr style={styles.header}>
            <TD style={styles.headerCell}>
              {i18n.levelType()}
            </TD>
            <TD style={styles.headerCell} colSpan={3}>
              {i18n.levelDetails()}
            </TD>
            <TD style={styles.headerCell} colSpan={excludeCsfColumn ? 4 : 5}>
              {i18n.levelStatus()}
            </TD>
          </tr>
          <tr style={styles.secondRow}>
            <TD colSpan={4}/>
            <TD>{i18n.notStarted()}</TD>
            <TD>{i18n.inProgress()}</TD>
            {!excludeCsfColumn &&
              <TD>
                <div>{i18n.completed()}</div>
                <div style={styles.secondaryText}>({i18n.tooManyBlocks()})</div>
              </TD>
            }
            <TD>
              <div>{i18n.completed()}</div>
              {!excludeCsfColumn && <div style={styles.secondaryText}>({i18n.perfect()})</div>}
            </TD>
            <TD>{i18n.submitted()}</TD>
          </tr>
        </thead>
        <tbody>
          <tr style={styles.subsequentRow}>
            <TD style={styles.rightBorder}>{i18n.concept()}</TD>
            <TD>
              <div style={styles.iconAndText}>
                <FontAwesome icon="file-text" style={styles.icon}/>
                {i18n.text()}
              </div>
            </TD>
            <TD>
              <div style={styles.iconAndText}>
                <FontAwesome icon="video-camera" style={styles.icon}/>
                {i18n.video()}
              </div>
            </TD>
            <TD style={styles.rightBorder}>
              <div style={styles.iconAndText}>
                <FontAwesome icon="map" style={styles.icon}/>
                {i18n.map()}
              </div>
            </TD>
            <TD>
              <div style={styles.center}>
                <ProgressBubble
                  level={{
                    status: LevelStatus.not_tried,
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
                    status: LevelStatus.attempted,
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
                    status: LevelStatus.perfect,
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
            <TD style={styles.rightBorder}>{i18n.activity()}</TD>
            <TD>
              <div style={styles.iconAndText}>
                <FontAwesome icon="scissors" style={styles.icon}/>
                {i18n.unplugged()}
              </div>
            </TD>
            <TD>
              <div style={styles.iconAndText}>
                <FontAwesome icon="desktop" style={styles.icon}/>
                {i18n.online()}
              </div>
            </TD>
            <TD style={styles.rightBorder}>
              <div style={styles.iconAndText}>
                <FontAwesome icon="check-square-o" style={styles.icon}/>
                {i18n.question()}
              </div>
            </TD>
            <TD>
              <div style={styles.center}>
                <ProgressBubble
                  level={{
                    status: LevelStatus.not_tried,
                    isConceptLevel: false,
                    name: `${i18n.activity()}: ${i18n.notStarted()}`
                  }}
                  disabled={false}
                />
              </div>
            </TD>
            <TD>
              <div style={styles.center}>
                <ProgressBubble
                  level={{
                    status: LevelStatus.attempted,
                    isConceptLevel: false,
                    name: `${i18n.activity()}: ${i18n.inProgress()}`
                  }}
                  disabled={false}
                />
              </div>
            </TD>
            {!excludeCsfColumn &&
              <TD>
                <div style={styles.center}>
                  <ProgressBubble
                    level={{
                      status: LevelStatus.passed,
                      isConceptLevel: false,
                      name: `${i18n.activity()}: ${i18n.completed()} (${i18n.tooManyBlocks()})`
                    }}
                    disabled={false}
                  />
                </div>
              </TD>
            }
            <TD>
              <div style={styles.center}>
                <ProgressBubble
                  level={{
                    status: LevelStatus.perfect,
                    isConceptLevel: false,
                    name: `${i18n.activity()}: ${i18n.completed()} (${i18n.perfect()})`
                  }}
                  disabled={false}
                />
              </div>
            </TD>
            <TD>
              <div style={styles.center}>
                <ProgressBubble
                  level={{
                    status: LevelStatus.submitted,
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
