import React from 'react';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import {Heading3} from '@cdo/apps/componentLibrary/typography';

const onClose = () => {
  console.log('Closed!');
};

const WarningModal = () => {
  return (
    <AccessibleDialog onClose={onClose} initialFocus={false}>
      <div>
        <Heading3>I'm rendering the warning modal!</Heading3>
      </div>
    </AccessibleDialog>
  );
};

export default WarningModal;
