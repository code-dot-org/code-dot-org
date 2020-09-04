import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {borderRadius} from '@cdo/apps/lib/levelbuilder/constants';
import OrderControls from '@cdo/apps/lib/levelbuilder/OrderControls';
import ActivitySectionCardButtons from './ActivitySectionCardButtons';
import {connect} from 'react-redux';
import {
  setActivitySectionSlide,
  setActivitySectionRemarks,
  moveActivitySection,
  removeActivitySection,
  updateActivitySectionField,
  addTip
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import LevelToken2 from '@cdo/apps/lib/levelbuilder/lesson-editor/LevelToken2';

const styles = {
  checkbox: {
    margin: '0 0 0 7px'
  },
  lessonCard: {
    fontSize: 18,
    background: 'white',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#ccc',
    borderRadius: borderRadius,
    padding: 20,
    margin: 10
  },
  lessonCardHeader: {
    color: '#5b6770',
    marginBottom: 15
  },
  labelAndCheckbox: {
    fontSize: 13,
    marginTop: 3,
    marginRight: 10
  },
  input: {
    width: '100%'
  },
  bottomControls: {
    height: 30,
    display: 'flex',
    justifyContent: 'space-between'
  },
  addLevel: {
    fontSize: 14,
    background: '#eee',
    border: '1px solid #ddd',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
    margin: '0 5px 0 0'
  },
  checkboxesAndButtons: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  checkboxes: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    marginRight: 5
  }
};

class ActivitySectionCard extends Component {
  static propTypes = {
    activitySection: PropTypes.object,
    activityPosition: PropTypes.number,
    activitySectionsCount: PropTypes.number,

    //redux
    setActivitySectionSlide: PropTypes.func,
    setActivitySectionRemarks: PropTypes.func,
    moveActivitySection: PropTypes.func,
    removeActivitySection: PropTypes.func,
    updateActivitySectionField: PropTypes.func,
    addTip: PropTypes.func
  };

  toggleSlides = () => {
    this.props.setActivitySectionSlide(
      this.props.activityPosition,
      this.props.activitySection.position,
      !this.props.activitySection.slide
    );
  };

  toggleRemarks = () => {
    this.props.setActivitySectionRemarks(
      this.props.activityPosition,
      this.props.activitySection.position,
      !this.props.activitySection.remarks
    );
  };

  handleMoveLesson = direction => {
    if (
      (this.props.activitySection.position !== 1 && direction === 'up') ||
      (this.props.activitySection.position !==
        this.props.activitySectionsCount &&
        direction === 'down')
    ) {
      this.props.moveActivitySection(
        this.props.activityPosition,
        this.props.activitySection.position,
        direction
      );
    }
  };

  handleRemoveLesson = () => {
    this.props.removeActivitySection(
      this.props.activityPosition,
      this.props.activitySection.position
    );
  };

  handleChangeDisplayName = event => {
    this.props.updateActivitySectionField(
      this.props.activityPosition,
      this.props.activitySection.position,
      'displayName',
      event.target.value
    );
  };

  handleChangeText = event => {
    this.props.updateActivitySectionField(
      this.props.activityPosition,
      this.props.activitySection.position,
      'text',
      event.target.value
    );
  };

  handleAddTip = tip => {
    this.props.addTip(
      this.props.activityPosition,
      this.props.activitySection.position,
      tip
    );
  };

  handleEditTip = tip => {
    console.log(`edit tip ${tip}`);
  };

  render() {
    return (
      <div style={styles.lessonCard}>
        <div style={styles.lessonCardHeader}>
          <label>
            <span style={styles.title}>Title:</span>
            <input
              value={this.props.activitySection.displayName}
              onChange={this.handleChangeDisplayName}
            />
            <OrderControls
              name={
                this.props.activitySection.displayName ||
                this.props.activitySection.key
              }
              move={this.handleMoveLesson}
              remove={this.handleRemoveLesson}
            />
          </label>
          <div style={styles.checkboxesAndButtons}>
            <span style={styles.checkboxes}>
              {this.props.activitySection.levels.length === 0 && (
                <label style={styles.labelAndCheckbox}>
                  Remarks
                  <input
                    checked={this.props.activitySection.remarks}
                    onChange={this.toggleRemarks}
                    type="checkbox"
                    style={styles.checkbox}
                  />
                </label>
              )}
              <label style={styles.labelAndCheckbox}>
                Slides
                <input
                  checked={this.props.activitySection.slide}
                  onChange={this.toggleSlides}
                  type="checkbox"
                  style={styles.checkbox}
                />
              </label>
            </span>
          </div>
        </div>
        <textarea
          value={this.props.activitySection.text}
          rows={Math.max(
            this.props.activitySection.text.split(/\r\n|\r|\n/).length + 1,
            2
          )}
          style={styles.input}
          onChange={this.handleChangeText}
        />
        {this.props.activitySection.levels.length > 0 &&
          this.props.activitySection.levels.map(level => (
            <LevelToken2
              key={level.position + '_' + level.ids[0]}
              level={level}
            />
          ))}
        <ActivitySectionCardButtons
          activitySection={this.props.activitySection}
          addTip={this.handleAddTip}
          editTip={this.handleEditTip}
        />
      </div>
    );
  }
}

export default connect(
  state => ({}),
  {
    setActivitySectionSlide,
    setActivitySectionRemarks,
    moveActivitySection,
    removeActivitySection,
    updateActivitySectionField,
    addTip
  }
)(ActivitySectionCard);
