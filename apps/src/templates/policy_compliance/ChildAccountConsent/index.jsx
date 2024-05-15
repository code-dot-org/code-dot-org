import cookies from 'js-cookie';
import PropTypes from 'prop-types';
import React from 'react';

import {
  Heading4,
  BodyThreeText,
  BodyTwoText,
  EmText,
  StrongText,
} from '@cdo/apps/componentLibrary/typography';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';

import './index.scss';

function returnToCdoButton() {
  return (
    <Button
      className="return-to-cdo"
      text={i18n.returnToCdo()}
      onClick={() => location.replace('/')}
    />
  );
}

function permissionGrantedMessage(date) {
  // Get the current locale.
  const locale = cookies.get('language_') || 'en-US';
  const dateOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const grantedDateString = i18n.childAccountConsentValidPermissionGranted({
    date: date.toLocaleDateString(locale, {...dateOptions}),
  });
  return (
    <div id="permission_granted_container">
      <Heading4>{i18n.childAccountConsentValidHeader()}</Heading4>
      <BodyTwoText className="permission-granted-date">
        <StrongText>{i18n.childAccountConsentValidPermission()} </StrongText>
        <StrongText className="date">{grantedDateString}</StrongText>
      </BodyTwoText>
      <BodyThreeText>{i18n.childAccountConsentValidMessage()}</BodyThreeText>
      <BodyThreeText>
        <EmText>{i18n.childAccountConsentEmailUnknown()}</EmText>
      </BodyThreeText>
      {returnToCdoButton()}
    </div>
  );
}

function expiredTokenMessage() {
  return (
    <div id="expired_token_container">
      <Heading4>{i18n.childAccountConsentExpiredHeader()}</Heading4>
      <BodyThreeText>{i18n.childAccountConsentExpiredMessage()}</BodyThreeText>
      <BodyThreeText>
        <EmText>{i18n.childAccountConsentEmailUnknown()}</EmText>
      </BodyThreeText>
      {returnToCdoButton()}
    </div>
  );
}
export default function ChildAccountConsent(props) {
  if (props.permissionGranted) {
    return permissionGrantedMessage(props.permissionGrantedDate);
  } else {
    return expiredTokenMessage();
  }
}

ChildAccountConsent.propTypes = {
  permissionGranted: PropTypes.bool,
  permissionGrantedDate: PropTypes.instanceOf(Date),
};
