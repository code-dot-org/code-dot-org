import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import _ from 'lodash';

export default class LessonAgenda extends Component {
  static propTypes = {
    activities: PropTypes.array.isRequired
  };

  render() {
    // Do not link to sections without a displayName
    let filteredActivitiesList = _.cloneDeep(this.props.activities);
    filteredActivitiesList.forEach(activity => {
      activity.activitySections = activity.activitySections.filter(
        section => section.displayName !== ''
      );
    });

    return (
      <div>
        {filteredActivitiesList.map(activity => (
          <ul key={activity.key} style={{listStyleType: 'none'}}>
            <li>
              {activity.duration > 0 && (
                <a href={`#activity-${activity.key}`}>{`${
                  activity.displayName
                } (${activity.duration} ${i18n.minutes()})`}</a>
              )}
              {activity.duration === 0 && (
                <a href={`#activity-${activity.key}`}>{`${
                  activity.displayName
                }`}</a>
              )}
            </li>
            {activity.activitySections.map(section => (
              <li style={{marginLeft: 15}} key={section.key}>
                {section.duration > 0 && (
                  <a href={`#section-${section.key}`}>{`${
                    section.displayName
                  } (${section.duration} ${i18n.minutes()})`}</a>
                )}
                {section.duration === 0 && (
                  <a href={`#section-${section.key}`}>{`${
                    section.displayName
                  }`}</a>
                )}
              </li>
            ))}
          </ul>
        ))}
      </div>
    );
  }
}
