import React, {Component} from 'react';
import {connect} from 'react-redux';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import color from '@cdo/apps/util/color';
import Button from '@cdo/apps/templates/Button';
import AgeDropdown from '@cdo/apps/templates/AgeDropdown';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import i18n from '@cdo/locale';
import PropTypes from 'prop-types';
import queryString from 'query-string';

const styles = {
  container: {
    margin: 20,
    color: color.charcoal
  },
  dancePartyHeading: {
    fontSize: 32,
    fontFamily: "'Gotham 7r', sans-serif"
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
    display: 'flex'
  },
  middleCell: {
    display: 'inline-block',
    verticalAlign: 'top',
    maxWidth: '50%'
  },
  age: {
    paddingTop: 15
  },
  dropdown: {
    verticalAlign: 'top',
    marginRight: 10,
    marginTop: 2,
    width: 160
  }
};

/*
 * SignInOrAgeDialog uses 'anon_over13' as its session storage key.
 * We want users seeing that dialog to have to input their age, so using
 * a different session storage key here.
 */
const AGE_DIALOG_SESSION_KEY = 'ad_anon_over13';

export const signedOutOver13 = () => {
  return sessionStorage.getItem(AGE_DIALOG_SESSION_KEY) === 'true';
};

class AgeDialog extends Component {
  state = {
    open: true
  };

  static propTypes = {
    signedIn: PropTypes.bool.isRequired,
    turnOffFilter: PropTypes.func.isRequired,
    storage: PropTypes.object.isRequired
  };

  static defaultProps = {
    storage: window.sessionStorage
  };

  setManualFilter = () => {
    this.setSessionStorage(false);
  };

  setSessionStorage = over13 => {
    this.props.storage.setItem(AGE_DIALOG_SESSION_KEY, over13);
    this.setState({open: false});
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
    const {signedIn, storage} = this.props;

    // Don't show dialog unless script requires 13+, we're not signed in, and
    // we haven't already given this dialog our age or we do not require sign-in
    if (signedIn || storage.getItem(AGE_DIALOG_SESSION_KEY)) {
      return null;
    }

    return (
      <BaseDialog useUpdatedStyles isOpen={this.state.open} uncloseable>
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
                    ref={element => (this.ageDropdown = element)}
                  />
                  <Button
                    __useDeprecatedTag
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
  signedIn: state.currentUser.signInState === SignInState.SignedIn
}))(AgeDialog);
