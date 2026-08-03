// Editing a `.png` the project holds.
//
// Codebridge hands a custom editor the file's TEXT contents, which an image has
// none of: its bytes live on the file's `url` (UPLOADS.md). So this reads the
// file out of the sources itself, and writes an edit back the same way — as a
// new `data:` URL on the file, which is the shape an imported stock sprite
// already has (appearance/importStock). One consequence worth knowing: an
// edited image's bytes live in the project JSON rather than the assets backend,
// so editing an uploaded image moves it there.

import {useCallback, useRef} from 'react';

import type {CustomEditorProps} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';
import {useSources} from '@code-dot-org/lab/contexts';

import PixelEditor from './PixelEditor';

export const ImageFileEditor = ({fileId, isReadOnly}: CustomEditorProps) => {
  const {currentSources, updateSources} = useSources<MultiFileSource>();
  const file = currentSources.source.files[fileId];

  const save = useCallback(
    (dataUri: string) => {
      const sources = currentSources;
      const current = sources.source.files[fileId];
      if (!current) {
        return;
      }
      updateSources({
        ...sources,
        source: {
          ...sources.source,
          files: {
            ...sources.source.files,
            [fileId]: {...current, url: dataUri, mimeType: 'image/png'},
          },
        },
      });
    },
    [currentSources, fileId, updateSources],
  );

  // The URL the editor opened with, held for the life of this file's editor.
  // Following the file's `url` instead would hand the editor back the image it
  // has just drawn, on every save — reloading the canvas mid-stroke. Codebridge
  // keys this component by file id, so a different file is a different mount.
  const openedWith = useRef(file?.url);
  if (!openedWith.current) {
    return null;
  }

  return (
    <PixelEditor
      title={file?.name ?? ''}
      imageUrl={openedWith.current}
      isReadOnly={isReadOnly}
      onCommit={save}
    />
  );
};

export default ImageFileEditor;
