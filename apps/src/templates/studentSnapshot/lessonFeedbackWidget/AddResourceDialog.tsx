import {Button} from '@code-dot-org/component-library/button';
import TextField from '@code-dot-org/component-library/textField';
import {Divider} from '@mui/material';
import React from 'react';

import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';

import styles from './lessonFeeedback.module.scss';

interface AddResourceDialogProps {
  tempResourceName: string;
  tempResourceLink: string;
  onResourceNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResourceLinkChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  onSave: () => void;
  onClose: () => void;
}

const AddResourceDialog: React.FC<AddResourceDialogProps> = ({
  tempResourceName,
  tempResourceLink,
  onResourceNameChange,
  onResourceLinkChange,
  onCancel,
  onSave,
  onClose,
}) => {
  return (
    <AccessibleDialog onClose={onClose}>
      <div className={styles.popUpContainer}>
        <TextField
          className={styles.resourceLinkInput}
          label="Resource name"
          name="resouce name"
          value={tempResourceName}
          onChange={onResourceNameChange}
        />
        <TextField
          className={styles.resourceLinkInput}
          label="Add a link to the resource"
          name="resouce link"
          value={tempResourceLink}
          onChange={onResourceLinkChange}
        />
        <Divider className={styles.resourcePopUpDivider} />
        <div className={styles.resourceLinkPopUpButtons}>
          <Button text="Cancel" type="secondary" onClick={onCancel} />
          <Button text="Save" onClick={onSave} />
        </div>
      </div>
    </AccessibleDialog>
  );
};

export default AddResourceDialog;
