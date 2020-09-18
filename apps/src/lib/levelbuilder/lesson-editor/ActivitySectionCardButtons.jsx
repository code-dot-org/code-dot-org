import React, {Component} from 'react';
import PropTypes from 'prop-types';
import AddLevelDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/AddLevelDialog';
import LessonTipIconWithTooltip from '@cdo/apps/lib/levelbuilder/lesson-editor/LessonTipIconWithTooltip';
import AddResourceDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/AddResourceDialog';
import EditTipDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/EditTipDialog';
import {activitySectionShape} from '@cdo/apps/lib/levelbuilder/shapes';

const styles = {
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
  }
};

export default class ActivitySectionCardButtons extends Component {
  static propTypes = {
    activitySection: activitySectionShape,
    activityPosition: PropTypes.number,
    addTip: PropTypes.func,
    editTip: PropTypes.func,
    addLevel: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      addTipOpen: false,
      editingExistingTip: false,
      addResourceOpen: false,
      addLevelOpen: false,
      tipToEdit: {key: 'tip', type: 'teachingTip', markdown: ''}
    };
  }

  handleOpenAddLevel = () => {
    this.setState({addLevelOpen: true});
  };

  handleCloseAddLevel = () => {
    this.setState({addLevelOpen: false});
  };

  handleEditTip = tip => {
    this.setState({tipToEdit: tip, addTipOpen: true, editingExistingTip: true});
  };

  handleOpenAddTip = () => {
    this.setState({
      tipToEdit: {
        key: this.generateTipKey(),
        type: 'teachingTip',
        markdown: ''
      },
      addTipOpen: true
    });
  };

  generateTipKey = () => {
    let tipNumber = this.props.activitySection.tips.length + 1;
    while (
      this.props.activitySection.tips.some(
        tip => tip.key === `tip-${tipNumber}`
      )
    ) {
      tipNumber++;
    }

    return `tip-${tipNumber}`;
  };

  handleCloseAddTip = tip => {
    if (!this.state.editingExistingTip) {
      this.props.addTip(tip);
    }
    this.setState({addTipOpen: false, editingExistingTip: false});
  };

  handleOpenAddResource = () => {
    this.setState({addResourceOpen: true});
  };

  handleCloseAddResource = () => {
    this.setState({addResourceOpen: false});
  };

  render() {
    return (
      <div>
        <div style={styles.bottomControls}>
          <span>
            <button
              onMouseDown={this.handleOpenAddLevel}
              className="btn"
              style={styles.addLevel}
              type="button"
            >
              <i style={{marginRight: 7}} className="fa fa-plus-circle" />
              Level
            </button>
            <button
              onMouseDown={this.handleOpenAddTip}
              className="btn"
              style={styles.addLevel}
              type="button"
            >
              <i style={{marginRight: 7}} className="fa fa-plus-circle" />
              Tip
            </button>
            <button
              onMouseDown={this.handleOpenAddResource}
              className="btn"
              style={styles.addLevel}
              type="button"
            >
              <i style={{marginRight: 7}} className="fa fa-plus-circle" />
              Resource Link
            </button>
          </span>
          {this.props.activitySection.tips.length > 0 && (
            <span>
              {this.props.activitySection.tips.map(tip => (
                <LessonTipIconWithTooltip
                  tip={tip}
                  key={tip.key}
                  onClick={this.handleEditTip}
                />
              ))}
            </span>
          )}
        </div>
        <AddResourceDialog
          isOpen={this.state.addResourceOpen}
          handleConfirm={this.handleCloseAddResource}
        />
        <EditTipDialog
          isOpen={this.state.addTipOpen}
          handleConfirm={this.handleCloseAddTip}
          tip={this.state.tipToEdit}
        />
        <AddLevelDialog
          isOpen={this.state.addLevelOpen}
          handleConfirm={this.handleCloseAddLevel}
          currentLevels={this.props.activitySection.levels}
          addLevel={this.props.addLevel}
          activitySectionPosition={this.props.activitySection.position}
          activityPosition={this.props.activityPosition}
        />
      </div>
    );
  }
}
