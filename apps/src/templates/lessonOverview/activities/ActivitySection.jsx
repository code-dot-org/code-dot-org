import {Typography} from '@mui/material';
import classNames from 'classnames';
import React, {Component} from 'react';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import LessonTip from '@cdo/apps/templates/lessonOverview/activities/LessonTip';
import ProgressionDetails from '@cdo/apps/templates/lessonOverview/activities/ProgressionDetails';
import {activitySectionShape} from '@cdo/apps/templates/lessonOverview/lessonPlanShapes';
import i18n from '@cdo/locale';

import styles from '../lesson-plan.module.scss';

export default class ActivitySection extends Component {
  static propTypes = {
    section: activitySectionShape,
  };

  render() {
    const {section} = this.props;

    return (
      <div>
        {/* Nested under the activity's h3, so h4 in the outline. */}
        <Typography
          variant="h5"
          component="h4"
          id={`activity-section-${section.key}`}
          className={styles.activitySectionHeader}
        >
          {section.displayName}
          {section.duration > 0 && (
            <span>
              {i18n.activityHeaderTime({
                activityDuration: section.duration,
              })}
            </span>
          )}
        </Typography>
        <div className="activity-section-text">
          <div className={styles.textAndProgression}>
            {section.remarks && (
              <div>
                <Typography variant="h6" component="h5">
                  <FontAwesome icon="microphone" />
                  <span className={styles.remarks}>{i18n.remarks()}</span>
                </Typography>
              </div>
            )}
            <div className={classNames(section.remarks && styles.remarksBody)}>
              <EnhancedSafeMarkdown markdown={section.text} expandableImages />
            </div>
          </div>
        </div>
        {section.scriptLevels.length > 0 && (
          <div className={styles.progression}>
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
