import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import {Heading1} from '../../lib/ui/Headings';
import BaseDialog from '../BaseDialog';
import Button from '../Button';
import LoginTypePicker from './LoginTypePicker';
import {sectionShape} from './shapes';
import DialogFooter from "./DialogFooter";
import PadAndCenter from './PadAndCenter';
import {editSectionLoginType, isSaveInProgress} from './teacherSectionsRedux';

class ChangeLoginTypeDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    handleClose: PropTypes.func.isRequired,
    onLoginTypeChanged: PropTypes.func.isRequired,
    sectionId: PropTypes.number.isRequired,
    // Used by storybook
    hideBackdrop: PropTypes.bool,
    style: PropTypes.object,
    // Provided by Redux
    section: sectionShape,
    isSaveInProgress: PropTypes.bool,
    editSectionLoginType: PropTypes.func.isRequired,
  };

  changeLoginType = newType => {
    const {sectionId, editSectionLoginType, onLoginTypeChanged} = this.props;
    editSectionLoginType(sectionId, newType).then(onLoginTypeChanged);
  };

  renderOptions() {
    const {section, handleClose, isSaveInProgress} = this.props;
    if (section.studentCount <= 0) {
      // Case 1: No students in the section, we could change to any type;
      //         word, email, oauth, Clever, it's all fair game.
      return (
        <LoginTypePicker
          title={i18n.changeLoginType()}
          setLoginType={this.changeLoginType}
          handleCancel={handleClose}
          disabled={isSaveInProgress}
        />
      );
    } else if (section.loginType === 'picture') {
      // Case 2: Students > 0 and login_type is picture; allow change to word.
      return (
        <LimitedChangeView
          description={i18n.changeLoginTypeToWord_description()}
          onCancel={handleClose}
          disabled={isSaveInProgress}
        >
          <UseWordLoginButton
            changeLoginType={this.changeLoginType}
            disabled={isSaveInProgress}
          />
        </LimitedChangeView>
      );
    } else if (section.loginType === 'word') {
      // Case 3: Students > 0 and login_type is word; allow change to picture.
      return (
        <LimitedChangeView
          description={i18n.changeLoginTypeToPicture_description()}
          onCancel={handleClose}
          disabled={isSaveInProgress}
        >
          <UsePictureLoginButton
            changeLoginType={this.changeLoginType}
            disabled={isSaveInProgress}
          />
        </LimitedChangeView>
      );
    } else {
      // Case 4: Students > 0 and login_type is email; allow change to word
      //         or picture.
      const description = (
        <span>
          {i18n.changeLoginTypeToWordOrPicture_description()}
          <strong>{i18n.youCannotUndoThisAction()}</strong>
        </span>
      );
      return (
        <LimitedChangeView
          description={description}
          onCancel={handleClose}
          disabled={isSaveInProgress}
        >
          <UsePictureLoginButton
            changeLoginType={this.changeLoginType}
            disabled={isSaveInProgress}
          />
          <UseWordLoginButton
            changeLoginType={this.changeLoginType}
            disabled={isSaveInProgress}
            style={{marginLeft: 4}}
          />
        </LimitedChangeView>
      );
    }
  }

  render() {
    const {
      section,
      isOpen,
      handleClose,
      hideBackdrop,
      style,
      isSaveInProgress
    } = this.props;
    if (!section) {
      // It's possible to get here before our async section load is done.
      return null;
    }

    const useWideDialog = section.studentCount <= 0;
    return (
      <BaseDialog
        useUpdatedStyles
        fixedWidth={useWideDialog ? 1010 : undefined}
        isOpen={isOpen}
        handleClose={handleClose}
        hideBackdrop={hideBackdrop}
        style={style}
        uncloseable={isSaveInProgress}
      >
        <PadAndCenter>
          {this.renderOptions()}
        </PadAndCenter>
      </BaseDialog>
    );
  }
}

export const UnconnectedChangeLoginTypeDialog = ChangeLoginTypeDialog;

export default connect((state, props) => ({
  section: state.teacherSections.sections[props.sectionId],
  isSaveInProgress: isSaveInProgress(state),
}), {
  editSectionLoginType,
})(ChangeLoginTypeDialog);

const LimitedChangeView = ({description, children, onCancel, disabled}) => (
  <div style={{marginLeft: 20, marginRight: 20}}>
    <Heading1>
      {i18n.changeLoginTypeQuestion()}
    </Heading1>
    <hr/>
    <div>
      {description}
    </div>
    <DialogFooter>
      <Button
        onClick={onCancel}
        color={Button.ButtonColor.gray}
        size={Button.ButtonSize.large}
        text={i18n.dialogCancel()}
        disabled={disabled}
      />
      <div>
        {children}
      </div>
    </DialogFooter>
  </div>
);
LimitedChangeView.propTypes = {
  description: PropTypes.node,
  onCancel: PropTypes.func.isRequired,
  children: PropTypes.any,
  disabled: PropTypes.bool,
};

const buttonPropTypes = {
  changeLoginType: PropTypes.func.isRequired,
  style: PropTypes.any,
  disabled: PropTypes.bool,
};

const UsePictureLoginButton = ({changeLoginType, disabled}) => (
  <Button
    onClick={() => changeLoginType(SectionLoginType.picture)}
    size={Button.ButtonSize.large}
    text={i18n.loginTypePictureButton()}
    disabled={disabled}
  />
);
UsePictureLoginButton.propTypes = buttonPropTypes;
const UseWordLoginButton = ({changeLoginType, style, disabled}) => (
  <Button
    onClick={() => changeLoginType(SectionLoginType.word)}
    size={Button.ButtonSize.large}
    text={i18n.loginTypeWordButton()}
    style={style}
    disabled={disabled}
  />
);
UseWordLoginButton.propTypes = buttonPropTypes;
