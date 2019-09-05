import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import _ from 'lodash';
import color from '../../util/color';
import {borderRadius, ControlTypes} from './constants';
import OrderControls from './OrderControls';
import StageCard from './StageCard';
import {NEW_LEVEL_ID, addStage, addGroup} from './editorRedux';

const styles = {
  groupHeader: {
    fontSize: 18,
    color: 'white',
    background: color.cyan,
    borderTopLeftRadius: borderRadius,
    borderTopRightRadius: borderRadius,
    padding: 10
  },
  groupBody: {
    background: color.lightest_cyan,
    borderBottomLeftRadius: borderRadius,
    borderBottomRightRadius: borderRadius,
    padding: 10,
    marginBottom: 20
  },
  addGroup: {
    fontSize: 14,
    color: 'white',
    background: color.cyan,
    border: `1px solid ${color.cyan}`,
    boxShadow: 'none',
    margin: '0 0 30px 0'
  },
  addStage: {
    fontSize: 14,
    color: '#5b6770',
    background: 'white',
    border: '1px solid #ccc',
    boxShadow: 'none',
    margin: '0 10px 10px 10px'
  },
  bottomControls: {
    height: 30,
    marginBottom: 30
  },
  flexCategoryLabel: {
    fontSize: 14,
    verticalAlign: 'baseline',
    marginRight: 5
  },
  flexCategorySelect: {
    verticalAlign: 'baseline',
    width: 550,
    margin: '0 5px 0 0'
  },
  saveFlexCategoryButton: {
    verticalAlign: 'baseline',
    margin: '0 5px 0 0'
  }
};

