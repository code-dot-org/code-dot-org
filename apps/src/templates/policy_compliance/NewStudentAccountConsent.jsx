import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import * as color from '../../util/color';

function permissionGrantedMessage(date) {
  const grantedDateString = i18n.newStudentAccountConsentValidPermissionGranted(
    {
      date: date.toLocaleString(),
    }
  );
  return (
    <div style={styles.container}>
      <h2 style={styles.header}>
        {i18n.newStudentAccountConsentValidHeader()}
      </h2>
      <p>
        <strong>{i18n.newStudentAccountConsentValidPermission()} </strong>
        <span style={styles.grantDate}>{grantedDateString}</span>
      </p>
      <p>{i18n.newStudentAccountConsentValidMessage()}</p>
      <p>
        <em>{i18n.newStudentAccountConsentEmailUnknown()}</em>
      </p>
    </div>
  );
}

function expiredTokenMessage() {
  return (
    <div style={styles.container}>
      <h2 style={styles.header}>
        {i18n.newStudentAccountConsentExpiredHeader()}
      </h2>
      <p>{i18n.newStudentAccountConsentExpiredMessage()}</p>
      <p>
        <em>{i18n.newStudentAccountConsentEmailUnknown()}</em>
      </p>
    </div>
  );
}
export default function NewStudentAccountConsent(props) {
  if (props.permissionGranted) {
    return permissionGrantedMessage(props.permissionGrantedDate);
  } else {
    return expiredTokenMessage();
  }
}

NewStudentAccountConsent.propTypes = {
  permissionGranted: PropTypes.bool,
  permissionGrantedDate: PropTypes.object,
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
  header: {
    marginBottom: '10px',
  },
  grantDate: {
    color: color.bright_green,
  },
};
