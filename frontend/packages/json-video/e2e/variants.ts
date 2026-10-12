import {BuiltInControls} from './drivers/BuiltInControls';
import type {ControlsDriver} from './drivers/ControlsDriver';
import type {VideoPage} from './poms/VideoPage';

/** Each set of controls the shared specs in controls.spec.ts run against. */
export interface ControlsVariant {
  name: string;
  driver(videoPage: VideoPage): ControlsDriver;
}

export const VARIANTS: ControlsVariant[] = [
  {name: 'built-in', driver: ({video}) => new BuiltInControls(video)},
];
