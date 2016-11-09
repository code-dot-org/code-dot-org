import React from 'react';
import { connect } from 'react-redux';
import VirtualizedSelect from 'react-virtualized-select';
import 'react-virtualized/styles.css';
import 'react-select/dist/react-select.css';
import 'react-virtualized-select/styles.css';
import _ from 'lodash';
import { chooseLevelType, chooseLevel, addVariant, setActiveVariant } from './editorRedux';

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
    lineHeight: '36px',
    margin: '0 7px 0 5px'
  },
  levelTypeSelect: {
    width: 'calc(100% - 80px)',
    margin: '0 0 5px 80px'
  },
  textInput: {
    height: 34,
    width: 350,
    boxSizing: 'border-box',
    verticalAlign: 'baseline',
    margin: '7px 0 10px 0'
  },
  divider: {
    borderColor: '#ddd',
    margin: '7px 0'
  },
  addVariant: {
    fontSize: 14,
    background: 'white',
    border: '1px solid #ddd',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.6)',
    margin: '0'
  }
};

const ArrowRenderer = ({onMouseDown}) => {
  return <i className="fa fa-chevron-down" onMouseDown={onMouseDown}/>;
};
ArrowRenderer.propTypes = {onMouseDown: React.PropTypes.func.isRequried};

const LevelTokenDetails = React.createClass({
  propTypes: {
    levelKeyList: React.PropTypes.object.isRequired,
    chooseLevelType: React.PropTypes.func.isRequired,
    chooseLevel: React.PropTypes.func.isRequired,
    addVariant: React.PropTypes.func.isRequired,
    level: React.PropTypes.object.isRequired,
    stagePosition: React.PropTypes.number.isRequired
  },

  levelKindOptions: [
    {label: 'Puzzle', value: 'puzzle'},
    {label: 'Assessment', value: 'assessment'},
    {label: 'Named Level', value: 'named_level'},
    {label: 'Unplugged', value: 'unplugged'}
  ],

  componentWillMount() {
    this.levelKeyOptions = _.map(this.props.levelKeyList, (label, value) => ({
      label,
      value: +value
    }));
  },

  containsLegacyLevel() {
    return this.props.level.ids.some(id => /^blockly:/.test(this.props.levelKeyList[id]));
  },

  handleLevelTypeSelected({value}) {
    this.props.chooseLevelType(this.props.stagePosition, this.props.level.position, value);
  },

  handleLevelSelected(index, {value}) {
    this.props.chooseLevel(this.props.stagePosition, this.props.level.position, index, value);
  },

  handleAddVariant() {
    this.props.addVariant(this.props.stagePosition, this.props.level.position);
  },

  handleActiveVariantChanged(id) {
    this.props.setActiveVariant(this.props.stagePosition, this.props.level.position, id);
  },

  render() {
    return (
      <div style={styles.levelTokenActive}>
        <span style={Object.assign({float: 'left'}, styles.levelFieldLabel)}>
          Level type
        </span>
        <VirtualizedSelect
          value={this.props.level.kind}
          options={this.levelKindOptions}
          onChange={this.handleLevelTypeSelected}
          clearable={false}
          arrowRenderer={ArrowRenderer}
          style={styles.levelTypeSelect}
        />
        {this.containsLegacyLevel() &&
          <div>
            <span
              style={Object.assign(
                {display: 'inline-block'},
                styles.levelFieldLabel
              )}
            >
              Skin
            </span>
            <input
              defaultValue={this.props.level.skin}
              type="text"
              style={styles.textInput}
            />
            <div style={{float: 'right'}}>
              <span
                style={Object.assign(
                  {display: 'inline-block'},
                  styles.levelFieldLabel
                )}
              >
                Video key
              </span>
              <input
                defaultValue={this.props.level.videoKey}
                type="text"
                style={styles.textInput}
              />
            </div>
          </div>
        }
        {this.props.level.ids.map((id, index) =>
          <div key={id}>
            {this.props.level.ids.length > 1 &&
            <div>
              <hr style={styles.divider} />
              <span style={styles.levelFieldLabel}>Active</span>
              <input
                type="radio"
                onChange={this.handleActiveVariantChanged.bind(this, id)}
                defaultChecked={id === this.props.level.activeId}
                style={styles.checkbox}
                name={`radio-${this.props.stagePosition}-${this.props.level.position}`}
              />
            </div>
            }
            <VirtualizedSelect
              options={this.levelKeyOptions}
              value={id}
              onChange={this.handleLevelSelected.bind(null, index)}
              clearable={false}
              arrowRenderer={ArrowRenderer}
            />
          </div>
        )}
        <hr style={styles.divider} />
        <button
          onMouseDown={this.handleAddVariant}
          className="btn"
          style={styles.addVariant}
          type="button"
        >
          <i style={{marginRight: 7}} className="fa fa-plus-circle" />
          Add Variant
        </button>
      </div>
    );
  }
});

export default connect(state => ({
  levelKeyList: state.levelKeyList
}), dispatch => ({
  chooseLevelType(stage, level, value) {
    dispatch(chooseLevelType(stage, level, value));
  },
  chooseLevel(stage, level, variant, value) {
    dispatch(chooseLevel(stage, level, variant, value));
  },
  addVariant(stage, level) {
    dispatch(addVariant(stage, level));
  },
  setActiveVariant(stage, level, id) {
    dispatch(setActiveVariant(stage, level, id));
  }
}))(LevelTokenDetails);
