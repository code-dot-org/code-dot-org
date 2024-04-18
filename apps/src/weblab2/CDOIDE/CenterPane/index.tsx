import {useCDOIDEContext} from '@cdoide/cdoIDEContext';
import React from 'react';

import DisabledEditor from './DisabledEditor';
import {FileNav} from './FileNav';
import './styles/centerPane.css';

export const CenterPane = React.memo(() => {
  const {config} = useCDOIDEContext();

  const EditorComponent = config.EditorComponent || DisabledEditor;

  return (
    <div className="center-pane">
      <div className="center-nav">
        <FileNav />
      </div>
      <div className="center-main">
        <EditorComponent />
      </div>
    </div>
  );
});
