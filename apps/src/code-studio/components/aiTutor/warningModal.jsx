import React from 'react';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import Button from '@cdo/apps/templates/Button';
import {Heading3} from '@cdo/apps/componentLibrary/typography';

const onClose = () => {
  console.log('Closed!');
};

const WarningModal = () => {
  return (
    <AccessibleDialog onClose={onClose}>
      <div>
        <Heading3>I'm rendering the warning modal!</Heading3>
      </div>
      <Button onClick={onClose} text="Click Me!" />
    </AccessibleDialog>
  );
};

export default WarningModal;
