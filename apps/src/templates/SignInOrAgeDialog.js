import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import cookies from 'js-cookie';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import color from '@cdo/apps/util/color';
import Button from '@cdo/apps/templates/Button';
import AgeDropdown from '@cdo/apps/templates/AgeDropdown';
import { SignInState } from '@cdo/apps/code-studio/progressRedux';
import i18n from '@cdo/locale';
import { reload } from '@cdo/apps/utils';
import { environmentSpecificCookieName } from '@cdo/apps/code-studio/utils';
import { pegasus } from '@cdo/apps/lib/util/urlHelpers';

const styles = {
  container: {
    margin: 20,
    color: color.charcoal
  },
  heading: {
    fontSize: 16,
    fontFamily: "'Gotham 5r', sans-serif",
  },
  middle: {
    marginTop: 20,
    marginBottom: 20,
    paddingBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 0,
    borderLeftWidth: 0,
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
    display: 'flex',

  },
  middleCell: {
    display: 'inline-block',
    verticalAlign: 'top',
    maxWidth: '50%',
  },
  center: {
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: 'column',
    display: 'flex',
  },
  centerLine: {
    borderLeft: `1px solid ${color.lighter_gray}`,
    marginLeft: '50%',
    height: '100%',
  },
  centerText: {
    padding: 3
  },
  button: {
    paddingTop: 15
  },
  age: {
    paddingTop: 15,
  },
  dropdown: {
    verticalAlign: 'top',
    marginRight: 10,
    marginTop: 2,
    width: 160
  },
  tooYoungButton: {
    textAlign: 'right'
  }
};

const sessionStorageKey = 'anon_over13';

class SignInOrAgeDialog extends Component {
  state = {
    open: true,
    tooYoung: false,
  };

  static propTypes = {
    signedIn: PropTypes.bool.isRequired,
    age13Required: PropTypes.bool.isRequired,
  };

  onClickAgeOk = () => {
    const value = this.ageDropdown.getValue();
    // Ignore click if nothing selected
    if (!value) {
      return;
    }

    if (parseInt(value, 10) < 13) {
      this.setState({tooYoung: true});
      return;
    }

    sessionStorage.setItem(sessionStorageKey, true);

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
    const { signedIn, age13Required } = this.props;
    // Don't show dialog unless script requires 13+, we're not signed in, and
    // we haven't already given this dialog our age
    if (!age13Required || signedIn || sessionStorage.getItem(sessionStorageKey)) {
      return null;
    }

    if (this.state.tooYoung) {
      return (
        <BaseDialog
          useUpdatedStyles
          isOpen={true}
          uncloseable
        >
          <div style={styles.container}>
            <div style={styles.heading}>
              {i18n.tutorialUnavailable()}
            </div>
            <div style={styles.middle}>
              {i18n.tutorialUnavailableExplanation()}
            </div>
            <div style={styles.tooYoungButton}>
              <Button
                href={pegasus('/hourofcode/overview')}
                text="See all tutorials"
                color={Button.ButtonColor.orange}
              />
            </div>
          </div>
        </BaseDialog>
      );
    }

    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={this.state.open}
        uncloseable
      >
        <div style={styles.container}>
          <div style={styles.heading}>
            {i18n.signinOrAge()}
          </div>
          <div style={styles.middle}>
            <div style={styles.middleCell}>
              {i18n.signinForProgress()}
              <div style={styles.button}>
                <Button
                  href={`/users/sign_in?user_return_to=${location.pathname}`}
                  text={i18n.signinCodeOrg()}
                  color={Button.ButtonColor.gray}
                />
              </div>
            </div>
            <div style={styles.center}>
              <div style={styles.centerLine}/>
              <div style={styles.centerText}>
                {i18n.or()}
              </div>
              <div style={styles.centerLine}/>
            </div>
            <div style={styles.middleCell}>
              {i18n.provideAge()}
              <div style={styles.age}>
                <AgeDropdown
                  style={styles.dropdown}
                  ref={element => this.ageDropdown = element}
                />
                <Button
                  onClick={this.onClickAgeOk}
                  text={i18n.ok()}
                  color={Button.ButtonColor.gray}
                />
              </div>
            </div>
          </div>
          <div>
            <a href="https://code.org/privacy">{i18n.privacyPolicy()}</a>
          </div>
        </div>
      </BaseDialog>
    );
  }
}

export const UnconnectedSignInOrAgeDialog = SignInOrAgeDialog;

export default connect(state => ({
  age13Required: state.progress.isAge13Required,
  signedIn: state.progress.signInState === SignInState.SignedIn
}))(SignInOrAgeDialog);
