/**
 * A button that opens our LessonLockDialog component, using our redesigned button.
 */

import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import Button from '../Button';
import i18n from '@cdo/locale';
import LessonLockDialog from '@cdo/apps/code-studio/components/progress/LessonLockDialog';
import {
  openLockDialog,
  closeLockDialog
} from '@cdo/apps/code-studio/lessonLockRedux';
import {lessonType} from './progressTypes';

class LessonLock extends React.Component {
  static propTypes = {
    lesson: lessonType.isRequired,

    // redux provided
    sectionId: PropTypes.string.isRequired,
    sectionsAreLoaded: PropTypes.bool.isRequired,
    saving: PropTypes.bool.isRequired,
    openLockDialog: PropTypes.func.isRequired,
    closeLockDialog: PropTypes.func.isRequired
  };

  openLockDialog = () => {
    const {openLockDialog, sectionId, lesson} = this.props;
    openLockDialog(sectionId, lesson.id);
  };

  render() {
    const {sectionsAreLoaded, saving, closeLockDialog} = this.props;

    if (!sectionsAreLoaded) {
      return <div>{i18n.loading()}</div>;
    }

    return (
      <div style={styles.main}>
        <div style={styles.buttonContainer} className="uitest-locksettings">
          <Button
            __useDeprecatedTag
            onClick={this.openLockDialog}
            color={Button.ButtonColor.gray}
            text={saving ? i18n.saving() : i18n.lockSettings()}
            icon="lock"
            style={styles.button}
          />
        </div>
        <LessonLockDialog handleClose={closeLockDialog} />
      </div>
    );
  }
}

const styles = {
  main: {
    marginTop: 5
  },
  buttonContainer: {
    marginLeft: 15,
    marginRight: 15
  },
  button: {
    paddingLeft: 0,
    paddingRight: 0,
    width: '100%'
  }
};

export const UnconnectedLessonLock = LessonLock;
export default connect(
  state => ({
    sectionId: state.teacherSections.selectedSectionId.toString(),
    sectionsAreLoaded: state.teacherSections.sectionsAreLoaded,
    saving: state.lessonLock.saving
  }),
  {openLockDialog, closeLockDialog}
)(LessonLock);
