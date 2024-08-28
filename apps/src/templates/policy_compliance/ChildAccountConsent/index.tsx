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
import Button from '@cdo/apps/legacySharedComponents/Button';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import i18n from '@cdo/locale';
import './index.scss';

const reportEvent = (eventName: string, payload: object = {}) => {
  analyticsReporter.sendEvent(eventName, payload);
};

const returnToCdoButton = () => {
  return (
    <Button
      className="return-to-cdo"
      text={i18n.returnToCdo()}
      onClick={() => location.replace('/')}
    />
  );
};

const permissionGrantedMessage = (date: Date) => {
  // Get the current locale.
  const locale = cookies.get('language_') || 'en-US';
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const grantedDateString = i18n.childAccountConsentValidPermissionGranted({
    date: date.toLocaleDateString(locale, dateOptions),
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
};

const expiredTokenMessage = () => {
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
};

export interface ChildAccountConsentProps {
  permissionGranted?: boolean;
  permissionGrantedDate?: Date;
  studentId?: number;
}

const ChildAccountConsent: React.FC<ChildAccountConsentProps> = ({
  permissionGranted,
  permissionGrantedDate,
  studentId,
}) => {
  if (permissionGranted && permissionGrantedDate) {
    reportEvent(EVENTS.CAP_PARENT_CONSENT_GRANTED, {studentId: studentId});
    return permissionGrantedMessage(permissionGrantedDate);
  } else {
    reportEvent(EVENTS.CAP_PARENT_CONSENT_EXPIRED);
    return expiredTokenMessage();
  }
};

ChildAccountConsent.propTypes = {
  permissionGranted: PropTypes.bool,
  permissionGrantedDate: PropTypes.instanceOf(Date),
};

export default ChildAccountConsent;
