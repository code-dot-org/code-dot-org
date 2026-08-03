// Editing a `.png` the project holds.
//
// Codebridge hands a custom editor the file's TEXT contents, which an image has
// none of: its bytes live on the file's `url` (UPLOADS.md). So this reads the
// file out of the sources itself, and writes an edit back the same way — as a
// new `data:` URL on the file, which is the shape an imported stock sprite
// already has (appearance/importStock). One consequence worth knowing: an
// edited image's bytes live in the project JSON rather than the assets backend,
// so editing an uploaded image moves it there.

import {useCallback, useMemo, useRef} from 'react';

import type {CustomEditorProps} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';
import {useSources} from '@code-dot-org/lab/contexts';

import {isBackgroundPath} from '../appearance/backgroundsFolder';
import {
  parseSheetFile,
  setImageSheet,
  sheetFileName,
  type SheetFile,
} from '../appearance/sheetFile';
import {filePath} from '../runtime/projectFiles';

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

  // A backdrop is not a grid of cells (BACKGROUNDS.md §5). It is stretched over
  // the whole viewport, so there is nothing a cell of one would mean — and a
  // `.sheet` written beside it would be a claim the animation editor believes.
  // So an image under `backgrounds/` is edited as the picture it is: no grid
  // drawn over it, and no controls offering to cut one.
  const isBackdrop = isBackgroundPath(filePath(currentSources.source, fileId));

  // The grid this image is cut into, if it has one: the `.sheet` beside it.
  // Read live (not held like the URL) — it is small, and the editor's own
  // controls are what change it.
  const sheet = useMemo((): SheetFile | undefined => {
    if (!file || isBackdrop) {
      return undefined;
    }
    const name = sheetFileName(file.name);
    const beside = Object.values(currentSources.source.files).find(
      candidate =>
        candidate.name === name && candidate.folderId === file.folderId,
    );
    return beside ? parseSheetFile(beside.contents) : undefined;
  }, [currentSources, file, isBackdrop]);

  const changeSheet = useCallback(
    (next: SheetFile | undefined) => {
      const sources = currentSources;
      const source = setImageSheet(sources.source, fileId, next);
      if (source !== sources.source) {
        updateSources({...sources, source});
      }
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
      sheet={sheet}
      // Absent for a backdrop, which is what hides the spritesheet controls:
      // `PixelEditor` renders them only for an editor that can change one.
      onSheetChange={isBackdrop ? undefined : changeSheet}
      onCommit={save}
    />
  );
};

export default ImageFileEditor;
