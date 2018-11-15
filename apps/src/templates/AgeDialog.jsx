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
import queryString from "query-string";

const styles = {
  container: {
    margin: 20,
    color: color.charcoal
  },
  dancePartyHeading: {
    fontSize: 32,
    fontFamily: "'Gotham 7r', sans-serif",
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
  age: {
    paddingTop: 15,
  },
  dropdown: {
    verticalAlign: 'top',
    marginRight: 10,
    marginTop: 2,
    width: 160
  },
};

const sessionStorageKey = 'anon_over13';

class AgeDialog extends Component {
  state = {
    open: true
  };

  static propTypes = {
    signedIn: PropTypes.bool.isRequired,
    turnOffFilter: PropTypes.func.isRequired
  };

  setManualFilter = () => {
    this.setSessionStorage(false);
  };

  setSessionStorage = (over13) => {
    sessionStorage.setItem(sessionStorageKey, over13);

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

  componentDidMount() {
    // If the song filter override has been turned on, set session storage
    // Dialog won't render
    if (queryString.parse(window.location.search).songfilter === 'on') {
      this.setManualFilter();
    }
  }

  onClickAgeOk = () => {
    const value = this.ageDropdown.getValue();
    // Ignore click if nothing selected
    if (!value) {
      return;
    }

    // Sets cookie to true when anon user is 13+. False otherwise.
    const over13 = parseInt(value, 10) >= 13;
    this.setSessionStorage(over13);

    if (over13) {
      this.props.turnOffFilter();
    }
  };

  render() {
    const { signedIn} = this.props;

    // Don't show dialog unless script requires 13+, we're not signed in, and
    // we haven't already given this dialog our age or we do not require sign-in
    if (signedIn || sessionStorage.getItem(sessionStorageKey)) {
      return null;
    }

    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={this.state.open}
        uncloseable
      >
        <div style={styles.container} className="age-dialog">
          <div style={styles.dancePartyHeading}>
            {i18n.welcomeToDanceParty()}
          </div>
          <div>
            <div style={styles.middle}>
              <div style={styles.middleCell}>
                {i18n.provideAge()}
                <div style={styles.age}>
                  <AgeDropdown
                    style={styles.dropdown}
                    ref={element => this.ageDropdown = element}
                  />
                  <Button
                    id="uitest-submit-age"
                    onClick={this.onClickAgeOk}
                    text={i18n.ok()}
                    color={Button.ButtonColor.gray}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </BaseDialog>
    );
  }
}

export const UnconnectedAgeDialog = AgeDialog;

export default connect(state => ({
  signedIn: state.progress.signInState === SignInState.SignedIn
}))(AgeDialog);
