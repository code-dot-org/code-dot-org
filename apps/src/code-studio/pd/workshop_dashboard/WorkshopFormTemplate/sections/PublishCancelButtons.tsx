import {Button} from '@code-dot-org/component-library/button';
import React, {FC, memo} from 'react';

import {PublishCancelButtonsProps} from '../types';

export const PublishCancelButtons: FC<PublishCancelButtonsProps> = ({
  publish,
  cancel,
}) => {
  return (
    <div>
      <Button onClick={publish} text="Publish" />
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
