import {ExcalidrawElement} from '@excalidraw/excalidraw/types/element/types';
import {AppState, BinaryFiles} from '@excalidraw/excalidraw/types/types';

import {
  ExcalidrawSourceWithExternalFiles,
  ProjectSources,
} from '@cdo/apps/lab2/types';

export interface SerializedExcalidrawState {
  elements: ExcalidrawElement[];
  appState: AppState;
  files: BinaryFiles;
}

export interface SketchlabSources extends ProjectSources {
  source: ExcalidrawSourceWithExternalFiles;
}
