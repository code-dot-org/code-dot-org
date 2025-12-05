import {ExcalidrawElement} from '@excalidraw/excalidraw/element/types';
import {AppState} from '@excalidraw/excalidraw/types';

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
