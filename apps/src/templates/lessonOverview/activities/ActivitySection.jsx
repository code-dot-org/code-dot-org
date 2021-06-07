import React, {Component} from 'react';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import LessonTip from '@cdo/apps/templates/lessonOverview/activities/LessonTip';
import ProgressionDetails from '@cdo/apps/templates/lessonOverview/activities/ProgressionDetails';
import {activitySectionShape} from '@cdo/apps/templates/lessonOverview/lessonPlanShapes';
import i18n from '@cdo/locale';

export default class ActivitySection extends Component {
  static propTypes = {
    section: activitySectionShape
  };

  render() {
    const {section} = this.props;

    return (
      <div>
        <h3 id={`activity-section-${section.key}`}>
          {section.displayName}
          {section.duration > 0 && (
            <span>
              {i18n.activityHeaderTime({
                activityDuration: section.duration
              })}
            </span>
          )}
        </h3>
        <div className="activity-section-text">
          <div
            style={{
              ...styles.textAndProgression
            }}
          >
            {section.remarks && (
              <div>
                <h4 style={styles.remarksHeader}>
                  <FontAwesome icon="microphone" />
                  <span style={styles.remarks}>{i18n.remarks()}</span>
                </h4>
              </div>
            )}
            <div
              style={{
                ...(section.remarks && {
                  borderLeft: '5px solid #CCC',
                  paddingLeft: 5,
                  marginBottom: 5
                })
              }}
            >
              <EnhancedSafeMarkdown markdown={section.text} expandableImages />
            </div>
          </div>
        </div>
        {section.scriptLevels.length > 0 && (
          <div style={styles.progression}>
            <ProgressionDetails section={section} />
          </div>
        )}
        <div className="activity-section-text">
          {section.tips.map((tip, index) => {
            return <LessonTip key={`tip-${index}`} tip={tip} />;
          })}
        </div>
      </div>
    );
  }
}

const styles = {
  activitySection: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%'
  },
  tipIcons: {
    display: 'flex',
    flexDirection: 'column',
    width: 20,
    padding: 5,
    alignItems: 'center'
  },
  tips: {
    display: 'flex',
    flexDirection: 'column'
  },
  remarks: {
    marginLeft: 5,
    fontStyle: 'italic'
  },
  remarksHeader: {
    marginTop: 0
  },
  textAndProgression: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%' // If there are tips for the activity section this is updated below
  },
  progression: {
    marginBottom: 5
  }
};
