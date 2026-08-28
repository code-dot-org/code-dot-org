import {CustomDialog, Dialog} from '@code-dot-org/component-library/dialog';
import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import Link from '@code-dot-org/component-library/link';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import cookies from 'js-cookie';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import {environmentSpecificCookieName} from '@cdo/apps/code-studio/utils';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import {ages} from '@cdo/apps/templates/AgeDropdown';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import {reload} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import moduleStyles from './sign-in-or-age-dialog.module.scss';

const sessionStorageKey = 'anon_over13';

const ageItems = ages.map(age => ({value: age, text: age}));

class SignInOrAgeDialog extends Component {
  state = {
    open: true,
    tooYoung: false,
    age: '',
  };

  static propTypes = {
    signedIn: PropTypes.bool.isRequired,
    age13Required: PropTypes.bool.isRequired,
    storage: PropTypes.object.isRequired,
  };

  static defaultProps = {
    storage: window.sessionStorage,
  };

  onChangeAge = event => {
    this.setState({age: event.target.value});
  };

  onClickAgeOk = () => {
    const value = this.state.age;
    // Ignore click if nothing selected
    if (!value) {
      return;
    }

    if (parseInt(value, 10) < 13) {
      this.setState({tooYoung: true});
      return;
    }

    // Sets cookie to true when anon user is 13+. False otherwise.
    this.props.storage.setItem(sessionStorageKey, parseInt(value, 10) >= 13);

    // When opening a new tab, we'll have a new session (and thus show this dialog),
    // but may still be using a storage_id for a previous user. Clear that cookie
    // and reload
    const cookieName = environmentSpecificCookieName('storage_id');
    if (cookies.get(cookieName)) {
      cookies.remove(cookieName, {path: '/', domain: '.code.org'});
      reload();
    } else {
      this.setState({open: false});
    }
  };

  render() {
    const {signedIn, age13Required, storage} = this.props;
    // Don't show dialog unless script requires 13+, we're not signed in, and
    // we haven't already given this dialog our age or we do not require sign-in
    if (!age13Required || signedIn || storage.getItem(sessionStorageKey)) {
      return null;
    }

    // Neither branch passes onClose: the dialog is uncloseable, the user has to
    // sign in or give us an age.
    if (this.state.tooYoung) {
      return (
        <Dialog
          title={i18n.tutorialUnavailable()}
          description={i18n.tutorialUnavailableExplanation()}
          primaryButtonProps={{
            children: i18n.seeAllTutorials(),
            href: pegasus('/hourofcode/overview'),
          }}
        />
      );
    }

    if (!this.state.open) {
      return null;
    }

    return (
      <CustomDialog
        className={classNames('signInOrAgeDialog', moduleStyles.dialog)}
        aria-label={i18n.signinOrAge()}
      >
        <MuiTypography variant="h3">{i18n.signinOrAge()}</MuiTypography>
        <hr />
        <div className={moduleStyles.columns}>
          <div className={moduleStyles.column}>
            <MuiTypography id="dsco-dialog-description" variant="body2">
              {i18n.signinForProgress()}
            </MuiTypography>
            <MuiButton
              className={moduleStyles.action}
              variant="outlined"
              color="secondary"
              href={`/users/sign_in?user_return_to=${location.pathname}`}
            >
              {i18n.signinCodeOrg()}
            </MuiButton>
          </div>
          <div className={moduleStyles.orDivider}>
            <span className={moduleStyles.orLine} />
            <MuiTypography variant="body2">{i18n.or()}</MuiTypography>
            <span className={moduleStyles.orLine} />
          </div>
          <div className={moduleStyles.column}>
            <MuiTypography variant="body2">{i18n.provideAge()}</MuiTypography>
            <div className={moduleStyles.ageRow}>
              <SimpleDropdown
                className={moduleStyles.ageDropdown}
                id="uitest-age-selector"
                name="age"
                labelText={i18n.age()}
                isLabelVisible={false}
                items={ageItems}
                selectedValue={this.state.age}
                onChange={this.onChangeAge}
              />
              <MuiButton
                className={moduleStyles.action}
                id="uitest-submit-age"
                variant="contained"
                color="primary"
                onClick={this.onClickAgeOk}
              >
                {i18n.ok()}
              </MuiButton>
            </div>
          </div>
        </div>
        <hr />
        {/* The dialog is uncloseable, so send the privacy policy to a new tab
            rather than navigating out of the flow. */}
        <Link
          href="https://code.org/privacy"
          text={i18n.privacyPolicy()}
          size="s"
          external
          openInNewTab
        />
      </CustomDialog>
    );
  }
}

export const UnconnectedSignInOrAgeDialog = SignInOrAgeDialog;

export default connect(state => ({
  age13Required: state.progress.isAge13Required,
  signedIn: state.currentUser.signInState === SignInState.SignedIn,
}))(SignInOrAgeDialog);
