import PropTypes from 'prop-types';
import React, {Component} from 'react';

import fontConstants from '@cdo/apps/fontConstants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import Dialog, {Body} from '@cdo/apps/legacySharedComponents/Dialog';
import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import {getStore} from '../redux';

import SchoolInfoInterstitial from './SchoolInfoInterstitial';

export const styles = {
  button: {
    marginTop: 20,
    marginLeft: '50%',
  },
  buttonRTL: {
    marginTop: 20,
    marginRight: '50%',
  },
  updateButton: {
    marginTop: 20,
    marginLeft: 5,
  },
  updateButtonRTL: {
    marginTop: 20,
    marginRight: 5,
  },
  intro: {
    fontSize: 18,
    ...fontConstants['main-font-semi-bold'],
    color: color.charcoal,
    paddingRight: 20,
  },
  schoolName: {
    color: color.purple,
    fontStyle: 'italic',
  },
  body: {
    margin: 10,
  },
};

class SchoolInfoConfirmationDialog extends Component {
  static propTypes = {
    schoolName: PropTypes.string,
    scriptData: PropTypes.shape({
      formUrl: PropTypes.string.isRequired,
      authTokenName: PropTypes.string.isRequired,
      authTokenValue: PropTypes.string.isRequired,
      existingSchoolInfo: PropTypes.shape({
        id: PropTypes.number,
        user_school_info_id: PropTypes.number,
        school_id: PropTypes.string,
        country: PropTypes.string,
        school_type: PropTypes.string,
        school_name: PropTypes.string,
        full_address: PropTypes.string,
      }).isRequired,
    }).isRequired,
    onClose: PropTypes.func,
    isOpen: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      showSchoolInterstitial: false,
      schoolName: props.scriptData.existingSchoolInfo.school_name,
      isOpen: props.isOpen || true,
    };
  }

  closeModal = () => {
    analyticsReporter.sendEvent(
      EVENTS.UPDATE_SCHOOL_INFO_DIALOG_CLOSED,
      {},
      PLATFORMS.BOTH
    );
    this.setState({isOpen: false});
    this.props.onClose();
  };

  handleClickYes = () => {
    analyticsReporter.sendEvent(
      EVENTS.CONFIRM_SCHOOL_CLICKED,
      {},
      PLATFORMS.BOTH
    );
    const {authTokenName, authTokenValue} = this.props.scriptData;
    const formData = new FormData();
    formData.append(authTokenName, authTokenValue);
    fetch(
      `/api/v1/user_school_infos/${this.props.scriptData.existingSchoolInfo.user_school_info_id}/update_last_confirmation_date`,
      {
        method: 'PATCH',
        body: formData,
      }
    )
      .then(this.closeModal)
      .catch(error => {
        this.setState({error});
      });
  };

  handleClickUpdate = () => {
    analyticsReporter.sendEvent(
      EVENTS.UPDATE_SCHOOL_CLICKED,
      {},
      PLATFORMS.BOTH
    );
    this.setState({showSchoolInterstitial: true});
  };

  renderInitialContent = () => {
    analyticsReporter.sendEvent(
      EVENTS.UPDATE_SCHOOL_INFO_DIALOG_SHOWN,
      {},
      PLATFORMS.BOTH
    );
    const {schoolName} = this.state;
    const isRTL = getStore().getState()?.isRtl;
    return (
      <Body>
        <div style={styles.body}>
          <p style={styles.intro}>
            {i18n.schoolInfoDialogDescription()}
            <span style={styles.schoolName}>
              {i18n.schoolInfoDialogDescriptionSchoolName({schoolName})}
            </span>
          </p>
        </div>
        <Button
          style={isRTL ? styles.updateButtonRTL : styles.updateButton}
          text={i18n.schoolInfoDialogUpdate()}
          color={Button.ButtonColor.blue}
          onClick={this.handleClickUpdate}
          id="update-button"
        />
        <Button
          style={isRTL ? styles.buttonRTL : styles.button}
          text={i18n.yes()}
          color={Button.ButtonColor.brandSecondaryDefault}
          onClick={this.handleClickYes}
          id="yes-button"
        />
      </Body>
    );
  };

  renderSchoolInformationForm() {
    return (
      <Body>
        <SchoolInfoInterstitial
          scriptData={this.props.scriptData}
          onClose={this.closeModal}
        />
      </Body>
    );
  }

  render() {
    const {showSchoolInterstitial, isOpen} = this.state;
    return (
      <Dialog isOpen={isOpen} handleClose={this.closeModal}>
        {!showSchoolInterstitial
          ? this.renderInitialContent()
          : this.renderSchoolInformationForm()}
      </Dialog>
    );
  }
}

export default SchoolInfoConfirmationDialog;
