import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {Heading1} from '../../lib/ui/Headings';
import BaseDialog from '../BaseDialog';
import Button from '../Button';
import {sectionShape} from './shapes';
import DialogFooter from "./DialogFooter";
import PadAndCenter from './PadAndCenter';
import {isSaveInProgress, updateShareSetting} from './teacherSectionsRedux';

class ChangeShareSettingDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    handleClose: PropTypes.func.isRequired,
    onSharingChanged: PropTypes.func.isRequired,
    sectionId: PropTypes.number.isRequired,
    // Provided by Redux
    section: sectionShape,
    isSaveInProgress: PropTypes.bool,
    updateShareSetting: PropTypes.func.isRequired,
    disableSharing: PropTypes.bool.isRequired
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.isSaveInProgress && !nextProps.isSaveInProgress) {
      this.props.onSharingChanged();
    }
  }

  changeSharing = () => {
    this.props.updateShareSetting(this.props.sectionId, this.props.disableSharing);
  };

  render() {
    const {
      section,
      isOpen,
      handleClose,
      isSaveInProgress,
      disableSharing
    } = this.props;
    if (!section) {
      // It's possible to get here before our async section load is done.
      return null;
    }

    const titleText = disableSharing ? i18n.shareSettingDisableTitle() : i18n.shareSettingEnableTitle();
    const actionText = disableSharing ? i18n.shareSettingDisableAction() : i18n.shareSettingEnableAction();
    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={isOpen}
        handleClose={handleClose}
        uncloseable={isSaveInProgress}
      >
        <PadAndCenter>
          <div style={{margin: '0px 20px'}}>
            <Heading1>
              {titleText}
            </Heading1>
            <hr/>
            {disableSharing &&
              <div>
                <p>{i18n.shareSettingDisableDialog()}</p>
                <p>{i18n.shareSettingDisableDialogNote()}</p>
              </div>
            }
            {!disableSharing &&
              <div>
                {i18n.shareSettingEnableDialog()}
              </div>
            }
            <DialogFooter>
              <Button
                onClick={handleClose}
                color={Button.ButtonColor.gray}
                size={Button.ButtonSize.large}
                text={i18n.dialogCancel()}
                disabled={isSaveInProgress}
              />
              <Button
                onClick={this.changeSharing}
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

export default connect((state, props) => ({
  section: state.teacherSections.sections[props.sectionId],
  isSaveInProgress: isSaveInProgress(state)
}), {
  updateShareSetting,
})(ChangeShareSettingDialog);
