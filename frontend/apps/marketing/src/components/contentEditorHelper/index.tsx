import {Suspense} from 'react';

import ContentEditorHelper, {
  ContentEditorToolsProps,
} from './ContentEditorHelper';

const ContentEditorHelperWrapper = (props: ContentEditorToolsProps) => {
  return (
    <Suspense>
      <ContentEditorHelper {...props} />
    </Suspense>
  );
};

export default ContentEditorHelperWrapper;
