import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ActivitySection from '@cdo/apps/templates/lessonOverview/activities/ActivitySection';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

const styles = {
  activityHeader: {
    color: color.purple
  }
};

export default class Activity extends Component {
  static propTypes = {
    activity: PropTypes.object
  };

  render() {
    const {activity} = this.props;

    return (
      <div>
        <h2 style={styles.activityHeader}>
          {i18n.activityHeader({
            activityName: activity.displayName,
            activityTime: activity.time
          })}
        </h2>
        {activity.activitySections.map(item => {
          return <ActivitySection key={item.key} section={item} />;
        })}
      </div>
    );
  }
}
