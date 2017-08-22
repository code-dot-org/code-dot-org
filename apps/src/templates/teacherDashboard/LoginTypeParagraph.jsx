import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import Button from '../Button';
import ChangeLoginTypeDialog from './ChangeLoginTypeDialog';
import {sectionShape} from './shapes';

class LoginTypeParagraph extends Component {
  static propTypes = {
    sectionId: PropTypes.number.isRequired,
    onLoginTypeChanged: PropTypes.func,
    // Provided by Redux
    section: sectionShape,
  };

  state = {
    isDialogOpen: false,
  };

  openDialog = () => this.setState({isDialogOpen: true});
  closeDialog = () => this.setState({isDialogOpen: false});
  onLoginTypeChanged = () => {
    this.closeDialog();
    const callback = this.props.onLoginTypeChanged;
    if (typeof callback === 'function') {
      callback();
    }
  };

  render() {
    const {section} = this.props;
    if (!section) {
      // Render nothing for not-yet-loaded section information
      return null;
    }

    if (!isSupportedType(section.loginType)) {
      // Render nothing for not-yet-supported login types.
      return null;
    }

    return (
      <div>
        <Paragraph loginType={section.loginType}/>
        <Button
          onClick={this.openDialog}
          text={getButtonText(section.loginType, section.studentCount)}
          color={Button.ButtonColor.white}
        />
        <ChangeLoginTypeDialog
          isOpen={this.state.isDialogOpen}
          handleClose={this.closeDialog}
          onLoginTypeChanged={this.onLoginTypeChanged}
          sectionId={this.props.sectionId}
        />
      </div>
    );
  }
}

export const UnconnectedLoginTypeParagraph = LoginTypeParagraph;
export default connect((state, props) => ({
  section: state.teacherSections.sections[props.sectionId],
}))(LoginTypeParagraph);

const longDescriptionByLoginType = {
  [SectionLoginType.picture]: i18n.loginTypePictureLongDescription(),
  [SectionLoginType.word]: i18n.loginTypeWordLongDescription(),
  [SectionLoginType.email]: i18n.loginTypeEmailLongDescription(),
};

const resetDescriptionByLoginType = {
  [SectionLoginType.picture]: i18n.loginTypePictureResetDescription(),
  [SectionLoginType.word]: i18n.loginTypeWordResetDescription(),
  [SectionLoginType.email]: i18n.loginTypeEmailResetDescription(),
};

function isSupportedType(loginType) {
  return !!longDescriptionByLoginType[loginType];
}

function Paragraph({loginType}) {
  if (!longDescriptionByLoginType[loginType]) {
    return null;
  }
  return (
    <div>
      <p>
        {longDescriptionByLoginType[loginType]}
      </p>
      <p>
        {resetDescriptionByLoginType[loginType]}
      </p>
    </div>
  );
}
Paragraph.propTypes = {
  loginType: PropTypes.string,
};

const buttonTextByLoginType = {
  [SectionLoginType.picture]: i18n.changeLoginTypeToWord_button(),
  [SectionLoginType.word]: i18n.changeLoginTypeToPicture_button(),
  [SectionLoginType.email]: i18n.changeLoginTypeToWordOrPicture_button(),
};

function getButtonText(loginType, studentCount) {
  if (studentCount <= 0) {
    return i18n.changeLoginType();
  }
  return buttonTextByLoginType[loginType];
}
