import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {
  chooseLevel,
  addVariant,
  removeVariant,
  setActiveVariant,
  setLevelField,
  setScriptLevelField
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import {scriptLevelShape} from '@cdo/apps/lib/levelbuilder/shapes';
import LevelNameInput from '@cdo/apps/lib/levelbuilder/lesson-editor/LevelNameInput';
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';

const styles = {
  checkbox: {
    margin: '0 0 0 7px'
  },
  levelTokenActive: {
    padding: 7,
    background: '#f4f4f4',
    border: '1px solid #ddd',
    borderTop: 0
  },
  levelFieldLabel: {
    display: 'inline-block',
    lineHeight: '36px',
    margin: '0 7px 0 5px',
    verticalAlign: 'baseline',
    textAlign: 'right',
    width: 80
  },
  shortTextInput: {
    width: 330,
    verticalAlign: 'baseline',
    marginBottom: 0
  },
  progressionTextInput: {
    width: 550,
    verticalAlign: 'baseline',
    marginBottom: 0
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
  divider: {
    borderColor: '#ddd',
    margin: '7px 0',
    paddingBottom: 5
  },
  button: {
    fontSize: 14,
    background: 'white',
    border: '1px solid #ddd',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.6)',
    margin: '0'
  },
  removeVariant: {
    float: 'right'
  },
  tooltip: {
    maxWidth: 450
  }
};

const tooltipText = {
  bonus: 'Include in lesson extras at the end of the lesson',
  assessment:
    'Visibly mark this level as an assessment, and show it in the Assessments tab in Teacher Dashboard.',
  challenge: 'Show students the Challenge dialog when viewing this level.'
};

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
    levelKeyList: PropTypes.object.isRequired,
    levelNameToIdMap: PropTypes.objectOf(PropTypes.number).isRequired,
    chooseLevel: PropTypes.func.isRequired,
    addVariant: PropTypes.func.isRequired,
    removeVariant: PropTypes.func.isRequired,
    setActiveVariant: PropTypes.func.isRequired,
    setLevelField: PropTypes.func.isRequired,
    setScriptLevelField: PropTypes.func.isRequired
  };

  containsLegacyLevel() {
    return this.props.scriptLevel.levels.some(level =>
      /^blockly:/.test(this.props.levelKeyList[level.id])
    );
  }

  handleLevelSelected = (variant, levelId) => {
    this.props.chooseLevel(
      this.props.activityPosition,
      this.props.activitySectionPosition,
      this.props.scriptLevel.position,
      variant,
      levelId
    );
  };

  handleAddVariant = () => {
    this.props.addVariant(
      this.props.activityPosition,
      this.props.activitySectionPosition,
      this.props.scriptLevel.position
    );
  };

  handleRemoveVariant = levelId => {
    this.props.removeVariant(
      this.props.activityPosition,
      this.props.activitySectionPosition,
      this.props.scriptLevel.position,
      levelId
    );
  };

  handleActiveVariantChanged = id => {
    this.props.setActiveVariant(
      this.props.activityPosition,
      this.props.activitySectionPosition,
      this.props.scriptLevel.position,
      id
    );
  };

  handleFieldChange = (field, event) => {
    this.props.setLevelField(
      this.props.activityPosition,
      this.props.activitySectionPosition,
      this.props.scriptLevel.position,
      {
        [field]: event.target.value
      }
    );
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

    const hasVariants = this.props.scriptLevel.levels.length > 1;

    const activeLevel = hasVariants
      ? this.props.scriptLevel.levels.filter(level => {
          return level.id === this.props.scriptLevel.activeId;
        })[0]
      : this.props.scriptLevel.levels[0];

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
              />
              &nbsp;
              <span style={styles.checkboxText}>{option}</span>
              <ReactTooltip id={tooltipIds[option]} delayShow={500}>
                <div style={styles.tooltip}>{tooltipText[option]}</div>
              </ReactTooltip>
            </label>
          ))}
        </span>
        {this.containsLegacyLevel() && (
          <div>
            <hr style={styles.divider} />
            <div style={{clear: 'both'}} />
            <span style={styles.levelFieldLabel}>Skin:</span>
            <input
              defaultValue={activeLevel.skin}
              type="text"
              style={styles.shortTextInput}
              onChange={event => this.handleFieldChange('skin', event)}
            />
            <span style={styles.levelFieldLabel}>Video key:</span>
            <input
              defaultValue={activeLevel.videoKey}
              type="text"
              style={styles.shortTextInput}
              onChange={event => this.handleFieldChange('videoKey', event)}
            />
            <div style={{clear: 'both'}} />
            <span style={styles.levelFieldLabel}>Difficulty:</span>
            <input
              defaultValue={activeLevel.conceptDifficulty}
              type="text"
              style={styles.shortTextInput}
              onChange={event =>
                this.handleFieldChange('conceptDifficulty', event)
              }
            />
            <span style={styles.levelFieldLabel}>Concepts:</span>
            <input
              defaultValue={activeLevel.concepts}
              type="text"
              style={styles.shortTextInput}
              onChange={event => this.handleFieldChange('concepts', event)}
            />
          </div>
        )}
        {hasVariants &&
          this.props.scriptLevel.levels.map((level, index) => (
            <div key={level.id}>
              <div>
                <hr style={styles.divider} />
                <span>
                  <span style={styles.levelFieldLabel}>Active</span>
                  <input
                    type="radio"
                    onChange={this.handleActiveVariantChanged.bind(
                      this,
                      level.id
                    )}
                    defaultChecked={
                      level.id === this.props.scriptLevel.activeId
                    }
                    style={styles.checkbox}
                    name={`radio-${this.props.scriptLevel.position}`}
                  />
                </span>
                {level.id !== this.props.scriptLevel.activeId && (
                  <span style={styles.removeVariant}>
                    <button
                      onMouseDown={() => this.handleRemoveVariant(level.id)}
                      className="btn"
                      style={styles.button}
                      type="button"
                    >
                      <i
                        style={{marginRight: 7}}
                        className="fa fa-minus-circle"
                      />
                      Remove Variant
                    </button>
                  </span>
                )}
              </div>
              )}
              <span style={{...styles.levelFieldLabel}}>Level name:</span>
              <LevelNameInput
                onSelectLevel={this.handleLevelSelected.bind(
                  this,
                  index,
                  level.id
                )}
                levelNameToIdMap={this.props.levelNameToIdMap}
                initialLevelName={this.props.levelKeyList[level.id] || ''}
              />
            </div>
          ))}
        <div>
          <hr style={styles.divider} />
          <button
            onMouseDown={this.handleAddVariant}
            className="btn"
            style={styles.button}
            type="button"
          >
            <i style={{marginRight: 7}} className="fa fa-plus-circle" />
            Add Variant
          </button>
        </div>
      </div>
    );
  }
}

export const UnconnectedLevelTokenDetails = LevelTokenDetails;

export default connect(
  state => ({
    levelKeyList: state.levelKeyList,
    levelNameToIdMap: state.levelNameToIdMap
  }),
  {
    chooseLevel,
    addVariant,
    removeVariant,
    setActiveVariant,
    setLevelField,
    setScriptLevelField
  }
)(LevelTokenDetails);
