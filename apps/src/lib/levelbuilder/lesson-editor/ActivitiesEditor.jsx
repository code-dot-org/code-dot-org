import React, {Component} from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import ActivityCard from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivityCard';
import Activity from '@cdo/apps/templates/lessonOverview/activities/Activity';
import {connect} from 'react-redux';
import {
  addActivity,
  NEW_LEVEL_ID
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import _ from 'lodash';
import ReactDOM from 'react-dom';

const styles = {
  activityEditAndPreview: {
    display: 'flex',
    flexDirection: 'row',
    margin: 10
  },
  editor: {
    width: '55%'
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

/*
 A GUI for editing activities in a lesson. Shows
 the editing fields side by side with a preview of how they will
 look in the lesson plan.
 */

class ActivitiesEditor extends Component {
  static propTypes = {
    //redux
    activities: PropTypes.array,
    addActivity: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      targetActivitySectionPos: null
    };
  }

  handleAddActivity = () => {
    this.props.addActivity(
      this.props.activities.length,
      this.generateActivityKey()
    );
  };

  generateActivityKey = () => {
    let activityNumber = this.props.activities.length + 1;
    while (
      this.props.activities.some(
        activity => activity.key === `activity-${activityNumber}`
      )
    ) {
      activityNumber++;
    }

    return `activity-${activityNumber}`;
  };

  // To be populated with the react ref of each ActivitySectionCard element.
  activitySectionRefs = [];

  setActivitySectionRef = (activitySectionRef, activitySectionPosition) => {
    this.activitySectionRefs[activitySectionPosition] = activitySectionRef;
  };

  // To be populated with the bounding client rect of each ActivitySectionCard element.
  activitySectionMetrics = [];

  // populate activitySectionMetrics from activitySectionRefs.
  updateActivitySectionMetrics = () => {
    this.activitySectionMetrics = [];
    this.activitySectionRefs.forEach((ref, position) => {
      const node = ReactDOM.findDOMNode(ref);
      const rect = !!node && node.getBoundingClientRect();
      this.activitySectionMetrics[position] = rect;
    });
  };

  // Given a clientY value of a location on the screen, find the ActivitySectionCard
  // corresponding to that location, and update targetActivitySectionPos to match.
  updateTargetActivitySection = y => {
    const activitySectionPos = Object.keys(this.activitySectionMetrics).find(
      sectionPos => {
        const rect = this.activitySectionMetrics[sectionPos];
        return y > rect.top && y < rect.top + rect.height;
      }
    );
    const targetActivitySectionPos = activitySectionPos
      ? Number(activitySectionPos)
      : null;
    this.setState({targetActivitySectionPos});
  };

  // Serialize the activities into JSON, renaming any keys which are different
  // on the backend.
  serializeActivities = () => {
    const activities = _.cloneDeep(this.props.activities);
    activities.forEach(activity => {
      activity.name = activity.displayName;
      delete activity.displayName;

      activity.activitySections.forEach(activitySection => {
        activitySection.name = activitySection.displayName;
        delete activitySection.displayName;

        activitySection.description = activitySection.text;
        delete activitySection.text;

        activitySection.scriptLevels.forEach(scriptLevel => {
          // The server expects id to be absent if a new script level is to be
          // created.
          if (scriptLevel.id === NEW_LEVEL_ID) {
            delete scriptLevel.id;
          }

          // The position within the activity section
          scriptLevel.activitySectionPosition = scriptLevel.position;

          // Other position values will be recomputed from the
          // activitySectionPosition on the server.
          delete scriptLevel.position;
          delete scriptLevel.levelNumber;
        });
      });
    });

    return JSON.stringify(activities);
  };

  render() {
    const {activities} = this.props;

    return (
      <div style={styles.activityEditAndPreview}>
        <div style={styles.editor}>
          {activities.map(activity => (
            <ActivityCard
              activity={activity}
              activitiesCount={activities.length}
              key={activity.key}
              setActivitySectionRef={this.setActivitySectionRef}
              updateTargetActivitySection={this.updateTargetActivitySection}
              targetActivitySectionPos={this.state.targetActivitySectionPos}
              activitySectionMetrics={this.activitySectionMetrics}
              updateActivitySectionMetrics={this.updateActivitySectionMetrics}
            />
          ))}
          <button
            onMouseDown={this.handleAddActivity}
            className="btn add-activity"
            style={styles.addActivity}
            type="button"
          >
            <i style={{marginRight: 7}} className="fa fa-plus-circle" />
            Activity
          </button>
        </div>
        <div style={styles.preview}>
          <h2>Preview</h2>
          <div style={styles.previewBox}>
            {activities.map(activity => (
              <Activity activity={activity} key={activity.key} />
            ))}
          </div>
        </div>
        <input
          type="hidden"
          name="activities"
          value={this.serializeActivities()}
        />
      </div>
    );
  }
}

export const UnconnectedActivitiesEditor = ActivitiesEditor;

export default connect(
  state => ({
    activities: state.activities
  }),
  {
    addActivity
  }
)(ActivitiesEditor);
