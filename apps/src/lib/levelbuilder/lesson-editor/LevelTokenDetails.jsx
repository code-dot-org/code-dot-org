import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {setScriptLevelField} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import {scriptLevelShape} from '@cdo/apps/lib/levelbuilder/shapes';
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';

const tooltipText = {
  bonus: 'Include in lesson extras at the end of the lesson',
  assessment:
    'Visibly mark this level as an assessment, and show it in the Assessments tab in Teacher Dashboard.',
  challenge: 'Show students the Challenge dialog when viewing this level.'
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

    //redux
    setScriptLevelField: PropTypes.func.isRequired,
    lessonExtrasAvailableForScript: PropTypes.bool
  };

  handleCheckboxChange = field => {
    this.props.setScriptLevelField(
      this.props.activityPosition,
      this.props.activitySectionPosition,
      this.props.scriptLevel.position,
      {
        [field]: !this.props.scriptLevel[field]
      }
    );
  };

  render() {
    const tooltipIds = {};
    Object.keys(tooltipText).forEach(option => {
      tooltipIds[option] = _.uniqueId();
    });
    const scriptLevelOptions = ['bonus', 'assessment', 'challenge'];

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
                  !this.props.scriptLevel[option] &&
                  !this.props.lessonExtrasAvailableForScript
                }
              />
              &nbsp;
              <span style={styles.checkboxText}>{option}</span>
              <ReactTooltip id={tooltipIds[option]} delayShow={500}>
                <div style={styles.tooltip}>
                  {option === 'bonus' &&
                  !this.props.lessonExtrasAvailableForScript
                    ? !this.props.scriptLevel[option]
                      ? disabledBonusTooltipText
                      : bonusAlreadySelectedTooltipText
                    : tooltipText[option]}
                </div>
              </ReactTooltip>
            </label>
          ))}
        </span>
      </div>
    );
  }
}

const styles = {
  levelTokenActive: {
    padding: 7,
    background: '#f4f4f4',
    border: '1px solid #ddd',
    borderTop: 0
  },
  checkboxLabel: {
    display: 'inline-block',
    marginRight: 10,
    marginBottom: 0
  },
  checkboxInput: {
    marginTop: 0,
    verticalAlign: 'middle'
  },
  checkboxText: {
    verticalAlign: 'middle'
  },
  tooltip: {
    maxWidth: 450
  }
};

export const UnconnectedLevelTokenDetails = LevelTokenDetails;

export default connect(
  state => ({
    lessonExtrasAvailableForScript: state.lessonExtrasAvailableForScript
  }),
  {
    setScriptLevelField
  }
)(LevelTokenDetails);
