import React from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import color from '../../../color';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import StageLockDialog from './StageLockDialog';
import progressStyles from './progressStyles';
import commonMsg from '@cdo/locale';
import { openLockDialog, closeLockDialog, lockStage } from '../../stageLockRedux';
import { stageShape } from './types';

const styles = {
  lockSettingsText: {
    marginLeft: 10
  },
  warning: {
    position: 'relative',
    top: 2
  },
  warnIcon: {
    color: color.red
  },
  warnText: {
    marginLeft: 5
  }
};

const StageLock = React.createClass({
  propTypes: {
    stage: stageShape,

    // redux provided
    sectionsLoaded: React.PropTypes.bool.isRequired,
    unlocked: React.PropTypes.bool.isRequired,
    openLockDialog: React.PropTypes.func.isRequired,
    closeLockDialog: React.PropTypes.func.isRequired,
    lockStage: React.PropTypes.func.isRequired
  },

  openLockDialog() {
    this.props.openLockDialog(this.props.stage.id);
  },

  lockStage() {
    this.props.lockStage(this.props.stage.id);
  },

  render() {
    if (!this.props.sectionsLoaded) {
      return <div>{commonMsg.loading()}</div>;
    }
    return (
      <div>
        <button style={progressStyles.blueButton} onClick={this.openLockDialog}>
          <FontAwesome icon="lock"/>
          <span style={styles.lockSettingsText}>
            {commonMsg.lockSettings()}
          </span>
        </button>
        {this.props.unlocked &&
          <span>
            <button style={progressStyles.orangeButton} onClick={this.lockStage}>
              {commonMsg.lockStage()}
            </button>
            <span style={styles.warning}>
              <FontAwesome icon="exclamation-triangle" style={styles.warnIcon}/>
              <span style={styles.warnText}>
                {commonMsg.lockWhenDone()}
              </span>
            </span>
          </span>
        }
        <StageLockDialog handleClose={this.props.closeLockDialog}/>
      </div>
    );
  }
});

export default connect((state, ownProps) => {
  const { sectionsLoaded, sections, selectedSection } = state.stageLock;
  let unlocked = false;
  if (sectionsLoaded) {
    const currentSection = sections[selectedSection];
    const stageStudents = currentSection.stages[ownProps.stage.id];

    unlocked = stageStudents.some(student => !student.locked);
  }

  return {
    unlocked,
    sectionsLoaded
  };
}, dispatch => ({
  openLockDialog(stageId) {
    dispatch(openLockDialog(stageId));
  },
  closeLockDialog() {
    dispatch(closeLockDialog());
  },
  lockStage(stageId) {
    dispatch(lockStage(stageId));
  }
}))(Radium(StageLock));
