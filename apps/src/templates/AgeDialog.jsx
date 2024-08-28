import PropTypes from 'prop-types';
import queryString from 'query-string';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import fontConstants from '@cdo/apps/fontConstants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import AgeDropdown from '@cdo/apps/templates/AgeDropdown';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import {SignInState, setOver21} from '@cdo/apps/templates/currentUserRedux';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

/*
 * SignInOrAgeDialog uses 'anon_over13' as its session storage key.
 * We want users seeing that dialog to have to input their age, so using
 * a different session storage key here.
 */
const AGE_DIALOG_SESSION_KEY = 'ad_anon_over13';
const SONG_FILTER_SESSION_KEY = 'song_filter_on';

export const ageDialogSelectedOver13 = () => {
  return sessionStorage.getItem(AGE_DIALOG_SESSION_KEY) === 'true';
};

export const songFilterOn = () => {
  return sessionStorage.getItem(SONG_FILTER_SESSION_KEY) === 'true';
};

class AgeDialog extends Component {
  state = {
    open: true,
  };

  static propTypes = {
    signedIn: PropTypes.bool.isRequired,
    turnOffFilter: PropTypes.func.isRequired,
    storage: PropTypes.object.isRequired,
    unitName: PropTypes.string,
    setOver21: PropTypes.func.isRequired,
  };

  static defaultProps = {
    storage: window.sessionStorage,
  };

  setSessionStorage = over13 => {
    this.props.storage.setItem(AGE_DIALOG_SESSION_KEY, over13);
    this.setState({open: false});
  };

  componentDidMount() {
    // If the song filter override has been turned on, set session storage
    // Dialog won't render
    if (queryString.parse(window.location.search).songfilter === 'on') {
      this.props.storage.setItem(SONG_FILTER_SESSION_KEY, true);
      this.setState({open: false});
    }
  }

  onClickAgeOk = () => {
    const value = this.ageDropdown.getValue();
    // Ignore click if nothing selected
    if (!value) {
      return;
    }

    // Sets cookie to true when anon user is 13+. False otherwise.
    const age = parseInt(value, 10);
    const over13 = age >= 13;
    this.setSessionStorage(over13);

    if (over13) {
      this.props.turnOffFilter();
    }

    // Send Amplitude event when anon user is 21+.
    if (age >= 21) {
      analyticsReporter.sendEvent(EVENTS.AGE_21_SELECTED_EVENT, {
        unit_name: this.props.unitName,
        current_path: document.location.pathname,
      });
      this.props.setOver21(true);
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
                    id="uitest-submit-age"
                    onClick={this.onClickAgeOk}
                    text={i18n.ok()}
                    color={Button.ButtonColor.gray}
                    style={{margin: 0}}
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

const styles = {
  container: {
    margin: 20,
    color: color.charcoal,
  },
  dancePartyHeading: {
    fontSize: 32,
    ...fontConstants['main-font-bold'],
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
    width: 160,
  },
};

export const UnconnectedAgeDialog = AgeDialog;

export default connect(
  state => ({
    signedIn: state.currentUser.signInState === SignInState.SignedIn,
    unitName: state.progress.scriptName,
  }),
  dispatch => ({
    setOver21(over21) {
      dispatch(setOver21(over21));
    },
  })
)(AgeDialog);
