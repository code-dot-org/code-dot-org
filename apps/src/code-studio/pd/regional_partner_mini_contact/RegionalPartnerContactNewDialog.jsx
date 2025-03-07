import {CustomDialog} from '@code-dot-org/component-library/dialog';
import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';

import RegionalPartnerContactForm from './RegionalPartnerContactForm';

import style from './regionalPartnerContactNewDialog.module.scss';

export default function RegionalPartnerContactNewDialog({
  notes,
  onClose,
  sourcePageId,
  zip,
}) {
  const [options, setOptions] = useState({
    user_name: '',
    email: '',
    zip: zip || '',
    notes: notes || '',
  });

  useEffect(() => {
    $.ajax({
      type: 'GET',
      url: '/dashboardapi/v1/users/me/contact_details',
    })
      .done(results => {
        setOptions(prev => ({
          ...prev,
          user_name: results.user_name || '',
          email: results.email || '',
          zip: zip || results.zip || '',
          notes: notes || results.notes || '',
        }));
      })
      .fail(() => {
        setOptions(prev => ({
          ...prev,
          zip: zip || '',
          notes: notes || '',
        }));
      });
  }, [zip, notes]);

  return (
    <CustomDialog
      onClose={onClose}
      closeLabel="close-contact-form-dialog"
      className={style.modalDialog}
    >
      <div className={style.miniContactContainer}>
        <RegionalPartnerContactForm
          options={options}
          apiEndpoint="/dashboardapi/v1/pd/regional_partner_mini_contacts/"
          sourcePageId={sourcePageId}
        />
      </div>
    </CustomDialog>
  );
}

RegionalPartnerContactNewDialog.propTypes = {
  notes: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  sourcePageId: PropTypes.string.isRequired,
  zip: PropTypes.string,
};
