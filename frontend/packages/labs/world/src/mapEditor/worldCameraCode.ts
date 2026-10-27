// What a camera's inspector names: the main camera, and a camera trait's
// properties (specs/SPACE_CAMERAS_PLAN.md).

/** What a Viewport looks through when nothing says otherwise. */
export const MAIN_CAMERA = 'main';

/** One property of a camera trait, as a camera's inspector edits it. */
export interface CameraProperty {
  /** The `set` block's type, which is how a value is found. */
  setter: string;
  name: string;
  /** `actor`, `number`, `boolean`, `point` or `vector`. */
  type: string;
}
