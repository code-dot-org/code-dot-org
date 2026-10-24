// A screen, opened: the map editor over the screen, which is a map document
// with the game's values beside it on the Main Screen
// (specs/SCREEN_MAP_PLAN.md, step 4). Its own workspace is the third view,
// as a map's is, and holds the game's hats.

import {useMemo} from 'react';

import type {CustomEditorProps} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';
import {useSources} from '@code-dot-org/lab/contexts';

import {filePath} from '../runtime/projectFiles';

import {MapEditor} from './MapEditor';
import {screenDocumentFor} from './worldDocument';

export const ScreenEditor = (props: CustomEditorProps) => {
  const {currentSources} = useSources<MultiFileSource>();
  const path = filePath(currentSources.source, props.fileId) ?? '';
  const document = useMemo(() => screenDocumentFor(path), [path]);
  return <MapEditor {...props} document={document} />;
};

export default ScreenEditor;
