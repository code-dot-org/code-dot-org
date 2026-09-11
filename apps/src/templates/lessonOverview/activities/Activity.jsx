import {Typography} from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import ActivitySection from '@cdo/apps/templates/lessonOverview/activities/ActivitySection';
import {activityShape} from '@cdo/apps/templates/lessonOverview/lessonPlanShapes';
import i18n from '@cdo/locale';

import styles from '../lesson-plan.module.scss';

export default class Activity extends Component {
  static propTypes = {
    activity: activityShape,
    // Passed through to each section; see ActivitySection.
    vocabularyDefinitions: PropTypes.object,
  };

  render() {
    const {activity, vocabularyDefinitions} = this.props;

    return (
      <div>
        {/* An activity is a subsection of the "Teaching Guide" h2, so h3. */}
        <Typography
          variant="h4"
          component="h3"
          className={classNames(
            styles.activityHeader,
            styles.headingWithMargins
          )}
          id={`activity-${activity.key}`}
        >
          {activity.displayName}
          {activity.duration > 0 && (
            <span>
              {i18n.activityHeaderTime({
                activityDuration: activity.duration,
              })}
            </span>
          )}
        </Typography>
        {activity.activitySections.map(item => {
          return (
            <ActivitySection
              key={item.key}
              section={item}
              vocabularyDefinitions={vocabularyDefinitions}
            />
          );
        })}
      </div>
    );
  }
}
