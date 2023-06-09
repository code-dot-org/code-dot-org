import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import * as color from '../../util/color';
import cookies from 'js-cookie';
import {
  Heading1,
  BodyOneText,
  EmText,
  StrongText,
} from '@cdo/apps/componentLibrary/typography';

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
    <div id="permission_granted_container" style={styles.container}>
      <Heading1 visualAppearance="heading-lg">
        {i18n.childAccountConsentValidHeader()}
      </Heading1>
      <BodyOneText>
        <StrongText>{i18n.childAccountConsentValidPermission()} </StrongText>
        <span style={styles.grantDate}>{grantedDateString}</span>
      </BodyOneText>
      <BodyOneText>{i18n.childAccountConsentValidMessage()}</BodyOneText>
      <BodyOneText>
        <EmText>{i18n.childAccountConsentEmailUnknown()}</EmText>
      </BodyOneText>
    </div>
  );
}

function expiredTokenMessage() {
  return (
    <div id="expired_token_container" style={styles.container}>
      <Heading1 visualAppearance="heading-lg">
        {i18n.childAccountConsentExpiredHeader()}
      </Heading1>
      <BodyOneText>{i18n.childAccountConsentExpiredMessage()}</BodyOneText>
      <BodyOneText>
        <EmText>{i18n.childAccountConsentEmailUnknown()}</EmText>
      </BodyOneText>
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

const styles = {
  container: {
    border: '1px solid rgb(233 233 233)',
    boxShadow: '5px 5px 3px 0px #ccc',
    boxSizing: 'border-box',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 10,
    maxWidth: 700,
    padding: 20,
  },
  grantDate: {
    color: color.bright_green,
  },
};
