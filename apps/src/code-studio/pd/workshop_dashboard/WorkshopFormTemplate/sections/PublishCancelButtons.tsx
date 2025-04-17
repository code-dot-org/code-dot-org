import {Button} from '@code-dot-org/component-library/button';
import classNames from 'classnames';
import React, {FC, memo} from 'react';

import {PublishCancelButtonsProps} from '../types';

import commonStyles from '../styles.module.scss';

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
      />
    </div>
  );
};

export default memo(PublishCancelButtons);
