import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ActivityCard from './ActivityCard';

export default class Activities extends Component {
  static propTypes = {
    activities: PropTypes.array.isRequired
  };

  render() {
    const {activities} = this.props;

    return (
      <div>
        {activities.map(activity => {
          return <ActivityCard activity={activity} key={activity.key} />;
        })}
      </div>
    );
  }
}
