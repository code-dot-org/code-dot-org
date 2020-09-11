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
import ReactDOM from 'react-dom';
import {activityShape} from '@cdo/apps/lib/levelbuilder/shapes';

const styles = {
  activityHeader: {
    fontSize: 18,
    color: 'white',
    background: color.cyan,
    borderTopLeftRadius: borderRadius,
    borderTopRightRadius: borderRadius,
    padding: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
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
    fontSize: 20,
    marginRight: 5
  },
  input: {
    marginRight: 10
  },
  labelAndInput: {
    marginLeft: 5,
    display: 'flex',
    alignItems: 'center'
  }
};

class ActivityCard extends Component {
  static propTypes = {
    activity: activityShape,
    activitiesCount: PropTypes.number,
    setActivitySectionMetrics: PropTypes.func.isRequired,
    setTargetActivitySection: PropTypes.func.isRequired,
    targetActivitySectionPos: PropTypes.number,
    activitySectionMetrics: PropTypes.object.isRequired,

    //redux
    addActivitySection: PropTypes.func,
    removeActivity: PropTypes.func,
    moveActivity: PropTypes.func,
    updateActivityField: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      collapsed: false
    };
  }

  handleAddActivitySection = () => {
    this.props.addActivitySection(
      this.props.activity.position,
      `activitySection-${this.generateActivitySectionKey()}`
    );
  };

  generateActivitySectionKey = () => {
    let activitySectionNumber = this.props.activity.activitySections.length + 1;
    while (
      this.props.activity.activitySections.some(
        activitySection =>
          activitySection.key === `activitySection-${activitySectionNumber}`
      )
    ) {
      activitySectionNumber++;
    }

    return activitySectionNumber;
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

  handleChangeTime = event => {
    this.props.updateActivityField(
      this.props.activity.position,
      'time',
      event.target.value
    );
  };

  render() {
    const {activity} = this.props;

    return (
      <div>
        <div
          style={{
            ...styles.activityHeader,
            ...(this.state.collapsed && {marginBottom: 10})
          }}
        >
          <FontAwesome
            icon={this.state.collapsed ? 'expand' : 'compress'}
            onClick={() => {
              this.setState({
                collapsed: !this.state.collapsed
              });
            }}
          />
          <label style={styles.labelAndInput}>
            <span style={styles.label}>{`Activity:`}</span>
            <input
              value={activity.displayName}
              style={styles.input}
              onChange={this.handleChangeDisplayName}
            />
          </label>
          <label style={styles.labelAndInput}>
            <span style={styles.label}>{`Time (mins):`}</span>
            <input
              value={activity.time}
              style={{...styles.input, ...{width: 50}}}
              onChange={this.handleChangeTime}
            />
          </label>
          <OrderControls
            name={activity.key || '(none)'}
            move={this.handleMoveActivity}
            remove={this.handleRemoveActivity}
          />
        </div>
        <div style={styles.activityBody} hidden={this.state.collapsed}>
          {activity.activitySections.map(section => {
            return (
              <ActivitySectionCard
                key={section.key}
                activitySection={section}
                activityPosition={activity.position}
                activitySectionsCount={activity.activitySections.length}
                activitiesCount={this.props.activitiesCount}
                ref={activitySectionCard => {
                  if (activitySectionCard) {
                    const metrics = ReactDOM.findDOMNode(
                      activitySectionCard
                    ).getBoundingClientRect();
                    this.props.setActivitySectionMetrics(
                      metrics,
                      section.position
                    );
                  }
                }}
                activitySectionMetrics={this.props.activitySectionMetrics}
                setTargetActivitySection={this.props.setTargetActivitySection}
                targetActivitySectionPos={this.props.targetActivitySectionPos}
              />
            );
          })}
          <button
            onMouseDown={this.handleAddActivitySection.bind()}
            className="btn"
            style={styles.addButton}
            type="button"
          >
            <i style={{marginRight: 7}} className="fa fa-plus-circle" />
            Add Activity Section
          </button>
        </div>
      </div>
    );
  }
}

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
