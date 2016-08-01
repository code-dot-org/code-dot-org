import React from 'react';
import Radium from 'radium';
import color from '../../../color';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import StageLockDialog from './StageLockDialog';
import progressStyles from './progressStyles';
import commonMsg from '@cdo/locale';

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

/**
 * This fakeData is temporary until we do the work on the backend to properly
 * mark this as lockable or not.
 */
const fakeData = [
  {
    name: 'Farrah',
    lockStatus: 'locked'
  },
  {
    name: 'George',
    lockStatus: 'editable'
  }
];

const StageLock = React.createClass({
  propTypes: {
    sectionsLoaded: React.PropTypes.bool.isRequired,
    unlocked: React.PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      dialogIsOpen: false
    };
  },

  openDialog() {
    this.setState({dialogIsOpen: true});
  },

  closeDialog() {
    this.setState({dialogIsOpen: false});
  },

  render() {
    if (!this.props.sectionsLoaded) {
      return <div>{commonMsg.loading()}</div>;
    }
    return (
      <div>
        <button style={progressStyles.blueButton} onClick={this.openDialog}>
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
          isOpen={this.state.dialogIsOpen}
          handleClose={this.closeDialog}
          initialLockStatus={fakeData}
        />
      </div>
    );
  }
});

export default Radium(StageLock);
