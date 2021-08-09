import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ActivityCard from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivityCard';
import Activity from '@cdo/apps/templates/lessonOverview/activities/Activity';
import {activityShape} from '@cdo/apps/lib/levelbuilder/shapes';

export default class ActivityCardAndPreview extends Component {
  static propTypes = {
    activity: activityShape,
    generateActivitySectionKey: PropTypes.func.isRequired,
    activitiesCount: PropTypes.number,
    setActivitySectionRef: PropTypes.func.isRequired,
    updateTargetActivitySection: PropTypes.func.isRequired,
    clearTargetActivitySection: PropTypes.func.isRequired,
    targetActivityPos: PropTypes.number,
    targetActivitySectionPos: PropTypes.number,
    activitySectionMetrics: PropTypes.array.isRequired,
    updateActivitySectionMetrics: PropTypes.func.isRequired,
    hasLessonPlan: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      collapsed: false
    };
  }

  handleCollapse = () => {
    this.setState({collapsed: !this.state.collapsed});
  };

  render() {
    const {activity} = this.props;

    return (
      <div style={styles.cardAndPreview}>
        <div style={styles.editor}>
          <ActivityCard
            activity={activity}
            generateActivitySectionKey={this.props.generateActivitySectionKey}
            activitiesCount={this.props.activitiesCount}
            setActivitySectionRef={this.props.setActivitySectionRef}
            updateTargetActivitySection={this.props.updateTargetActivitySection}
            clearTargetActivitySection={this.props.clearTargetActivitySection}
            targetActivityPos={this.props.targetActivityPos}
            targetActivitySectionPos={this.props.targetActivitySectionPos}
            activitySectionMetrics={this.props.activitySectionMetrics}
            updateActivitySectionMetrics={
              this.props.updateActivitySectionMetrics
            }
            handleCollapse={this.handleCollapse}
            collapsed={this.state.collapsed}
            hasLessonPlan={this.props.hasLessonPlan}
          />
        </div>
        <div style={styles.preview}>
          <div style={styles.previewBox}>
            {this.state.collapsed ? (
              <span style={styles.noPreview}>
                This activity has been collapsed. Expand activity to see
                preview.
              </span>
            ) : (
              <Activity activity={activity} />
            )}
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  cardAndPreview: {
    display: 'flex',
    flexDirection: 'row',
    margin: 10,
    width: '100%'
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
    padding: '0px 25px 10px 25px'
  },
  noPreview: {
    fontStyle: 'italic'
  }
};
