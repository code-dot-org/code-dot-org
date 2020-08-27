import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Activities from './Activities';

export default class ActivitiesEditor extends Component {
  static propTypes = {
    activities: PropTypes.array
  };

  render() {
    const {activities} = this.props;

    return (
      <div>
        <Activities activity={activities[0]} />
      </div>
    );
  }
}
