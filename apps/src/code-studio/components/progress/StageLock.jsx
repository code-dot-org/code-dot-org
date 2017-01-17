import React from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import color from "../../../util/color";
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import StageLockDialog from './StageLockDialog';
import progressStyles from './progressStyles';
import commonMsg from '@cdo/locale';
import { openLockDialog, closeLockDialog, lockStage } from '../../stageLockRedux';
import { stageShape } from './types';

const styles = {
  lockSettings: {
    ...progressStyles.whiteButton,
    maxWidth: 240,
    overflow: 'hidden'
  },
  lockSettingsText: {
    marginLeft: 10
  },
  warning: {
    marginBottom: 5,
  },
  warnIcon: {
    color: color.red
  },
  warnText: {
    marginLeft: 5,
    textAlign: 'left'
  }
};

const StageLock = React.createClass({
  propTypes: {
    stage: stageShape,

    // redux provided
    sectionId: React.PropTypes.string.isRequired,
    sectionsAreLoaded: React.PropTypes.bool.isRequired,
    unlocked: React.PropTypes.bool.isRequired,
    saving: React.PropTypes.bool.isRequired,
    openLockDialog: React.PropTypes.func.isRequired,
    closeLockDialog: React.PropTypes.func.isRequired,
    lockStage: React.PropTypes.func.isRequired,
  },

  openLockDialog() {
    this.props.openLockDialog(this.props.sectionId, this.props.stage.id);
  },

  lockStage() {
    this.props.lockStage(this.props.sectionId, this.props.stage.id);
  },

  render() {
    if (!this.props.sectionsAreLoaded) {
      return <div>{commonMsg.loading()}</div>;
    }
    return (
      <div style={{display: 'inline-block'}}>
        {/* className used only for purposes of uitest */}
        <button
          style={styles.lockSettings}
          onClick={this.openLockDialog}
          disabled={this.props.saving}
          className="uitest-locksettings"
        >
          <FontAwesome icon="lock"/>
          <span style={styles.lockSettingsText}>
            {this.props.saving ? commonMsg.saving() : commonMsg.assessmentSettings()}
          </span>
        </button>
        {this.props.unlocked &&
          <div>
            <button
              style={progressStyles.orangeButton}
              onClick={this.lockStage}
              disabled={this.props.saving}
            >
              {commonMsg.lockAssessment()}
            </button>
            <div style={styles.warning}>
              <FontAwesome icon="exclamation-triangle" style={styles.warnIcon}/>
              <span style={styles.warnText}>
                {commonMsg.lockWhenDone()}
              </span>
            </div>
          </div>
        }
        <StageLockDialog handleClose={this.props.closeLockDialog}/>
      </div>
    );
  }
});

export default connect((state, ownProps) => {
  const { stagesBySectionId, saving } = state.stageLock;
  const { sectionsAreLoaded, selectedSectionId } = state.sections;
  let unlocked = false;
  if (sectionsAreLoaded) {
    const currentSection = stagesBySectionId[selectedSectionId];
    if (currentSection) {
      const stageStudents = currentSection[ownProps.stage.id];
      unlocked = stageStudents.some(student => !student.locked);
    }
  }

  return {
    sectionId: selectedSectionId,
    unlocked,
    sectionsAreLoaded,
    saving
  };
}, dispatch => ({
  openLockDialog(sectionId, stageId) {
    dispatch(openLockDialog(sectionId, stageId));
  },
  closeLockDialog() {
    dispatch(closeLockDialog());
  },
  lockStage(sectionId, stageId) {
    dispatch(lockStage(sectionId, stageId));
  }
}))(Radium(StageLock));