// Replace ' with \'
const escape = str => str.replace(/'/, "\\'");

class FlexGroup extends Component {
  static propTypes = {
    addGroup: PropTypes.func.isRequired,
    addStage: PropTypes.func.isRequired,
    stages: PropTypes.array.isRequired,
    levelKeyList: PropTypes.object.isRequired,
    flexCategoryMap: PropTypes.object.isRequired
  };

  state = {
    addingFlexCategory: false,
    newFlexCategory: ''
  };

  handleAddFlexCategory = () => {
    this.setState({
      addingFlexCategory: true,
      newFlexCategory: ''
    });
  };

  cancelAddFlexCategory = () => {
    this.setState({
      addingFlexCategory: false,
      newFlexCategory: ''
    });
  };

  flexCategorySelected = newFlexCategory => {
    this.setState({newFlexCategory});
  };

  handleCreateFlexCategory = () => {
    const {newFlexCategory} = this.state;
    const newStageName = prompt('Enter new stage name');
    this.setState({
      addingFlexCategory: false,
      newFlexCategory: ''
    });
    this.props.addGroup(newStageName, newFlexCategory);
  };

  handleAddStage = position => {
    this.props.addStage(position, prompt('Enter new stage name'));
  };

  /**
   * Generate the ScriptDSL format.
   * @param stages
   * @return {string}
   */
  serializeStages = stages => {
    let s = [];
    stages.forEach(stage => {
      let t = `stage '${escape(stage.name)}'`;
      if (stage.lockable) {
        t += ', lockable: true';
      }
      if (stage.flex_category) {
        t += `, flex_category: '${escape(stage.flex_category)}'`;
      }
      s.push(t);
      stage.levels.forEach(level => {
        if (level.ids.length > 1) {
          s.push('variants');
          level.ids.forEach(id => {
            s = s.concat(this.serializeLevel(id, level, level.activeId === id));
          });
          s.push('endvariants');
        } else {
          s = s.concat(this.serializeLevel(level.ids[0], level));
        }
      });
      s.push('');
    });
    return s.join('\n');
  };

  serializeLevel(id, level, active) {
    if (id === NEW_LEVEL_ID) {
      return;
    }

    const s = [];
    const key = this.props.levelKeyList[id];
    if (/^blockly:/.test(key)) {
      if (level.skin) {
        s.push(`skin '${escape(level.skin)}'`);
      }
      if (level.videoKey) {
        s.push(`video_key_for_next_level '${escape(level.videoKey)}'`);
      }
      if (level.concepts) {
        // concepts is a comma-separated list of single-quoted strings, so do
        // not escape its single quotes.
        s.push(`concepts ${level.concepts}`);
      }
      if (level.conceptDifficulty) {
        s.push(`level_concept_difficulty '${escape(level.conceptDifficulty)}'`);
      }
    }
    let l = `level '${escape(key)}'`;
    if (active === false) {
      l += ', active: false';
    }
    if (level.progression) {
      l += `, progression: '${escape(level.progression)}'`;
    }
    if (level.named) {
      l += `, named: true`;
    }
    if (level.assessment) {
      l += `, assessment: true`;
    }
    if (level.challenge) {
      l += `, challenge: true`;
    }
    s.push(l);
    return s;
  }

  render() {
    const groups = _.groupBy(
      this.props.stages,
      stage => stage.flex_category || ''
    );
    let afterStage = 1;
    const {flexCategoryMap} = this.props;

    return (
      <div>
        {_.keys(groups).map(group => (
          <div key={group}>
            <div style={styles.groupHeader}>
              Flex Category: {group || '(none)'}: "
              {flexCategoryMap[group] || 'Content'}"
              <OrderControls
                type={ControlTypes.Group}
                position={afterStage}
                total={Object.keys(groups).length}
              />
            </div>
            <div style={styles.groupBody}>
              {groups[group].map((stage, index) => {
                afterStage++;
                return (
                  <StageCard
                    key={`stage-${index}`}
                    stagesCount={this.props.stages.length}
                    stage={stage}
                  />
                );
              })}
              <button
                onMouseDown={this.handleAddStage.bind(null, afterStage - 1)}
                className="btn"
                style={styles.addStage}
                type="button"
              >
                <i style={{marginRight: 7}} className="fa fa-plus-circle" />
                Add Stage
              </button>
            </div>
          </div>
        ))}
        {!this.state.addingFlexCategory && (
          <button
            onMouseDown={this.handleAddFlexCategory}
            className="btn"
            style={styles.addGroup}
            type="button"
          >
            <i style={{marginRight: 7}} className="fa fa-plus-circle" />
            Add Flex Category
          </button>
        )}
        {this.state.addingFlexCategory && (
          <div style={styles.bottomControls}>
            <span style={styles.flexCategoryLabel}>New Flex Category:</span>
            &nbsp;
            <select
              style={styles.flexCategorySelect}
              onChange={e => this.flexCategorySelected(e.target.value)}
              value={this.state.newFlexCategory}
            >
              <option value="">(none): "Content"</option>
              {Object.keys(flexCategoryMap).map(flexCategory => (
                <option key={flexCategory} value={flexCategory}>
                  {flexCategory}: "{flexCategoryMap[flexCategory]}"
                </option>
              ))}
            </select>
            <button
              onMouseDown={this.handleCreateFlexCategory}
              className="btn btn-primary"
              style={styles.saveFlexCategoryButton}
              type="button"
            >
              Create
            </button>
            <button
              onMouseDown={this.cancelAddFlexCategory}
              className="btn"
              style={styles.saveFlexCategoryButton}
              type="button"
            >
              Cancel
            </button>
          </div>
        )}
        <input
          type="hidden"
          name="script_text"
          value={this.serializeStages(this.props.stages)}
        />
      </div>
    );
  }
}

export default connect(
  state => ({
    levelKeyList: state.levelKeyList,
    stages: state.stages,
    flexCategoryMap: state.flexCategoryMap
  }),
  dispatch => ({
    addGroup(stageName, groupName) {
      dispatch(addGroup(stageName, groupName));
    },
    addStage(position, stageName) {
      dispatch(addStage(position, stageName));
    }
  })
)(FlexGroup);
