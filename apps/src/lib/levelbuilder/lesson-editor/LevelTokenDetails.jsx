import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {
  chooseLevel,
  addVariant,
  removeVariant,
  setActiveVariant,
  setField
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import {levelShape} from '@cdo/apps/lib/levelbuilder/shapes';
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
  assessment:
    'Visibly mark this level as an assessment, and show it in the Assessments tab in Teacher Dashboard.',
  named:
    'Show this level on a line by itself, with the Display Name of the level as the label. This option is deprecated. Please specify a progression name instead.',
  challenge: 'Show students the Challenge dialog when viewing this level.',
  progression:
    'Group this level with other levels in the same progression, with this text as the label.'
};

const ArrowRenderer = ({onMouseDown}) => {
  return <i className="fa fa-chevron-down" onMouseDown={onMouseDown} />;
};
ArrowRenderer.propTypes = {onMouseDown: PropTypes.func.isRequried};

class LevelTokenDetails extends Component {
  static propTypes = {
    level: levelShape.isRequired,
    activitySectionPosition: PropTypes.number.isRequired,
    activityPosition: PropTypes.number.isRequired,

    //redux
    levelKeyList: PropTypes.object.isRequired,
    levelNameToIdMap: PropTypes.objectOf(PropTypes.number).isRequired,
    chooseLevel: PropTypes.func.isRequired,
    addVariant: PropTypes.func.isRequired,
    removeVariant: PropTypes.func.isRequired,
    setActiveVariant: PropTypes.func.isRequired,
    setField: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      // Variants are deprecated. Only show them if they are already in use.
      // If the number of variants is reduced to 1, keep showing the Add
      // Variants button for the rest of this editing session.
      showAddVariants: props.level.ids.length > 1,
      // Named levels are deprecated. Only show the checkbox if the level is
      // already marked as named, otherwise the author can name the level by
      // specifying a name in the progression field.
      showNamed: props.level.named
    };
  }

  containsLegacyLevel() {
    return this.props.level.ids.some(id =>
      /^blockly:/.test(this.props.levelKeyList[id])
    );
  }

  handleLevelSelected = (variant, levelId) => {
    this.props.chooseLevel(
      this.props.activityPosition,
      this.props.activitySectionPosition,
      this.props.level.position,
      variant,
      levelId
    );
  };

  handleAddVariant = () => {
    this.props.addVariant(
      this.props.activityPosition,
      this.props.activitySectionPosition,
      this.props.level.position
    );
  };

  handleRemoveVariant = levelId => {
    this.props.removeVariant(
      this.props.activityPosition,
      this.props.activitySectionPosition,
      this.props.level.position,
      levelId
    );
  };

  handleActiveVariantChanged = id => {
    this.props.setActiveVariant(
      this.props.activityPosition,
      this.props.activitySectionPosition,
      this.props.level.position,
      id
    );
  };

  handleFieldChange = (field, event) => {
    this.props.setField(
      this.props.activityPosition,
      this.props.activitySectionPosition,
      this.props.level.position,
      {
        [field]: event.target.value
      }
    );
  };

  handleCheckboxChange = field => {
    this.props.setField(
      this.props.activityPosition,
      this.props.activitySectionPosition,
      this.props.level.position,
      {
        [field]: !this.props.level[field]
      }
    );
  };

  render() {
    const {showAddVariants} = this.state;
    const tooltipIds = {};
    Object.keys(tooltipText).forEach(option => {
      tooltipIds[option] = _.uniqueId();
    });
    const scriptLevelOptions = ['assessment', 'challenge'];
    if (this.state.showNamed) {
      scriptLevelOptions.push('named');
    }
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
                checked={!!this.props.level[option]}
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
              defaultValue={this.props.level.skin}
              type="text"
              style={styles.shortTextInput}
              onChange={event => this.handleFieldChange('skin', event)}
            />
            <span style={styles.levelFieldLabel}>Video key:</span>
            <input
              defaultValue={this.props.level.videoKey}
              type="text"
              style={styles.shortTextInput}
              onChange={event => this.handleFieldChange('videoKey', event)}
            />
            <div style={{clear: 'both'}} />
            <span style={styles.levelFieldLabel}>Difficulty:</span>
            <input
              defaultValue={this.props.level.conceptDifficulty}
              type="text"
              style={styles.shortTextInput}
              onChange={event =>
                this.handleFieldChange('conceptDifficulty', event)
              }
            />
            <span style={styles.levelFieldLabel}>Concepts:</span>
            <input
              defaultValue={this.props.level.concepts}
              type="text"
              style={styles.shortTextInput}
              onChange={event => this.handleFieldChange('concepts', event)}
            />
          </div>
        )}
        {this.props.level.ids.length > 1 &&
          this.props.level.ids.map((id, index) => (
            <div key={id}>
              <div>
                <hr style={styles.divider} />
                <span>
                  <span style={styles.levelFieldLabel}>Active</span>
                  <input
                    type="radio"
                    onChange={this.handleActiveVariantChanged.bind(this, id)}
                    defaultChecked={id === this.props.level.activeId}
                    style={styles.checkbox}
                    name={`radio-${this.props.level.position}`}
                  />
                </span>
                {id !== this.props.level.activeId && (
                  <span style={styles.removeVariant}>
                    <button
                      onMouseDown={() => this.handleRemoveVariant(id)}
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
                onSelectLevel={id => this.handleLevelSelected(index, id)}
                levelNameToIdMap={this.props.levelNameToIdMap}
                initialLevelName={this.props.levelKeyList[id] || ''}
              />
            </div>
          ))}
        {showAddVariants && (
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
        )}
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
    setField
  }
)(LevelTokenDetails);
