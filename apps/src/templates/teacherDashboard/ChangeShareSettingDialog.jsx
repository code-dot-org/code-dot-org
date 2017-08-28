import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {Heading1} from '../../lib/ui/Headings';
import BaseDialog from '../BaseDialog';
import Button from '../Button';
import {sectionShape} from './shapes';
import DialogFooter from "./DialogFooter";
import PadAndCenter from './PadAndCenter';
import {editSectionLoginType, isSaveInProgress} from './teacherSectionsRedux';

class ChangeShareSettingDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    handleClose: PropTypes.func.isRequired,
    onSharingChanged: PropTypes.func.isRequired,
    sectionId: PropTypes.number.isRequired,
    // Used by storybook
    hideBackdrop: PropTypes.bool,
    style: PropTypes.object,
    // Provided by Redux
    section: sectionShape,
    isSaveInProgress: PropTypes.bool,
    editSectionLoginType: PropTypes.func.isRequired,
    disableSharing: PropTypes.bool.isRequired
  };

  changeLoginType = newType => {
    const {sectionId, editSectionLoginType, onSharingChanged} = this.props;
    editSectionLoginType(sectionId, newType).then(onSharingChanged);
  };

  render() {
    const {
      section,
      isOpen,
      handleClose,
      hideBackdrop,
      style,
      isSaveInProgress,
      disableSharing
    } = this.props;
    if (!section) {
      // It's possible to get here before our async section load is done.
      return null;
    }

    const useWideDialog = section.studentCount <= 0;
    const descriptionText = disableSharing ? 'An important part of the student experience of using Code.org is the ability to share their projects and creations with others. With sharing disabled, students will not be able to share their creations created with our advanced programming tools (App Lab, Game Lab, and Web Lab) with anyone else besides their Code.org teachers. These advanced tools are designed for students that are over 13 or being used under a teacher or parent’s guidance.  Note that students will still be able to share projects created using the programming tools designed for younger students like Play Lab and Artist. These tools limit what students can create and do not allow for uploading any of their own assets. To protect students’ privacy, shared creations in the project gallery are labeled only with the first letter of a student’s name and an age range.' : 'By enabling sharing, your students will be allowed to share their projects created through Code.org’s advanced programming tools (App Lab, Game Lab, and Web Lab) with anyone by sharing their project link.';
    const titleText = disableSharing ? 'Are you sure  you want to disable sharing?' : 'Are you sure  you want to enable sharing?';
    const actionText = disableSharing ? 'Disable sharing' : 'Enable sharing';
    return (
      <BaseDialog
        useUpdatedStyles
        fixedWidth={useWideDialog ? 1010 : undefined}
        isOpen={isOpen}
        handleClose={handleClose}
        assetUrl={()=>''}
        hideBackdrop={hideBackdrop}
        style={style}
        uncloseable={isSaveInProgress}
      >
        <PadAndCenter>
          <div style={{marginLeft: 20, marginRight: 20}}>
            <Heading1>
              {titleText}
            </Heading1>
            <hr/>
            <div>
              {descriptionText}
            </div>
            <DialogFooter>
              <Button
                onClick={handleClose}
                color={Button.ButtonColor.gray}
                size={Button.ButtonSize.large}
                text={i18n.dialogCancel()}
                disabled={isSaveInProgress}
              />
              <Button
                onClick={() => {}}
                size={Button.ButtonSize.large}
                text={actionText}
                disabled={isSaveInProgress}
              />
            </DialogFooter>
          </div>
        </PadAndCenter>
      </BaseDialog>
    );
  }
}

export const UnconnectedChangeShareSettingDialog = ChangeShareSettingDialog;

export default connect((state, props) => ({
  section: state.teacherSections.sections[props.sectionId],
  isSaveInProgress: isSaveInProgress(state),
}), {
  editSectionLoginType,
})(ChangeShareSettingDialog);
