import {Button} from '@code-dot-org/component-library/button';
import classNames from 'classnames';
import React, {FC, memo} from 'react';

import commonStyles from '../styles.module.scss';

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
      <Button onClick={publish} text="Publish" isPending={loading} />
      <Button
        onClick={cancel}
        text="Cancel and exit"
        type="secondary"
        color="destructive"
        aria-label="Go back to the previous page or the workshop dashboard"
      />
    </div>
  );
};

export default memo(PublishCancelButtons);
