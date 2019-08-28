import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import VirtualizedSelect from 'react-virtualized-select';
import 'react-virtualized/styles.css';
import 'react-select/dist/react-select.css';
import 'react-virtualized-select/styles.css';
import _ from 'lodash';
import {
  chooseLevel,
  addVariant,
  removeVariant,
  setActiveVariant,
  setField,
  NEW_LEVEL_ID
} from './editorRedux';
import {levelShape} from './shapes';

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
    verticalAlign: 'middle'
  },
  levelSelect: {
    display: 'inline-block',
    verticalAlign: 'middle',
    width: 600
  },
  textInput: {
    height: 34,
    width: 350,
    boxSizing: 'border-box',
    verticalAlign: 'baseline',
    margin: '7px 0 10px 0'
  },
  progressionTextInput: {
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
    margin: '7px 0'
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
  progression: {
    paddingTop: 5
  }
};

const ArrowRenderer = ({onMouseDown}) => {
  return <i className="fa fa-chevron-down" onMouseDown={onMouseDown} />;
};
ArrowRenderer.propTypes = {onMouseDown: PropTypes.func.isRequried};

export class UnconnectedLevelTokenDetails extends Component {
  static propTypes = {
    levelKeyList: PropTypes.object.isRequired,
    chooseLevel: PropTypes.func.isRequired,
    addVariant: PropTypes.func.isRequired,
    removeVariant: PropTypes.func.isRequired,
    setActiveVariant: PropTypes.func.isRequired,
    setField: PropTypes.func.isRequired,
    level: levelShape.isRequired,
    stagePosition: PropTypes.number.isRequired
  };

  state = {
    showBlankProgression: false
  };

  componentWillMount() {
    this.levelKeyOptions = _.map(this.props.levelKeyList, (label, value) => ({
      label,
      value: +value
    }));
  }

  containsLegacyLevel() {
    return this.props.level.ids.some(id =>
      /^blockly:/.test(this.props.levelKeyList[id])
    );
  }

  handleLevelSelected = (index, {value}) => {
    this.props.chooseLevel(
      this.props.stagePosition,
      this.props.level.position,
      index,
      value
    );
  };

  handleAddVariant = () => {
    this.props.addVariant(this.props.stagePosition, this.props.level.position);
  };

  handleRemoveVariant = levelId => {
    this.props.removeVariant(
      this.props.stagePosition,
      this.props.level.position,
      levelId
    );
  };

  handleAddProgression = () => {
    this.setState({showBlankProgression: true});
  };

  handleActiveVariantChanged = id => {
    this.props.setActiveVariant(
      this.props.stagePosition,
      this.props.level.position,
      id
    );
  };

  handleFieldChange = (field, event) => {
    this.props.setField(this.props.stagePosition, this.props.level.position, {
      [field]: event.target.value
    });
  };

  handleProgressionChange = e => {
    this.props.setField(this.props.stagePosition, this.props.level.position, {
      progression: e.target.value
    });
  };

  handleCheckboxChange = field => {
    this.props.setField(this.props.stagePosition, this.props.level.position, {
      [field]: !this.props.level[field]
    });
  };

