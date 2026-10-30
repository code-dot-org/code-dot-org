import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import React, {FC, memo} from 'react';

import commonStyles from '../WorkshopForm.module.scss';

export interface PublishCancelButtonsProps {
  publish: () => void;
  cancel: () => void;
  loading: boolean;
}

export const PublishCancelButtons: FC<PublishCancelButtonsProps> = ({
  publish,
  cancel,
  loading,
}) => {
  return (
    <div className={classNames(commonStyles.row, commonStyles.formSubmitRow)}>
      <MuiButton
        variant="contained"
        color="primary"
        size="medium"
        loading={loading}
        onClick={publish}
        type="button"
      >
        {'Publish'}
      </MuiButton>
      <MuiButton
        variant="outlined"
        color="error"
        size="medium"
        onClick={cancel}
        aria-label="Go back to the previous page or the workshop dashboard"
        type="button"
      >
        {'Cancel and exit'}
      </MuiButton>
    </div>
  );
};

export default memo(PublishCancelButtons);
