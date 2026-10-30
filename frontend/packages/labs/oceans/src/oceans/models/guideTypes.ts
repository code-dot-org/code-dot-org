import type {State} from '../state';

/**
 * A single guide entry describing when it should appear and what it says.
 * Both guidesHoc and guidesK5 use this shape.
 */
export interface GuideEntry {
  /** Unique identifier for this guide, used to track dismissals. */
  id: string;

  /**
   * Produces the display text for this guide.
   * May receive state for interpolating dynamic values.
   */
  textFn: (state?: State) => string;

  /**
   * Conditions that must all be true for this guide to appear.
   * Keys are state property names; 'fn' is a predicate over the full state.
   */
  when: {
    fn?: (state: State) => boolean;
    [key: string]: unknown;
  };

  /** Optional arrow direction string (e.g. 'LowerRight', 'UpperFarRight'). */
  arrow?: string;

  /** Optional style variant (e.g. 'Center', 'Info'). */
  style?: string;

  /** Optional image URL to display alongside the guide text. */
  image?: string;

  /** Optional CSS overrides for positioning the image. */
  imageStyle?: Record<string, string>;

  /** When true, skip dimming the background canvas behind the guide. */
  noDimBackground?: boolean;
}
