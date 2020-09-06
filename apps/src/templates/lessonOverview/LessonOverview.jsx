import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Activity from '@cdo/apps/templates/lessonOverview/activities/Activity';

export default class LessonOverview extends Component {
  static propTypes = {
    displayName: PropTypes.string.isRequired,
    overview: PropTypes.string,
    activities: PropTypes.array
  };

  render() {
    const {displayName, overview} = this.props;
    return (
      <div>
        <h1>Lesson "{displayName}"</h1>

        <h2>Overview</h2>
        <p>{overview}</p>

        <h2>Teaching Guide</h2>
        {this.props.activities.map(activity => (
          <Activity activity={activity} key={activity.key} />
        ))}
      </div>
    );
  }
}
