import PropTypes from 'prop-types';
import React, {useState} from 'react';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';

import {Heading3, Heading5} from '@cdo/apps/componentLibrary/typography';

// import moduleStyle from './multiple-sections-assigner.module.scss';

export default function MoreDetailsDialog({hasValidation, onClose}) {
  return (
    <AccessibleDialog onClose={onClose}>
      <div role="region" aria-label={i18n.directionsForAssigningSections()}>
        <div>
          <Heading3>More Details</Heading3>
        </div>
        <div>
          <Heading5>Info info info</Heading5>
        </div>
      </div>
      <div>
        <Button
          text={i18n.dialogCancel()}
          onClick={onClose}
          color={Button.ButtonColor.neutralDark}
        />
      </div>
    </AccessibleDialog>
  );
}

MoreDetailsDialog.propTypes = {
  hasValidation: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};
