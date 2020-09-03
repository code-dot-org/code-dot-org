import React, {Component} from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import ActivityCard from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivityCard';
import Activity from '@cdo/apps/code-studio/components/Activity';
import {connect} from 'react-redux';
import {addActivity} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';

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
  },
  addActivity: {
    fontSize: 14,
    color: 'white',
    background: color.cyan,
    border: `1px solid ${color.cyan}`,
    boxShadow: 'none'
  }
};

class ActivitiesEditor extends Component {
  static propTypes = {
    //redux
    activities: PropTypes.array,
    addActivity: PropTypes.func
  };

  handleAddActivity = () => {
    this.props.addActivity(this.props.activities.length, '', '');
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
            <button
              onMouseDown={this.handleAddActivity}
              className="btn"
              style={styles.addActivity}
              type="button"
            >
              <i style={{marginRight: 7}} className="fa fa-plus-circle" />
              Add Activity
            </button>
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

export const UnconnectedActivitiesEditor = ActivitiesEditor;

export default connect(
  state => ({
    activities: state.activities
  }),
  dispatch => ({
    addActivity(position, key, name) {
      dispatch(addActivity(position, key, name));
    }
  })
)(ActivitiesEditor);
