import React from 'react';

import {removeItemFromUserAddedSelectionContext} from '@cdo/apps/aichat/redux/slice';
import FilePreview from '@cdo/apps/aichat/views/assets/FilePreview';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import styles from './staged-files-preview.module.scss';

const UserAddedSelectionContextPreview: React.FunctionComponent = () => {
  const userAddedSelectionContext = useAppSelector(
    state => state.aichat.userAddedSelectionContext
  );
  const dispatch = useAppDispatch();

  if (
    !userAddedSelectionContext ||
    Object.keys(userAddedSelectionContext).length === 0
  ) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        {Object.entries(userAddedSelectionContext).map(
          ([displayName, contextItem]) => (
            <FilePreview
              key={displayName}
              type={'text'}
              filename={contextItem.filename}
              fileDetail={
                contextItem.lineReference
                  ? `(${contextItem.lineReference.start}-${contextItem.lineReference.end})`
                  : undefined
              }
              isUploading={false}
              onRemove={() =>
                dispatch(removeItemFromUserAddedSelectionContext(displayName))
              }
            />
          )
        )}
      </div>
    </div>
  );
};

export default UserAddedSelectionContextPreview;
