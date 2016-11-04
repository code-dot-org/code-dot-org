/* global levelKeyList */

import React from 'react';
import _ from 'lodash';
import FlexGroup from './FlexGroup';

const styles = {
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '4px 6px',
    color: '#555',
    border: '1px solid #ccc',
    borderRadius: 4
  },
  checkbox: {
    margin: '0 0 0 7px'
  }
};

let newStageId = -1;
let newLevelId = -1;

/**
 * Component for editing course scripts.
 */
const ScriptEditor = React.createClass({
  propTypes: {
    scriptData: React.PropTypes.object.isRequired,
    i18nData: React.PropTypes.object.isRequired
  },

  getInitialState() {
    return {stages: this.props.scriptData.stages.filter(stage => stage.id)};
  },

  handleAction(type, options) {
    let newState = _.cloneDeep(this.state.stages);
    switch (type) {
      case 'ADD_GROUP': {
        newState.push({
          id: newStageId--,
          name: 'New Stage',
          flex_category: `New Group ${Math.round(Math.random() * 10000).toString(16)}`,
          levels: []
        });
        this.updatePositions(newState);
        break;
      }
      case 'ADD_STAGE': {
        const groupName = newState[options.position - 1].flex_category;
        newState.splice(options.position, 0, {
          id: newStageId--,
          name: 'New Stage',
          flex_category: groupName,
          levels: []
        });
        this.updatePositions(newState);
        break;
      }
      case 'ADD_LEVEL': {
        const levels = newState[options.stage - 1].levels;
        const id = newLevelId--;
        levels.push({
          ids: [id],
          activeId: id,
          expand: true
        });
        this.updatePositions(levels);
        break;
      }
      case 'ADD_VARIANT': {
        newState[options.stage - 1].levels[options.level - 1].ids.push(newLevelId--);
        break;
      }
      case 'REMOVE_GROUP': {
        const groupName = newState[options.position - 1].flex_category;
        newState = newState.filter(stage => stage.flex_category !== groupName);
        this.updatePositions(newState);
        break;
      }
      case 'REMOVE_STAGE': {
        newState.splice(options.position - 1, 1);
        this.updatePositions(newState);
        break;
      }
      case 'REMOVE_LEVEL': {
        const levels = newState[options.stage - 1].levels;
        levels.splice(options.level - 1, 1);
        this.updatePositions(levels);
        break;
      }
      case 'REORDER_LEVEL': {
        const levels = newState[options.stage - 1].levels;
        const temp = levels.splice(options.levelA - 1, 1);
        levels.splice(options.levelB - 1, 0, temp[0]);
        this.updatePositions(levels);
        break;
      }
      case 'CHOOSE_LEVEL': {
        const level = newState[options.stage - 1].levels[options.level - 1];
        if (level.ids[options.index] === level.activeId) {
          level.activeId = options.value;
          level.key = levelKeyList[options.value];
        }
        level.ids[options.index] = options.value;
        break;
      }
      case 'CHOOSE_LEVEL_TYPE': {
        newState[options.stage - 1].levels[options.level - 1].kind = options.value;
        break;
      }
      case 'TOGGLE_EXPAND': {
        const level = newState[options.stage - 1].levels[options.level - 1];
        level.expand = !level.expand;
        break;
      }
      case 'MOVE_GROUP': {
        if (options.direction !== 'up' && options.position === newState.length) {
          break;
        }
        const index = options.position - 1;
        const groupName = newState[index].flex_category;
        let categories = newState.map(s => s.flex_category);
        let start = categories.indexOf(groupName);
        let count = categories.filter(c => c === groupName).length;
        const swap = newState.splice(start, count);
        categories = newState.map(s => s.flex_category);
        const swappedGroupName = newState[options.direction === 'up' ? index - 1 : index].flex_category;
        start = categories.indexOf(swappedGroupName);
        count = categories.filter(c => c === swappedGroupName).length;
        newState.splice(options.direction === 'up' ? start : start + count, 0, ...swap);
        console.log(newState.map(s => s.flex_category));
        this.updatePositions(newState);
        break;
      }
      case 'MOVE_STAGE': {
        const index = options.position - 1;
        const swap = (options.direction === 'up' ? index - 1 : index + 1);
        const temp = newState[index];
        newState[index] = newState[swap];
        newState[swap] = temp;
        this.updatePositions(newState);
        break;
      }
      default:
        throw 'Unexpected action';
    }
    this.setState({stages: newState});
  },

  updatePositions(node) {
    for (var i = 0; i < node.length; i++) {
      node[i].position = i + 1;
    }
  },

  render() {
    return (
      <div>
        <h2>I18n Strings</h2>
        <label>
          Title
          <input
            name="title"
            defaultValue={this.props.i18nData.title}
            style={styles.input}
          />
        </label>
        <label>
          Audience
          <input
            name="description_audience"
            defaultValue={this.props.i18nData.descriptionAudience}
            style={styles.input}
          />
        </label>
        <label>
          Short Description
          <input
            name="description_short"
            defaultValue={this.props.i18nData.descriptionShort}
            style={styles.input}
          />
        </label>
        <label>
          Description
          <textarea
            name="description"
            defaultValue={this.props.i18nData.description}
            rows={5}
            style={styles.input}
          />
        </label>
        <h2>Basic Settings</h2>
        <label>
          Visible in Teacher Dashboard
          <input
            name="visible_to_teachers"
            type="checkbox"
            defaultChecked={!this.props.scriptData.hidden}
            style={styles.checkbox}
          />
          <p>If checked this script will show up in the dropdown on the Teacher Dashboard, for teachers to assign to students.</p>
        </label>
        <label>
          Login Required
          <input
            name="login_required"
            type="checkbox"
            defaultChecked={this.props.scriptData.loginRequired}
            style={styles.checkbox}
          />
          <p>Require users to log in before viewing this script. This should be enabled on scripts that contain App Lab or Game Lab levels.</p>
        </label>
        <label>
          Hideable Stages
          <input
            name="hideable_stages"
            type="checkbox"
            defaultChecked={this.props.scriptData.hideable_stages}
            style={styles.checkbox}
          />
          <p>Allow teachers to toggle whether or not specific stages in this script are visible to students in their section.</p>
        </label>
        <label>
          Professional Learning Course
          <input
            name="professional_learning_course"
            defaultValue={this.props.scriptData.professionalLearningCourse}
            style={styles.input}
          />
        </label>
        <label>
          Peer Reviews to Complete
          <input
            name="peer_reviews_to_complete"
            defaultValue={this.props.scriptData.peerReviewsRequired}
            style={styles.input}
          />
        </label>
        <label>
          Wrap-up Video
          <input
            name="wrapup_video"
            defaultValue={this.props.scriptData.wrapupVideo}
            style={styles.input}
          />
        </label>
        <h2>Stages and Levels</h2>
        <FlexGroup stages={this.state.stages} handleAction={this.handleAction} />
      </div>
    );
  }
});

export default ScriptEditor;
