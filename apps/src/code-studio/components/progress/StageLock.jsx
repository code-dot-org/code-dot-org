import React from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import color from '../../../color';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import StageLockDialog from './StageLockDialog';
import progressStyles from './progressStyles';
import commonMsg from '@cdo/locale';
import { openLockDialog, closeLockDialog } from '../../teacherPanelRedux';

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
    sectionsLoaded: React.PropTypes.bool.isRequired,
    unlocked: React.PropTypes.bool.isRequired, // TODO - connect?
    stageId: React.PropTypes.number.isRequired,
    openLockDialog: React.PropTypes.func.isRequired,
    closeLockDialog: React.PropTypes.func.isRequired,
  },

  openLockDialog() {
    this.props.openLockDialog(this.props.stageId);
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
            <button style={progressStyles.orangeButton}>
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
        <StageLockDialog
          handleClose={this.props.closeLockDialog}
        />
      </div>
    );
  }
});

export default connect(() => ({
}), dispatch => ({
  openLockDialog(stageId) {
    dispatch(openLockDialog(stageId));
  },
  closeLockDialog() {
    dispatch(closeLockDialog());
  }
}))(Radium(StageLock));