  render() {
    const scriptLevelOptions = ['assessment', 'named', 'challenge'];
    return (
      <div style={styles.levelTokenActive}>
        <span className="level-token-checkboxes">
          {scriptLevelOptions.map(option => (
            <label key={option} style={styles.checkboxLabel}>
              <input
                type="checkbox"
                style={styles.checkboxInput}
                checked={!!this.props.level[option]}
                onChange={this.handleCheckboxChange.bind(this, option)}
              />
              &nbsp;<span style={styles.checkboxText}>{option}</span>
            </label>
          ))}
        </span>
        <hr style={styles.divider} />
        <div style={{clear: 'both'}} />
        {this.containsLegacyLevel() && (
          <div>
            <span style={styles.levelFieldLabel}>Skin</span>
            <input
              defaultValue={this.props.level.skin}
              type="text"
              style={styles.textInput}
              onChange={event => this.handleFieldChange('skin', event)}
            />
            <div style={{float: 'right'}}>
              <span style={styles.levelFieldLabel}>Video key</span>
              <input
                defaultValue={this.props.level.videoKey}
                type="text"
                style={styles.textInput}
                onChange={event => this.handleFieldChange('videoKey', event)}
              />
            </div>
            <div style={{clear: 'both'}} />
            <span style={styles.levelFieldLabel}>Difficulty</span>
            <input
              defaultValue={this.props.level.conceptDifficulty}
              type="text"
              style={styles.textInput}
              onChange={event =>
                this.handleFieldChange('conceptDifficulty', event)
              }
            />
            <div style={{float: 'right'}}>
              <span style={styles.levelFieldLabel}>Concepts</span>
              <input
                defaultValue={this.props.level.concepts}
                type="text"
                style={Object.assign({}, styles.textInput, {width: 320})}
                onChange={this.handleFieldChange.bind(this, 'concepts')}
              />
            </div>
          </div>
        )}
        {this.props.level.ids.map((id, index) => (
          <div key={id}>
            {this.props.level.ids.length > 1 && (
              <div>
                <hr style={styles.divider} />
                <span>
                  <span style={styles.levelFieldLabel}>Active</span>
                  <input
                    type="radio"
                    onChange={this.handleActiveVariantChanged.bind(this, id)}
                    defaultChecked={id === this.props.level.activeId}
                    style={styles.checkbox}
                    name={`radio-${this.props.stagePosition}-${
                      this.props.level.position
                    }`}
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
            <span style={styles.levelSelect}>
              <VirtualizedSelect
                options={this.levelKeyOptions}
                value={id}
                onChange={this.handleLevelSelected.bind(null, index)}
                clearable={false}
                arrowRenderer={ArrowRenderer}
              />
            </span>
          </div>
        ))}
        {/* We don't currently support editing progression names here, but do
         * show the current progression if we have one. */}
        {(this.props.level.progression || this.state.showBlankProgression) && (
          <div style={styles.progression}>
            <hr style={styles.divider} />
            <span style={styles.levelFieldLabel}>Progression name:</span>
            <span style={styles.levelSelect}>
              <input
                type="text"
                onChange={event => this.handleFieldChange('progression', event)}
                value={this.props.level.progression}
                style={styles.textInput}
                data-field-name="progression"
              />
            </span>
          </div>
        )}
        <hr style={styles.divider} />
        {!this.props.level.ids.includes(NEW_LEVEL_ID) && (
          <button
            onMouseDown={this.handleAddVariant}
            className="btn"
            style={styles.button}
            type="button"
          >
            <i style={{marginRight: 7}} className="fa fa-plus-circle" />
            Add Variant
          </button>
        )}
        {!this.props.level.progression && !this.state.showBlankProgression && (
          <button
            onMouseDown={this.handleAddProgression}
            className="btn"
            style={styles.button}
            type="button"
          >
            <i style={{marginRight: 7}} className="fa fa-plus-circle" />
            Add Progression
          </button>
        )}
      </div>
    );
  }
}

export default connect(
  state => ({
    levelKeyList: state.levelKeyList
  }),
  dispatch => ({
    chooseLevel(stage, level, variant, value) {
      dispatch(chooseLevel(stage, level, variant, value));
    },
    addVariant(stage, level) {
      dispatch(addVariant(stage, level));
    },
    removeVariant(stage, level, levelId) {
      dispatch(removeVariant(stage, level, levelId));
    },
    setActiveVariant(stage, level, id) {
      dispatch(setActiveVariant(stage, level, id));
    },
    setField(stage, level, modifier) {
      dispatch(setField(stage, level, modifier));
    }
  })
)(UnconnectedLevelTokenDetails);
