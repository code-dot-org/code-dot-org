import {LevelProperties} from '@cdo/apps/lab2/types';

export interface Weblab2LevelProperties extends LevelProperties {
  widgetView?: boolean;
  initialViewMode?: ViewMode;
  aiTutorMode?: string;
}

export enum ViewMode {
  SPLIT = 'split',
  CODE = 'code',
  PREVIEW = 'preview',
}
