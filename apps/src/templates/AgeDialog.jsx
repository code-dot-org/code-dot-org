import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import Modal from '@code-dot-org/component-library/modal';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {ages} from '@cdo/apps/templates/AgeDropdown';
import {SignInState, setOver21} from '@cdo/apps/templates/currentUserRedux';
import i18n from '@cdo/locale';

import moduleStyles from './age-dialog.module.scss';

/*
 * SignInOrAgeDialog uses 'anon_over13' as its session storage key.
 * We want users seeing that dialog to have to input their age, so using
 * a different session storage key here.
 */
const AGE_DIALOG_SESSION_KEY = 'ad_anon_over13';
const SONG_FILTER_SESSION_KEY = 'song_filter_on';

const ageItems = ages.map(age => ({value: age, text: age}));

export const ageDialogSelectedOver13 = () => {
  return sessionStorage.getItem(AGE_DIALOG_SESSION_KEY) === 'true';
};

export const songFilterOn = () => {
  return sessionStorage.getItem(SONG_FILTER_SESSION_KEY) === 'true';
};

class AgeDialog extends Component {
  state = {
    open: true,
    age: '',
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

  onChangeAge = event => {
    this.setState({age: event.target.value});
  };

  onClickAgeOk = () => {
    const value = this.state.age;
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
    if (
      signedIn ||
      storage.getItem(AGE_DIALOG_SESSION_KEY) ||
      !this.state.open
    ) {
      return null;
    }

    // No onClose handler: the dialog is uncloseable, the user has to pick an age.
    return (
      <Modal
        className="age-dialog"
        title={i18n.welcomeToDanceParty()}
        description={i18n.provideAge()}
        customContent={
          <SimpleDropdown
            className={moduleStyles.ageDropdown}
            id="uitest-age-selector"
            name="age"
            labelText={i18n.age()}
            items={ageItems}
            selectedValue={this.state.age}
            onChange={this.onChangeAge}
          />
        }
        primaryButtonProps={{
          id: 'uitest-submit-age',
          children: i18n.ok(),
          onClick: this.onClickAgeOk,
        }}
      />
    );
  }
}

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
