import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ActivitySection from '@cdo/apps/code-studio/components/ActivitySection';

export default class Activity extends Component {
  static propTypes = {
    activity: PropTypes.object
  };

  render() {
    const {activity} = this.props;

    return (
      <div>
        <h2>{activity.displayName}</h2>
        {activity.activitySections.map(item => {
          return <ActivitySection key={item.key} section={item} />;
        })}
      </div>
    );
  }
}
