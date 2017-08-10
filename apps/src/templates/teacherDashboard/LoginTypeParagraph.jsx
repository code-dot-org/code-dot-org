import React, {Component, PropTypes} from 'react';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import Button from '../Button';
import ChangeLoginTypeDialog from './ChangeLoginTypeDialog';

export default class LoginTypeParagraph extends Component {
  static propTypes = {
    sectionId: PropTypes.number.isRequired,
    loginType: PropTypes.oneOf(Object.values(SectionLoginType)).isRequired,
    onLoginTypeChanged: PropTypes.func,
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

  static getContent(loginType) {
    switch (loginType) {
      case SectionLoginType.picture:
        return {
          paragraph: (
            <div>
              <p>
                This section uses picture as its secret type.  It means that each of
                your students has a secret picture used in place of a password to sign
                in.  Students should use the sign in web address given above to sign in.
              </p>
              <p>
                You may reset a student's secret picture at any time by
                choosing <strong>Show secret</strong> and then <strong>Reset
                secret</strong>.
                A new secret picture will be generated for that student to use when
                they sign in.
              </p>
            </div>
          ),
          buttonText: 'Change to word login',
        };

      case SectionLoginType.word:
        return {
          paragraph: (
            <div>
              <p>
                This section uses word as its secret type. It means that each of
                your students has a secret pair of words used in place of a
                password to sign
                in. Students should use the sign in web address given above to
                sign in.
              </p>
              <p>
                You may reset a student's secret words at any time by
                choosing <strong>Show secret</strong> and then <strong>Reset
                secret</strong>.
                A new pair of secret words will be generated for that student to
                use when
                they sign in.
              </p>
            </div>
          ),
          buttonText: 'Change to picture login',
        };

      case SectionLoginType.email:
        return {
          paragraph: (
            <div>
              <p>
                This section uses email logins. It means that each of
                your students manages their own account using their own email
                and
                password. Students should sign in through the <strong>Sign
                in</strong> button
                found at the top of the page.
              </p>
              <p>
                You may reset a student's password at any time by
                choosing <strong>Reset password</strong>, entering a new
                password,
                and clicking <strong>Save</strong>.
              </p>
            </div>
          ),
          buttonText: 'Change to picture or word login',
        };

      default:
        return null;
    }
  }

  render() {
    const {loginType} = this.props;
    const content = LoginTypeParagraph.getContent(loginType);
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
