import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ActivityCard from './ActivityCard';

export default class Activities extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  render() {
    const {activity} = this.props;

    return (
      <div>
        <ActivityCard activity={activity} />
      </div>
    );
  }
}
