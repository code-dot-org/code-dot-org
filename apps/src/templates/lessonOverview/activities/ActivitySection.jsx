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
        <h3 id={`activity-section-${section.key}`}>
          {section.displayName}
          {section.duration > 0 && (
            <span>
              {i18n.activityHeaderTime({
                activityDuration: section.duration,
              })}
            </span>
          )}
        </h3>
        <div className="activity-section-text">
          <div className={styles.textAndProgression}>
            {section.remarks && (
              <div>
                <h4 className={styles.remarksHeader}>
                  <FontAwesome icon="microphone" />
                  <span className={styles.remarks}>{i18n.remarks()}</span>
                </h4>
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
