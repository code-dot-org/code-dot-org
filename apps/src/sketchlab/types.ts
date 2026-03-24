import {ExcalidrawElement} from '@excalidraw/excalidraw/types/element/types';
import {AppState} from '@excalidraw/excalidraw/types/types';
import {TLEditorSnapshot} from 'tldraw';

import {
  ExcalidrawSourceWithExternalFiles,
  ExcalidrawFilesWithOptionalData,
  ProjectSources,
} from '@cdo/apps/lab2/types';

export interface SerializedExcalidrawState {
  elements: ExcalidrawElement[];
  appState: AppState;
  files: ExcalidrawFilesWithOptionalData;
}

export interface SketchlabSources extends ProjectSources {
  source: ExcalidrawSourceWithExternalFiles;
}

export interface SketchlabTldrawSources extends ProjectSources {
  source: TLEditorSnapshot;
}
