import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import {Heading1} from '../../lib/ui/Headings';
import BaseDialog from '../BaseDialog';
import Button from '../Button';
import LoginTypePicker from './LoginTypePicker';
import {sectionShape} from './shapes';
import DialogFooter from "./DialogFooter";
import PadAndCenter from './PadAndCenter';
import {editSectionLoginType} from './teacherSectionsRedux';

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
    editSectionLoginType: PropTypes.func.isRequired,
  };

  changeLoginType = newType => {
    const {sectionId, editSectionLoginType, onLoginTypeChanged} = this.props;
    editSectionLoginType(sectionId, newType).then(onLoginTypeChanged);
  };

  renderOptions() {
    const {section, handleClose} = this.props;
    if (section.studentCount <= 0) {
      // Case 1: No students in the section, we could change to any type;
      //         word, email, oauth, Clever, it's all fair game.
      return (
        <LoginTypePicker
          sectionName="Section name"
          handleLoginChoice={() => {}}
          handleCancel={handleClose}
        />
      );
    } else if (section.loginType === 'picture') {
      // Case 2: Students > 0 and login_type is picture; allow change to word.
      return (
        <LimitedChangeView
          description="Change to the word login type if you want students to login with a simple pair of words instead of with a secret picture."
          onCancel={handleClose}
        >
          <UseWordLoginButton changeLoginType={this.changeLoginType}/>
        </LimitedChangeView>
      );
    } else if (section.loginType === 'word') {
      // Case 3: Students > 0 and login_type is word; allow change to picture.
      return (
        <LimitedChangeView
          description="Change to the picture login type if you want students to login with a secret picture instead of with a simple pair of words."
          onCancel={handleClose}
        >
          <UsePictureLoginButton changeLoginType={this.changeLoginType}/>
        </LimitedChangeView>
      );
    } else {
      // Case 4: Students > 0 and login_type is email; allow change to word
      //         or picture.
      const description = (
        <span>
          If your students don't have email addresses, you can create accounts
          for them. Your students will login with a picture if you choose
          picture login and a simple pair of words if you choose word login.
          <strong>You cannot undo this action.</strong>
        </span>
      );
      return (
        <LimitedChangeView
          description={description}
          onCancel={handleClose}
        >
          <UsePictureLoginButton changeLoginType={this.changeLoginType}/>
          <UseWordLoginButton
            changelogintype={this.changeLoginType}
            style={{marginLeft: 4}}
          />
        </LimitedChangeView>
      );
    }
  }

  render() {
    const {section} = this.props;
    if (!section) {
      // It's possible to get here before our async section load is done.
      return null;
    }

    const useWideDialog = section.studentCount <= 0;
    return (
      <BaseDialog
        useUpdatedStyles
        fixedWidth={useWideDialog ? 1010 : undefined}
        isOpen={this.props.isOpen}
        handleClose={this.props.handleClose}
        assetUrl={()=>''}
        hideBackdrop={this.props.hideBackdrop}
        style={this.props.style}
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
  section: state.teacherSections.sections[props.sectionId]
}), {
  editSectionLoginType,
})(ChangeLoginTypeDialog);

const LimitedChangeView = ({description, children, onCancel}) => (
  <div style={{marginLeft: 20, marginRight: 20}}>
    <Heading1>Change student login type?</Heading1>
    <hr/>
    <div>
      {description}
    </div>
    <DialogFooter>
      <Button
        onClick={onCancel}
        color={Button.ButtonColor.gray}
        size={Button.ButtonSize.large}
        text="Cancel"
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
};

const buttonPropTypes = {
  changeLoginType: PropTypes.func.isRequired,
  style: PropTypes.any,
};

const UsePictureLoginButton = ({changeLoginType}) => (
  <Button
    onClick={() => changeLoginType(SectionLoginType.picture)}
    size={Button.ButtonSize.large}
    text="Use picture login"
  />
);
UsePictureLoginButton.propTypes = buttonPropTypes;
const UseWordLoginButton = ({changeLoginType, style}) => (
  <Button
    onClick={() => changeLoginType(SectionLoginType.word)}
    size={Button.ButtonSize.large}
    text="Use word login"
    style={style}
  />
);
UseWordLoginButton.propTypes = buttonPropTypes;
