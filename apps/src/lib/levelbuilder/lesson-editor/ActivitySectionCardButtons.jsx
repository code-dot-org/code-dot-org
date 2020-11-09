import React, {Component} from 'react';
import PropTypes from 'prop-types';
import AddLevelDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/AddLevelDialog';
import LessonTipIconWithTooltip from '@cdo/apps/lib/levelbuilder/lesson-editor/LessonTipIconWithTooltip';
import FindResourceDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/FindResourceDialog';
import EditTipDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/EditTipDialog';
import {activitySectionShape} from '@cdo/apps/lib/levelbuilder/shapes';
import {connect} from 'react-redux';
import {
  addTip,
  updateTip,
  removeTip
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';

const styles = {
  bottomControls: {
    height: 30,
    display: 'flex',
    justifyContent: 'space-between'
  },
  addButton: {
    fontSize: 14,
    background: '#eee',
    border: '1px solid #ddd',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
    margin: '0 5px 0 0'
  }
};

class ActivitySectionCardButtons extends Component {
  static propTypes = {
    activitySection: activitySectionShape.isRequired,
    activityPosition: PropTypes.number.isRequired,
    addTip: PropTypes.func.isRequired,
    addLevel: PropTypes.func.isRequired,
    updateTip: PropTypes.func.isRequired,
    removeTip: PropTypes.func.isRequired,
    appendResourceLink: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      editingExistingTip: false,
      addResourceOpen: false,
      addLevelOpen: false,
      tipToEdit: null
    };
  }

  handleOpenAddLevel = () => {
    this.setState({addLevelOpen: true});
  };

  handleCloseAddLevel = () => {
    this.setState({addLevelOpen: false});
  };

  handleEditTip = tip => {
    this.setState({tipToEdit: tip, editingExistingTip: true});
  };

  handleOpenAddTip = () => {
    this.setState({
      tipToEdit: {
        key: this.generateTipKey(),
        type: 'teachingTip',
        markdown: ''
      }
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
    /*
      If no tip was provided then user exited without saving
      and we should not update the tips
    */
    if (tip) {
      this.state.editingExistingTip
        ? this.props.updateTip(
            this.props.activityPosition,
            this.props.activitySection.position,
            tip
          )
        : this.props.addTip(
            this.props.activityPosition,
            this.props.activitySection.position,
            tip
          );
    }
    this.setState({tipToEdit: null, editingExistingTip: false});
  };

  handleOpenAddResource = () => {
    this.setState({addResourceOpen: true});
  };

  handleCloseAddResource = resourceKey => {
    this.setState(
      {addResourceOpen: false},
      this.props.appendResourceLink(resourceKey)
    );
  };

  handleDeleteTip = tipKey => {
    this.props.removeTip(
      this.props.activityPosition,
      this.props.activitySection.position,
      tipKey
    );
  };

  render() {
    return (
      <div>
        <div style={styles.bottomControls}>
          <span>
            <button
              onClick={this.handleOpenAddLevel}
              className="btn uitest-open-add-level-button"
              style={styles.addButton}
              type="button"
            >
              <i style={{marginRight: 7}} className="fa fa-plus-circle" />
              Level
            </button>
            <button
              onMouseDown={this.handleOpenAddTip}
              className="btn"
              style={styles.addButton}
              type="button"
            >
              <i style={{marginRight: 7}} className="fa fa-plus-circle" />
              Callout
            </button>
            <button
              onMouseDown={this.handleOpenAddResource}
              className="btn"
              style={styles.addButton}
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
        <FindResourceDialog
          isOpen={this.state.addResourceOpen}
          handleConfirm={this.handleCloseAddResource}
          handleClose={() => this.setState({addResourceOpen: false})}
        />
        {/* Prevent dialog from trying to render when there is no tip to edit*/}
        {this.state.tipToEdit && (
          <EditTipDialog
            isOpen={true}
            handleConfirm={this.handleCloseAddTip}
            tip={this.state.tipToEdit}
            handleDelete={this.handleDeleteTip}
          />
        )}
        <AddLevelDialog
          isOpen={this.state.addLevelOpen}
          handleConfirm={this.handleCloseAddLevel}
          addLevel={this.props.addLevel}
          activitySection={this.props.activitySection}
          activityPosition={this.props.activityPosition}
        />
      </div>
    );
  }
}

export const UnconnectedActivitySectionCardButtons = ActivitySectionCardButtons;

export default connect(
  state => ({}),
  {
    addTip,
    updateTip,
    removeTip
  }
)(ActivitySectionCardButtons);
