import React, {PropTypes} from 'react';
import i18n from '@cdo/locale';
import {OAuthSectionTypes} from "../../templates/teacherDashboard/shapes";
import Button, {ButtonColor, ButtonSize} from '../../templates/Button';

const PROVIDER_NAME = {
  [OAuthSectionTypes.clever]: i18n.loginTypeClever(),
  [OAuthSectionTypes.google_classroom]: i18n.loginTypeGoogleClassroom(),
};

export const READY = 'ready';
export const IN_PROGRESS = 'in-progress';
export const SUCCESS = 'success';
export const FAILURE = 'failure';

export class SyncOmniAuthSectionButton extends React.Component {
  static propTypes = {
    provider: PropTypes.oneOf(Object.values(OAuthSectionTypes)).isRequired,
    buttonState: PropTypes.oneOf([READY, IN_PROGRESS, SUCCESS, FAILURE]).isRequired,
    onClick: PropTypes.func.isRequired,
  };

  render() {
    const {buttonState, onClick} = this.props;
    const providerName = PROVIDER_NAME[this.props.provider];

    return (
      <Button
        text={buttonText(buttonState, providerName)}
        color={ButtonColor.white}
        size={ButtonSize.large}
        {...iconProps(buttonState)}
        disabled={buttonState === IN_PROGRESS}
        onClick={onClick}
      />
    );
  }
}

function buttonText(buttonState, providerName) {
  if (buttonState === IN_PROGRESS) {
    return i18n.loginTypeSyncButton_inProgress({providerName});
  } else if (buttonState === SUCCESS) {
    return i18n.loginTypeSyncButton_success({providerName});
  } else if (buttonState === FAILURE) {
    return i18n.loginTypeSyncButton_failure({providerName});
  }
  return i18n.loginTypeSyncButton({providerName});
}

function iconProps(buttonState) {
  if (buttonState === IN_PROGRESS) {
    return {
      icon: 'refresh',
      iconClassName: 'fa-spin fa-fw',
    };
  } else if (buttonState === FAILURE) {
    return {
      icon: 'exclamation-circle',
      iconClassName: 'fa-fw',
    };
  }
  return {};
}
