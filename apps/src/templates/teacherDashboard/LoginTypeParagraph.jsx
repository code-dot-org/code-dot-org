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

  /**
   * Pick content that varies with current login type and section student count.
   * @param {SectionLoginType} loginType
   * @param {number} studentCount
   * @returns {{paragraph:ReactElement, buttonTest: string}}
   */
  static getContent(loginType, studentCount) {
    let paragraph, buttonText;

    if (loginType === SectionLoginType.picture) {
      buttonText = i18n.changeLoginTypeToWord_button();
      paragraph = (
        <div>
          <p>
            {i18n.loginTypePictureLongDescription()}
          </p>
          <p>
            {i18n.loginTypePictureResetDescription()}
          </p>
        </div>
      );
    } else if (loginType === SectionLoginType.word) {
      buttonText = i18n.changeLoginTypeToPicture_button();
      paragraph = (
        <div>
          <p>
            {i18n.loginTypeWordLongDescription()}
          </p>
          <p>
            {i18n.loginTypeWordResetDescription()}
          </p>
        </div>
      );
    } else if (loginType === SectionLoginType.email) {
      buttonText = i18n.changeLoginTypeToWordOrPicture_button();
      paragraph = (
        <div>
          <p>
            {i18n.loginTypeEmailLongDescription()}
          </p>
          <p>
            {i18n.loginTypeEmailResetDescription()}
          </p>
        </div>
      );
    }

    if (studentCount <= 0) {
      buttonText = i18n.changeLoginType();
    }

    if (paragraph && buttonText) {
      return {paragraph, buttonText};
    }
    return null;
  }

  render() {
    const {section} = this.props;
    if (!section) {
      // Render nothing for not-yet-loaded section information
      return null;
    }

    const content = LoginTypeParagraph.getContent(section.loginType, section.studentCount);
    if (!content) {
      // Render nothing for not-yet-supported login types.
      return null;
    }

    const {paragraph, buttonText} = content;
    return (
      <div>
        {paragraph}
        <Button
          onClick={this.openDialog}
          text={buttonText}
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
