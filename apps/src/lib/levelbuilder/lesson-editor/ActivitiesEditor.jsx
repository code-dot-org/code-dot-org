import React, {Component} from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import ActivityCardAndPreview from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivityCardAndPreview';
import {connect} from 'react-redux';
import {
  addActivity,
  getSerializedActivities
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import ReactDOM from 'react-dom';
import {activityShape} from '@cdo/apps/lib/levelbuilder/shapes';

/*
 A GUI for editing activities in a lesson. Shows
 the editing fields side by side with a preview of how they will
 look in the lesson plan.
 */

class ActivitiesEditor extends Component {
  static propTypes = {
    hasLessonPlan: PropTypes.bool.isRequired,
    //redux
    activities: PropTypes.arrayOf(activityShape).isRequired,
    addActivity: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      targetActivityPos: null,
      targetActivitySectionPos: null
    };
  }

  handleAddActivity = () => {
    this.props.addActivity(
      this.props.activities.length,
      this.generateActivityKey(),
      this.generateActivitySectionKey()
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

  generateActivitySectionKey = () => {
    let activitySectionNumber = 1;

    let activitySectionKeys = [];
    this.props.activities.forEach(activity => {
      activity.activitySections.forEach(section => {
        activitySectionKeys.push(section.key);
      });
    });

    while (
      activitySectionKeys.includes(`activitySection-${activitySectionNumber}`)
    ) {
      activitySectionNumber++;
    }

    return `activitySection-${activitySectionNumber}`;
  };

  // To be populated with the react ref of each ActivitySectionCard element.
  sectionRefs = [];

  setActivitySectionRef = (sectionRef, activityPos, sectionPos) => {
    this.sectionRefs[activityPos] = this.sectionRefs[activityPos] || [];
    this.sectionRefs[activityPos][sectionPos] = sectionRef;
  };

  // To be populated with the bounding client rect of each ActivitySectionCard element.
  sectionMetrics = [];

  // populate sectionMetrics from sectionRefs.
  updateActivitySectionMetrics = () => {
    this.sectionMetrics = [];
    this.sectionRefs.forEach((sectionRefs, activityPos) => {
      sectionRefs.forEach((ref, sectionPos) => {
        const node = ReactDOM.findDOMNode(ref);
        const rect = !!node && node.getBoundingClientRect();
        this.sectionMetrics[activityPos] =
          this.sectionMetrics[activityPos] || [];
        this.sectionMetrics[activityPos][sectionPos] = rect;
      });
    });
  };

  clearTargetActivitySection = () => {
    this.setState({
      targetActivityPos: null,
      targetActivitySectionPos: null
    });
  };

  // Given a clientY value of a location on the screen, find the ActivityCard
  // and ActivitySectionCard corresponding to that location, and update
  // targetActivityPos and targetActivitySectionPos to match.
  updateTargetActivitySection = y => {
    this.sectionMetrics.forEach((sectionMetrics, activityPos) => {
      sectionMetrics.forEach((rect, sectionPos) => {
        if (y > rect.top && y < rect.top + rect.height) {
          this.setState({
            targetActivityPos: activityPos,
            targetActivitySectionPos: sectionPos
          });
        }
      });
    });
  };

  render() {
    const {activities} = this.props;

    return (
      <div style={styles.activityEditAndPreview}>
        {activities.map(activity => (
          <ActivityCardAndPreview
            key={activity.key}
            activity={activity}
            generateActivitySectionKey={this.generateActivitySectionKey}
            activitiesCount={activities.length}
            setActivitySectionRef={this.setActivitySectionRef}
            updateTargetActivitySection={this.updateTargetActivitySection}
            clearTargetActivitySection={this.clearTargetActivitySection}
            targetActivityPos={this.state.targetActivityPos}
            targetActivitySectionPos={this.state.targetActivitySectionPos}
            activitySectionMetrics={this.sectionMetrics}
            updateActivitySectionMetrics={this.updateActivitySectionMetrics}
            hasLessonPlan={this.props.hasLessonPlan}
          />
        ))}
        {this.props.hasLessonPlan && (
          <button
            onMouseDown={this.handleAddActivity}
            className="btn add-activity"
            style={styles.addActivity}
            type="button"
          >
            <i style={{marginRight: 7}} className="fa fa-plus-circle" />
            Activity
          </button>
        )}
        <input
          type="hidden"
          name="activities"
          value={getSerializedActivities(this.props.activities)}
        />
      </div>
    );
  }
}

const styles = {
  activityEditAndPreview: {
    margin: 10
  },
  addActivity: {
    fontSize: 14,
    color: 'white',
    background: color.cyan,
    border: `1px solid ${color.cyan}`,
    boxShadow: 'none'
  }
};

export const UnconnectedActivitiesEditor = ActivitiesEditor;

export default connect(
  state => ({
    activities: state.activities
  }),
  {
    addActivity
  }
)(ActivitiesEditor);
