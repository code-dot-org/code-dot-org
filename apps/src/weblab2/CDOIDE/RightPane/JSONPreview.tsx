import {ProjectFile} from '@cdoide/types';
import {getErrorMessage} from '@cdoide/utils';
import React from 'react';

import './styles/jsonPreview.css';

type JSONPreviewProps = {
  file: ProjectFile;
};

export const JSONPreview = ({file}: JSONPreviewProps) => {
  let formatted = '';
  try {
    formatted = JSON.stringify(JSON.parse(file.contents), undefined, 2);
  } catch (e) {
    const msg = getErrorMessage(e);
    return (
      <div className="json-preview">
        Cannot display json: invalid format.
        {msg}
      </div>
    );
  }

  return <div className="json-preview">{formatted}</div>;
};
