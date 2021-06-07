import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import color from '@cdo/apps/util/color';
import {borderRadius} from '@cdo/apps/lib/levelbuilder/constants';
import OrderControls from '@cdo/apps/lib/levelbuilder/OrderControls';
import ActivitySectionCard from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivitySectionCard';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {
  addActivitySection,
  moveActivity,
  removeActivity,
  updateActivityField
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import {activityShape} from '@cdo/apps/lib/levelbuilder/shapes';

/*
  Part of the Activity Editor GUI that allows you to edit all
  the details of an Activity.
 */

class ActivityCard extends Component {
  static propTypes = {
    activity: activityShape.isRequired,
    generateActivitySectionKey: PropTypes.func.isRequired,
    activitiesCount: PropTypes.number.isRequired,
    setActivitySectionRef: PropTypes.func.isRequired,
    updateTargetActivitySection: PropTypes.func.isRequired,
    clearTargetActivitySection: PropTypes.func.isRequired,
    targetActivityPos: PropTypes.number,
    targetActivitySectionPos: PropTypes.number,
    activitySectionMetrics: PropTypes.array.isRequired,
    updateActivitySectionMetrics: PropTypes.func.isRequired,
    handleCollapse: PropTypes.func.isRequired,
    collapsed: PropTypes.bool.isRequired,
    hasLessonPlan: PropTypes.bool.isRequired,

    //redux
    addActivitySection: PropTypes.func.isRequired,
    removeActivity: PropTypes.func.isRequired,
    moveActivity: PropTypes.func.isRequired,
    updateActivityField: PropTypes.func.isRequired
  };

  handleAddActivitySection = () => {
    this.props.addActivitySection(
      this.props.activity.position,
      this.props.generateActivitySectionKey()
    );
  };

  handleMoveActivity = direction => {
    if (
      (this.props.activity.position !== 1 && direction === 'up') ||
      (this.props.activity.position !== this.props.activitiesCount &&
        direction === 'down')
    ) {
      this.props.moveActivity(this.props.activity.position, direction);
    }
  };

  handleRemoveActivity = () => {
    this.props.removeActivity(this.props.activity.position);
  };

  handleChangeDisplayName = event => {
    this.props.updateActivityField(
      this.props.activity.position,
      'displayName',
      event.target.value
    );
  };

  handleChangeDuration = event => {
    this.props.updateActivityField(
      this.props.activity.position,
      'duration',
      Number.isNaN(parseInt(event.target.value))
        ? ''
        : parseInt(event.target.value)
    );
  };

  render() {
    const {
      activity,
      setActivitySectionRef,
      updateTargetActivitySection,
      clearTargetActivitySection,
      updateActivitySectionMetrics,
      hasLessonPlan
    } = this.props;

    return (
      <div className="uitest-activity-card">
        <div
          style={{
            ...styles.activityHeader,
            ...(this.props.collapsed && {marginBottom: 10})
          }}
        >
          {hasLessonPlan && (
            <div style={styles.activityHeaderComponents}>
              <div style={styles.inputsAndIcon}>
                <FontAwesome
                  icon={this.props.collapsed ? 'expand' : 'compress'}
                  onClick={this.props.handleCollapse}
                />

                <label style={styles.labelAndInput}>
                  <span style={styles.label}>{`Activity:`}</span>
                  <input
                    value={activity.displayName}
                    style={{width: 200}}
                    onChange={this.handleChangeDisplayName}
                    className="uitest-activity-name-input"
                  />
                </label>
                <label style={styles.labelAndInput}>
                  <span style={styles.label}>{`Duration:`}</span>
                  <input
                    value={activity.duration}
                    style={{width: 35}}
                    onChange={this.handleChangeDuration}
                    className="uitest-activity-duration-input"
                  />
                  <span style={{fontSize: 10}}>{'(mins)'}</span>
                </label>
              </div>
              <OrderControls
                name={activity.displayName || 'Unnamed Activity'}
                move={this.handleMoveActivity}
                remove={this.handleRemoveActivity}
                item={this.props.activity}
                itemType={'activity'}
              />
            </div>
          )}
        </div>
        <div style={styles.activityBody} hidden={this.props.collapsed}>
          {activity.activitySections.map(section => (
            <ActivitySectionCard
              key={section.key}
              activitySection={section}
              activityPosition={activity.position}
              activitySectionsCount={activity.activitySections.length}
              activitiesCount={this.props.activitiesCount}
              ref={ref => {
                setActivitySectionRef(ref, activity.position, section.position);
              }}
              activitySectionMetrics={this.props.activitySectionMetrics}
              updateTargetActivitySection={updateTargetActivitySection}
              clearTargetActivitySection={clearTargetActivitySection}
              targetActivityPos={this.props.targetActivityPos}
              targetActivitySectionPos={this.props.targetActivitySectionPos}
              updateActivitySectionMetrics={updateActivitySectionMetrics}
              hasLessonPlan={hasLessonPlan}
            />
          ))}
          <button
            onMouseDown={this.handleAddActivitySection.bind()}
            className="btn add-activity-section"
            style={styles.addButton}
            type="button"
          >
            <i style={{marginRight: 7}} className="fa fa-plus-circle" />
            Activity Section
          </button>
        </div>
      </div>
    );
  }
}

const styles = {
  activityHeader: {
    fontSize: 18,
    color: 'white',
    background: color.cyan,
    borderTopLeftRadius: borderRadius,
    borderTopRightRadius: borderRadius,
    padding: 10
  },
  activityHeaderComponents: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    overflow: 'hidden'
  },
  activityBody: {
    background: color.lightest_cyan,
    borderBottomLeftRadius: borderRadius,
    borderBottomRightRadius: borderRadius,
    padding: 10,
    marginBottom: 20
  },
  addButton: {
    fontSize: 14,
    color: '#5b6770',
    background: 'white',
    border: '1px solid #ccc',
    boxShadow: 'none',
    margin: '0 10px 10px 10px'
  },
  button: {
    marginLeft: 10
  },
  label: {
    fontSize: 18,
    marginRight: 5
  },
  labelAndInput: {
    marginLeft: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  inputsAndIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    flex: '1 1'
  }
};

export const UnconnectedActivityCard = ActivityCard;

export default connect(
  state => ({}),
  {
    addActivitySection,
    moveActivity,
    removeActivity,
    updateActivityField
  }
)(ActivityCard);
