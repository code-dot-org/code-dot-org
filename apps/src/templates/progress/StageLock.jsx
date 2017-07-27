/**
 * A button that opens our StageLockDialog component, using our redesigned button.
 */

import React from 'react';
import { connect } from 'react-redux';
import Button from '../Button';
import i18n from "@cdo/locale";
import StageLockDialog from '@cdo/apps/code-studio/components/progress/StageLockDialog';
import { openLockDialog, closeLockDialog } from '@cdo/apps/code-studio/stageLockRedux';
import { lessonType } from './progressTypes';

const styles = {
  main: {
    marginTop: 5
  },
  buttonContainer: {
    marginLeft: 15,
    marginRight: 15,
  },
  button: {
    paddingLeft: 0,
    paddingRight: 0,
    width: '100%'
  }
};

const StageLock = React.createClass({
  propTypes: {
    lesson: lessonType.isRequired,

    // redux provided
    sectionId: React.PropTypes.string.isRequired,
    sectionsAreLoaded: React.PropTypes.bool.isRequired,
    saving: React.PropTypes.bool.isRequired,
    openLockDialog: React.PropTypes.func.isRequired,
    closeLockDialog: React.PropTypes.func.isRequired,
  },

  openLockDialog() {
    const { openLockDialog, sectionId, lesson } = this.props;

    openLockDialog(sectionId, lesson.id);
  },

  render() {
    const { sectionsAreLoaded, saving, closeLockDialog } = this.props;

    if (!sectionsAreLoaded) {
      return <div>{i18n.loading()}</div>;
    }

    return (
      <div style={styles.main}>
        <div style={styles.buttonContainer} className="uitest-locksettings">
          <Button
            onClick={this.openLockDialog}
            color={Button.ButtonColor.gray}
            text={saving ? i18n.saving() : i18n.lockSettings()}
            icon="lock"
            style={styles.button}
          />
        </div>
        <StageLockDialog handleClose={closeLockDialog}/>
      </div>
    );
  }
});

export default connect(state => ({
  sectionId: state.sections.selectedSectionId,
  sectionsAreLoaded: state.sections.sectionsAreLoaded,
  saving: state.stageLock.saving
}), { openLockDialog, closeLockDialog })(StageLock);
