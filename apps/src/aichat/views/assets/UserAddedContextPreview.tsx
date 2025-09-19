import React from 'react';

import FilePreview from './FilePreview';

interface UserAddedContextPreviewProps {
  addedContext: {displayName: string; id: string}[];
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
          filename={context.displayName}
          isUploading={false}
          onRemove={() => onRemoveContext(context.id)}
        />
      ))}
    </div>
  );
};

export default UserAddedContextPreview;
