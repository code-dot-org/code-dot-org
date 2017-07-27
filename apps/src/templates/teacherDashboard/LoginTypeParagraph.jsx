import React, {Component, PropTypes} from 'react';
import Button from '../Button';

export default class LoginTypeParagraph extends Component {
  static propTypes = {
    loginType: PropTypes.oneOf(['picture', 'word', 'email']),
  };

  render() {
    const {loginType} = this.props;
    if (loginType === 'picture') {
      return (
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
          <Button
            onClick={() => {}}
            text="Change to word login"
            color={Button.ButtonColor.white}
          />
        </div>
      );
    } else if (loginType === 'word') {
      return (
        <div>
          <p>
            This section uses word as its secret type.  It means that each of
            your students has a secret pair of words used in place of a password to sign
            in.  Students should use the sign in web address given above to sign in.
          </p>
          <p>
            You may reset a student's secret words at any time by
            choosing <strong>Show secret</strong> and then <strong>Reset
            secret</strong>.
            A new pair of secret words will be generated for that student to use when
            they sign in.
          </p>
          <Button
            onClick={() => {}}
            text="Change to picture login"
            color={Button.ButtonColor.white}
          />
        </div>
      );
    } else {
      return (
        <div>
          <p>
            This section uses email logins.  It means that each of
            your students manages their own account using their own email and
            password. Students should sign in through the <strong>Sign in</strong> button
            found at the top of the page.
          </p>
          <p>
            You may reset a student's password at any time by
            choosing <strong>Reset password</strong>, entering a new password,
            and clicking <strong>Save</strong>.
          </p>
          <Button
            onClick={() => {}}
            text="Change to picture or word login"
            color={Button.ButtonColor.white}
          />
        </div>
      );
    }
  }
}
