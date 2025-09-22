import React from 'react';

import {removeItemFromUserAddedContext} from '@cdo/apps/aichat/redux/slice';
import FilePreview from '@cdo/apps/aichat/views/assets/FilePreview';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import styles from './staged-files-preview.module.scss';

const UserAddedContextPreview: React.FunctionComponent = () => {
  const userAddedContext = useAppSelector(
    state => state.aichat.userAddedContext
  );
  const dispatch = useAppDispatch();

  if (!userAddedContext || Object.keys(userAddedContext).length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        {Object.keys(userAddedContext).map(displayName => (
          <FilePreview
            key={displayName}
            type={'text'}
            filename={displayName}
            isUploading={false}
            onRemove={() =>
              dispatch(removeItemFromUserAddedContext(displayName))
            }
          />
        ))}
      </div>
    </div>
  );
};

export default UserAddedContextPreview;
