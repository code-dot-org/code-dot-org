import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ActivityCard from './ActivityCard';
import Activity from '@cdo/apps/code-studio/components/Activity';

const styles = {
  activityEditAndPreview: {
    display: 'flex',
    flexDirection: 'row'
  },
  editor: {
    width: '50%'
  },
  preview: {
    width: '45%',
    marginLeft: 20
  },
  previewBox: {
    border: '1px solid black',
    padding: 10
  }
};

export default class ActivitiesEditor extends Component {
  static propTypes = {
    activities: PropTypes.array
  };

  render() {
    const {activities} = this.props;

    return (
      <div>
        <div style={styles.activityEditAndPreview}>
          <div style={styles.editor}>
            {activities.map(activity => {
              return <ActivityCard activity={activity} key={activity.key} />;
            })}
          </div>
          <div style={styles.preview}>
            <h2>Preview</h2>
            <div style={styles.previewBox}>
              {activities.map(activity => {
                return <Activity activity={activity} key={activity.key} />;
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
