import React from 'react';

import FilePreview from '@cdo/apps/aichat/views/assets/FilePreview';
import {UserAddedContext} from '@cdo/apps/aiTutor/types';

interface UserAddedContextPreviewProps {
  addedContext: UserAddedContext[];
  onRemoveContext: (id: string) => void;
}

const UserAddedContextPreview: React.FunctionComponent<
  UserAddedContextPreviewProps
> = ({addedContext, onRemoveContext}) => {
  return (
    <div>
      {addedContext.map((context, index) => (
        <FilePreview
          key={index}
          type={'text'}
          filename={context.filename}
          isUploading={false}
          onRemove={() => onRemoveContext(context.id)}
        />
      ))}
    </div>
  );
};

export default UserAddedContextPreview;
