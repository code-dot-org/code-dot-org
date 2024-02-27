import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import {Heading3, Heading5} from '@cdo/apps/componentLibrary/typography';

export default function MoreDetailsDialog({hasValidation, onClose}) {
  return (
    <AccessibleDialog onClose={onClose}>
      <div role="region">
        <div>
          <Heading3>{i18n.progressTrackingIconKey()}</Heading3>
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
