import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import ReactTooltip from 'react-tooltip';

import {setScriptLevelField} from '@cdo/apps/levelbuilder/lesson-editor/activitiesEditorRedux';
import {scriptLevelShape} from '@cdo/apps/levelbuilder/shapes';

const tooltipText = {
  bonus: 'Include in lesson extras at the end of the lesson',
  assessment:
    'Visibly mark this level as an assessment, and show it in the Assessments tab in Teacher Dashboard.',
  challenge: 'Show students the Challenge dialog when viewing this level.',
  instructor_in_training:
    'Allow participant in a professional learning course to view certain instructor features.',
};

const optionText = {
  bonus: 'Bonus',
  assessment: 'Assessment',
  challenge: 'Challenge',
  instructor_in_training: 'Instructor In Training',
};

const disabledBonusTooltipText =
  'You must enable lesson extras for unit to set levels as bonus.';
const bonusAlreadySelectedTooltipText =
  'In order for bonus levels to show up for users you must enable lesson extras for the unit.';

const ArrowRenderer = ({onMouseDown}) => {
  return <i className="fa fa-chevron-down" onMouseDown={onMouseDown} />;
};
ArrowRenderer.propTypes = {onMouseDown: PropTypes.func.isRequried};

class LevelTokenDetails extends Component {
  static propTypes = {
    scriptLevel: scriptLevelShape.isRequired,
    activitySectionPosition: PropTypes.number.isRequired,
    activityPosition: PropTypes.number.isRequired,
    inactiveLevelNames: PropTypes.arrayOf(PropTypes.string),
    allowMajorCurriculumChanges: PropTypes.bool.isRequired,

    //redux
    setScriptLevelField: PropTypes.func.isRequired,
    lessonExtrasAvailableForUnit: PropTypes.bool,
    isProfessionalLearningCourse: PropTypes.bool,
  };

  handleCheckboxChange = field => {
    this.props.setScriptLevelField(
      this.props.activityPosition,
      this.props.activitySectionPosition,
      this.props.scriptLevel.position,
      {
        [field]: !this.props.scriptLevel[field],
      }
    );
  };

  getTooltipText = option => {
    if (option === 'bonus') {
      return !this.props.lessonExtrasAvailableForUnit
        ? !this.props.scriptLevel[option]
          ? disabledBonusTooltipText
          : bonusAlreadySelectedTooltipText
        : tooltipText[option];
    }

    return tooltipText[option];
  };

  render() {
    const tooltipIds = {};
    Object.keys(tooltipText).forEach(option => {
      tooltipIds[option] = _.uniqueId();
    });
    const scriptLevelOptions = ['bonus', 'assessment', 'challenge'];

    if (this.props.isProfessionalLearningCourse) {
      scriptLevelOptions.push('instructor_in_training');
    }

    const disableBonus =
      !this.props.scriptLevel['bonus'] &&
      !this.props.lessonExtrasAvailableForUnit;

    const inactiveLevelNames = this.props.inactiveLevelNames || [];

    return (
      <div style={styles.levelTokenActive}>
        <span className="level-token-checkboxes">
          {scriptLevelOptions.map(option => (
            <label
              key={option}
              style={styles.checkboxLabel}
              data-for={tooltipIds[option]}
              data-tip
            >
              <input
                type="checkbox"
                style={styles.checkboxInput}
                checked={!!this.props.scriptLevel[option]}
                onChange={this.handleCheckboxChange.bind(this, option)}
                disabled={
                  option === 'bonus' &&
                  (disableBonus || !this.props.allowMajorCurriculumChanges)
                }
              />
              &nbsp;
              <span style={styles.checkboxText}>{optionText[option]}</span>
              <ReactTooltip id={tooltipIds[option]} delayShow={500}>
                <div style={styles.tooltip}>{this.getTooltipText(option)}</div>
              </ReactTooltip>
            </label>
          ))}
        </span>
        {inactiveLevelNames.length > 0 && (
          <div>
            inactive variants:&nbsp;
            {inactiveLevelNames.map(key => `"${key}"`).join(', ')}
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  levelTokenActive: {
    padding: 7,
    background: '#f4f4f4',
    border: '1px solid #ddd',
    borderTop: 0,
  },
  checkboxLabel: {
    display: 'inline-block',
    marginRight: 10,
    marginBottom: 0,
  },
  checkboxInput: {
    marginTop: 0,
    verticalAlign: 'middle',
  },
  checkboxText: {
    verticalAlign: 'middle',
  },
  tooltip: {
    maxWidth: 450,
  },
};

export const UnconnectedLevelTokenDetails = LevelTokenDetails;

export default connect(
  state => ({
    lessonExtrasAvailableForUnit: state.unitInfo.lessonExtrasAvailableForUnit,
    isProfessionalLearningCourse: state.unitInfo.isProfessionalLearningCourse,
  }),
  {
    setScriptLevelField,
  }
)(LevelTokenDetails);
