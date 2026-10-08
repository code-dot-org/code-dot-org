import {BuiltInControls} from './drivers/BuiltInControls';
import type {ControlsDriver} from './drivers/ControlsDriver';
import {CustomControls} from './drivers/CustomControls';
import type {VideoPage, VideoPageOptions} from './poms/VideoPage';

/** Each set of controls the shared specs in controls.spec.ts run against. */
export interface ControlsVariant {
  name: string;
  options: VideoPageOptions;
  driver(videoPage: VideoPage): ControlsDriver;
}

export const VARIANTS: ControlsVariant[] = [
  {
    name: 'built-in',
    options: {controls: 'builtin'},
    driver: ({video}) => new BuiltInControls(video),
  },
  {
    name: 'custom',
    options: {controls: 'custom'},
    driver: ({page}) => new CustomControls(page),
  },
];
