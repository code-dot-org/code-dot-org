import React, {Component} from 'react';
import ActivitySection from '@cdo/apps/templates/lessonOverview/activities/ActivitySection';
import color from '@cdo/apps/util/color';
import {activityShape} from '@cdo/apps/lib/levelbuilder/shapes';
import i18n from '@cdo/locale';

const styles = {
  activityHeader: {
    color: color.purple
  }
};

export default class Activity extends Component {
  static propTypes = {
    activity: activityShape
  };

  render() {
    const {activity} = this.props;

    return (
      <div>
        <h2 style={styles.activityHeader} id={`activity-${activity.key}`}>
          {i18n.activityHeaderName({
            activityName: activity.displayName
          })}
          {activity.duration > 0 && (
            <span>
              {i18n.activityHeaderTime({
                activityDuration: activity.duration
              })}
            </span>
          )}
        </h2>
        {activity.activitySections.map(item => {
          return <ActivitySection key={item.key} section={item} />;
        })}
      </div>
    );
  }
}
