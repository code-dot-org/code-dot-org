import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';

export default class LessonAgenda extends Component {
  static propTypes = {
    activities: PropTypes.array.isRequired
  };

  render() {
    return (
      <div>
        {this.props.activities.map(activity => (
          <ul key={activity.key} style={{listStyleType: 'none'}}>
            <li>
              <a href={`#activity-${activity.key}`}>{`${
                activity.displayName
              } (${activity.duration} ${i18n.minutes()})`}</a>
            </li>
            {activity.activitySections.map(section => (
              <li style={{marginLeft: 15}} key={section.key}>
                <a href={`#activity-section-${section.key}`}>
                  {section.displayName}
                </a>
              </li>
            ))}
          </ul>
        ))}
      </div>
    );
  }
}
